
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK-ENHANCED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Enhanced webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event verified and enhanced processing started", { type: event.type, id: event.id });

    // Use the new enhanced webhook processing function
    const { data: processResult, error: processError } = await supabaseClient.rpc('process_webhook_event', {
      event_id: event.id,
      event_type: event.type,
      event_data: event as any
    });

    if (processError) {
      logStep("Error in enhanced webhook processing", { error: processError });
      throw processError;
    }

    logStep("Enhanced webhook processing completed", { result: processResult });

    // For subscription events, also sync directly with Stripe API to ensure accuracy
    if (['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      await handleSubscriptionEventWithStripeSync(event, stripe, supabaseClient);
    }

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      result: processResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in enhanced stripe-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      received: true,
      processed: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleSubscriptionEventWithStripeSync(
  event: Stripe.Event, 
  stripe: Stripe, 
  supabaseClient: any
) {
  try {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    // Get fresh customer data from Stripe
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (!customer.email) {
      logStep("No email found for customer", { customerId });
      return;
    }
    
    // Get fresh subscription data from Stripe
    const freshSubscription = await stripe.subscriptions.retrieve(subscription.id);
    
    logStep("Syncing with fresh Stripe data", { 
      email: customer.email, 
      subscriptionStatus: freshSubscription.status,
      subscriptionId: freshSubscription.id 
    });
    
    // Use the enhanced sync function
    const { data: syncResult, error: syncError } = await supabaseClient.rpc('sync_user_subscription_from_stripe', {
      user_email: customer.email,
      stripe_customer_id: customerId,
      stripe_subscription_id: freshSubscription.id,
      subscription_status: freshSubscription.status,
      subscription_tier: 'pro',
      current_period_end: new Date(freshSubscription.current_period_end * 1000).toISOString()
    });
    
    if (syncError) {
      logStep("Error in Stripe sync", { error: syncError });
    } else {
      logStep("Stripe sync completed successfully", { result: syncResult });
    }
  } catch (error) {
    logStep("Error in handleSubscriptionEventWithStripeSync", { error: error.message });
  }
}
