
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
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
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook verified", { eventType: event.type, eventId: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout session completed", { sessionId: session.id });
        
        if (session.mode === "subscription" && session.subscription && session.customer) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customer = await stripe.customers.retrieve(session.customer as string);
          
          if (customer.deleted) {
            logStep("Customer was deleted, skipping");
            break;
          }
          
          const customerEmail = (customer as Stripe.Customer).email;
          if (!customerEmail) {
            logStep("No customer email found");
            break;
          }

          // Get user by email
          const { data: userData, error: userError } = await supabaseClient
            .rpc('get_user_by_email', { user_email: customerEmail });
          
          if (userError || !userData) {
            logStep("User not found", { email: customerEmail, error: userError });
            break;
          }

          // Update user profile with subscription info
          const subscriptionEnd = new Date(subscription.current_period_end * 1000);
          const subscriptionStart = new Date(subscription.current_period_start * 1000);
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_status: 'active',
              subscription_tier: 'pro',
              subscription_start_date: subscriptionStart.toISOString(),
              subscription_end_date: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userData);

          if (updateError) {
            logStep("Failed to update user profile", { error: updateError });
          } else {
            logStep("Successfully updated user subscription", { 
              userId: userData, 
              customerId: session.customer,
              subscriptionId: subscription.id 
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription updated", { subscriptionId: subscription.id });
        
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) {
          logStep("Customer was deleted, skipping");
          break;
        }
        
        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          logStep("No customer email found");
          break;
        }

        // Get user by email
        const { data: userData, error: userError } = await supabaseClient
          .rpc('get_user_by_email', { user_email: customerEmail });
        
        if (userError || !userData) {
          logStep("User not found", { email: customerEmail, error: userError });
          break;
        }

        let subscriptionStatus = 'free';
        let subscriptionTier = 'free';
        let subscriptionEnd = null;

        if (subscription.status === 'active') {
          subscriptionStatus = 'active';
          subscriptionTier = 'pro';
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          subscriptionStatus = 'expired';
          subscriptionTier = 'free';
        }

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: subscriptionStatus,
            subscription_tier: subscriptionTier,
            subscription_end_date: subscriptionEnd,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData);

        if (updateError) {
          logStep("Failed to update subscription status", { error: updateError });
        } else {
          logStep("Successfully updated subscription status", { 
            userId: userData, 
            status: subscriptionStatus 
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deleted", { subscriptionId: subscription.id });
        
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (customer.deleted) {
          logStep("Customer was deleted, skipping");
          break;
        }
        
        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          logStep("No customer email found");
          break;
        }

        // Get user by email
        const { data: userData, error: userError } = await supabaseClient
          .rpc('get_user_by_email', { user_email: customerEmail });
        
        if (userError || !userData) {
          logStep("User not found", { email: customerEmail, error: userError });
          break;
        }

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'expired',
            subscription_tier: 'free',
            subscription_end_date: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData);

        if (updateError) {
          logStep("Failed to update subscription cancellation", { error: updateError });
        } else {
          logStep("Successfully updated subscription cancellation", { userId: userData });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Webhook error", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
