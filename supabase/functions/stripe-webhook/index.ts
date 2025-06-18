
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
    logStep("Webhook verified successfully", { type: event.type, id: event.id });

    // Process the event using the enhanced database function
    const { data: processResult, error: processError } = await supabaseClient.rpc('process_webhook_event', {
      event_id: event.id,
      event_type: event.type,
      event_data: event as any
    });

    if (processError) {
      logStep("Error in webhook processing", { error: processError });
      throw processError;
    }

    logStep("Webhook processing completed", { result: processResult });

    // For subscription events, also perform additional sync with fresh Stripe data
    if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      await handleSubscriptionEventWithFreshData(event, stripe, supabaseClient);
    }

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      event_id: event.id,
      event_type: event.type,
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
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      received: true,
      processed: false,
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
      return;
    }
    
    logStep("Customer retrieved", { email: customer.email, customerId });
    
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
    } else {
      logStep("Subscription sync completed successfully", { result: syncResult });
    }
  } catch (error) {
    logStep("Error in handleSubscriptionEventWithFreshData", { 
      error: error instanceof Error ? error.message : String(error),
      eventType: event.type
    });
  }
}
