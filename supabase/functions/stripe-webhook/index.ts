
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      logStep("ERROR: Missing required environment variables");
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No Stripe signature found");
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook verified", { type: event.type });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the webhook event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription event", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status 
        });

        // Get user by customer ID
        const { data: userData, error: userError } = await supabaseClient
          .rpc('get_user_by_stripe_customer', { 
            customer_id: subscription.customer as string 
          });

        if (userError || !userData || userData.length === 0) {
          logStep("ERROR: User not found for customer", { customerId: subscription.customer });
          throw new Error("User not found for this customer");
        }

        const user = userData[0];
        logStep("Found user", { userId: user.user_id, email: user.email });

        // Determine subscription tier from price
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        
        let subscriptionTier = 'free';
        const amount = price.unit_amount || 0;
        if (amount >= 499) { // $4.99 or more
          subscriptionTier = 'pro';
        }

        // Update user's subscription status
        const { error: updateError } = await supabaseClient
          .rpc('update_subscription_status', {
            target_user_id: user.user_id,
            new_subscription_status: subscription.status === 'active' ? 'active' : 'expired',
            new_subscription_tier: subscriptionTier,
            new_stripe_customer_id: subscription.customer as string,
            new_stripe_subscription_id: subscription.id,
            new_stripe_price_id: priceId,
            new_subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            new_subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
          });

        if (updateError) {
          logStep("ERROR: Failed to update user subscription", { error: updateError });
          throw updateError;
        }

        logStep("Successfully updated user subscription", { 
          userId: user.user_id,
          tier: subscriptionTier,
          status: subscription.status 
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deletion", { subscriptionId: subscription.id });

        // Get user by customer ID
        const { data: userData, error: userError } = await supabaseClient
          .rpc('get_user_by_stripe_customer', { 
            customer_id: subscription.customer as string 
          });

        if (userError || !userData || userData.length === 0) {
          logStep("WARNING: User not found for deleted subscription", { customerId: subscription.customer });
          break;
        }

        const user = userData[0];

        // Update user to expired status
        const { error: updateError } = await supabaseClient
          .rpc('update_subscription_status', {
            target_user_id: user.user_id,
            new_subscription_status: 'expired',
            new_subscription_tier: 'free',
            new_stripe_customer_id: subscription.customer as string,
            new_stripe_subscription_id: null,
            new_stripe_price_id: null,
            new_subscription_start_date: null,
            new_subscription_end_date: null
          });

        if (updateError) {
          logStep("ERROR: Failed to update user subscription to expired", { error: updateError });
          throw updateError;
        }

        logStep("Successfully marked subscription as expired", { userId: user.user_id });
        break;
      }

      default:
        logStep("Unhandled webhook event", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
