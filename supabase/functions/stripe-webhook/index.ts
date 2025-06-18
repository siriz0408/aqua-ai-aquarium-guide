
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

    // Store webhook event in enhanced tracking table
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
        processResult = await handleSubscriptionEventWithFreshData(event, stripe, supabaseClient);
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

async function handleSubscriptionEventWithFreshData(
  event: Stripe.Event, 
  stripe: Stripe, 
  supabaseClient: any
) {
  try {
    logStep("Processing subscription event with fresh Stripe data", { eventType: event.type });
    
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    // Get fresh customer data from Stripe API
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
    
    // First ensure profile exists using our database function
    const { error: ensureError } = await supabaseClient.rpc('ensure_user_profile', {
      user_id: null // We don't have the user_id here, so the function will need to handle email lookup
    });
    
    if (ensureError) {
      logStep("Error ensuring profile exists", { error: ensureError });
    }
    
    // Try to find and update the profile with stripe_customer_id
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('email', customer.email)
      .single();
    
    if (profile) {
      // Update the profile with stripe_customer_id if not already set
      if (!profile.stripe_customer_id || profile.stripe_customer_id !== customerId) {
        await supabaseClient
          .from('profiles')
          .update({ 
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        logStep("Updated profile with stripe_customer_id", { 
          profileId: profile.id, 
          customerId 
        });
      }
    } else {
      logStep("No profile found for email", { 
        email: customer.email,
        profileError: profileError?.message 
      });
      
      // Profile doesn't exist, we'll let the sync function handle this case
    }
    
    // Get fresh subscription data from Stripe API
    const freshSubscription = await stripe.subscriptions.retrieve(subscription.id);
    
    logStep("Fresh subscription data retrieved", { 
      subscriptionId: freshSubscription.id,
      status: freshSubscription.status,
      currentPeriodEnd: freshSubscription.current_period_end
    });
    
    // Use the enhanced sync function with fresh data
    const { data: syncResult, error: syncError } = await supabaseClient.rpc('sync_user_subscription_from_stripe', {
      user_email: customer.email,
      stripe_customer_id: customerId,
      stripe_subscription_id: freshSubscription.id,
      subscription_status: freshSubscription.status,
      subscription_tier: 'pro',
      current_period_end: new Date(freshSubscription.current_period_end * 1000).toISOString()
    });
    
    if (syncError) {
      logStep("Error in subscription sync", { error: syncError });
      
      // If sync failed due to missing user, we can't do much more from here
      // The sync function should handle user creation/profile management
      return {
        success: false,
        error: `Sync failed: ${syncError.message}`,
        userEmail: customer.email,
        customerId,
        subscriptionId: freshSubscription.id
      };
    } else {
      logStep("Subscription sync completed successfully", { result: syncResult });
      
      return {
        success: true,
        message: 'Subscription processed successfully',
        userEmail: customer.email,
        customerId,
        subscriptionId: freshSubscription.id
      };
    }
  } catch (error) {
    logStep("Error in handleSubscriptionEventWithFreshData", { 
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
