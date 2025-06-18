
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details, null, 2)}` : '';
  console.log(`[${timestamp}] [STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let eventId = 'unknown';
  let eventType = 'unknown';

  try {
    logStep("Webhook received", { 
      method: req.method, 
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    // Use service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("ERROR: No Stripe signature found");
      throw new Error("No Stripe signature found");
    }

    logStep("Verifying webhook signature");
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    eventId = event.id;
    eventType = event.type;
    
    logStep("Webhook verified successfully", { type: event.type, id: event.id });

    // Store webhook event for monitoring
    await supabaseClient
      .from('webhook_events')
      .upsert({
        stripe_event_id: eventId,
        event_type: eventType,
        processing_status: 'processing',
        raw_data: event,
        created_at: new Date().toISOString()
      }, { onConflict: 'stripe_event_id' });

    // Process different event types
    let processResult;
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        processResult = await handleSubscriptionEvent(event, stripe, supabaseClient);
        break;
      
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        processResult = await handleInvoiceEvent(event, stripe, supabaseClient);
        break;
      
      default:
        logStep("Unsupported event type", { type: event.type });
        processResult = { success: true, message: 'Event type not processed' };
    }

    // Update webhook event status
    await supabaseClient
      .from('webhook_events')
      .update({
        processing_status: processResult.success ? 'completed' : 'failed',
        error_message: processResult.success ? null : processResult.error,
        processed_at: new Date().toISOString(),
        user_email: processResult.userEmail,
        customer_id: processResult.customerId,
        subscription_id: processResult.subscriptionId
      })
      .eq('stripe_event_id', eventId);

    logStep("Webhook processing completed", { result: processResult });

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      event_id: eventId,
      event_type: eventType,
      result: processResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Update webhook event with error if we have an eventId
    if (eventId !== 'unknown') {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        
        await supabaseClient
          .from('webhook_events')
          .upsert({
            stripe_event_id: eventId,
            event_type: eventType,
            processing_status: 'failed',
            error_message: errorMessage,
            processed_at: new Date().toISOString()
          }, { onConflict: 'stripe_event_id' });
      } catch (dbError) {
        logStep("Failed to update webhook event with error", { dbError });
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      received: true,
      processed: false,
      event_id: eventId,
      event_type: eventType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleSubscriptionEvent(
  event: Stripe.Event, 
  stripe: Stripe, 
  supabaseClient: any
) {
  try {
    logStep("Processing subscription event", { eventType: event.type });
    
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    // Get customer data from Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (!customer.email) {
      logStep("No email found for customer", { customerId });
      return {
        success: false,
        error: `No email found for customer ${customerId}`,
        customerId
      };
    }
    
    logStep("Customer retrieved", { email: customer.email, customerId });
    
    // Use the simplified sync function
    const { data: syncResult, error: syncError } = await supabaseClient.rpc('sync_stripe_subscription', {
      customer_email: customer.email,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      price_id: subscription.items.data[0]?.price?.id || null
    });
    
    if (syncError) {
      logStep("Error in subscription sync", { error: syncError });
      return {
        success: false,
        error: `Sync failed: ${syncError.message}`,
        userEmail: customer.email,
        customerId,
        subscriptionId: subscription.id
      };
    } else {
      logStep("Subscription sync completed successfully", { result: syncResult });
      return {
        success: true,
        message: 'Subscription processed successfully',
        userEmail: customer.email,
        customerId,
        subscriptionId: subscription.id
      };
    }
  } catch (error) {
    logStep("Error in handleSubscriptionEvent", { 
      error: error instanceof Error ? error.message : String(error),
      eventType: event.type
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function handleInvoiceEvent(
  event: Stripe.Event, 
  stripe: Stripe, 
  supabaseClient: any
) {
  try {
    logStep("Processing invoice event", { eventType: event.type });
    
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    
    // Get customer data from Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (!customer.email) {
      throw new Error(`No email found for customer ${customerId}`);
    }
    
    logStep("Invoice event processed", { 
      invoiceId: invoice.id,
      status: invoice.status,
      userEmail: customer.email 
    });
    
    return { 
      success: true, 
      message: 'Invoice processed successfully',
      userEmail: customer.email,
      customerId
    };
  } catch (error) {
    logStep("Error in handleInvoiceEvent", { 
      error: error instanceof Error ? error.message : String(error),
      eventType: event.type
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
