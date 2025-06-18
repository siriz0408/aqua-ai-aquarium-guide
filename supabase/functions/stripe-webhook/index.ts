
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
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Stripe keys not configured");
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

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Event verified", { type: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id, customerId: session.customer });
        
        if (session.customer && session.subscription) {
          await handleSubscriptionActivated(supabaseClient, stripe, session.customer as string, session.subscription as string);
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment succeeded", { invoiceId: invoice.id, customerId: invoice.customer });
        
        if (invoice.customer && invoice.subscription) {
          await handleSubscriptionActivated(supabaseClient, stripe, invoice.customer as string, invoice.subscription as string);
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription updated/deleted", { subscriptionId: subscription.id, status: subscription.status });
        
        await handleSubscriptionChange(supabaseClient, stripe, subscription);
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleSubscriptionActivated(
  supabaseClient: any,
  stripe: Stripe,
  customerId: string,
  subscriptionId: string
) {
  try {
    logStep("Handling subscription activation", { customerId, subscriptionId });
    
    // Get customer details
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      throw new Error("Customer not found or deleted");
    }
    
    const customerEmail = customer.email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }
    
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    
    logStep("Subscription details", {
      status: subscription.status,
      priceId,
      currentPeriodEnd,
      currentPeriodStart
    });

    // Update user profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
        subscription_tier: 'pro',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        subscription_start_date: currentPeriodStart,
        subscription_end_date: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('email', customerEmail);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Update subscribers table
    const { error: subscriberError } = await supabaseClient
      .from('subscribers')
      .upsert({
        email: customerEmail,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscribed: subscription.status === 'active',
        subscription_tier: 'pro',
        subscription_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (subscriberError) {
      throw new Error(`Failed to update subscriber: ${subscriberError.message}`);
    }

    logStep("Profile and subscriber updated successfully", { email: customerEmail });
  } catch (error) {
    logStep("Error handling subscription activation", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionChange(
  supabaseClient: any,
  stripe: Stripe,
  subscription: Stripe.Subscription
) {
  try {
    logStep("Handling subscription change", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      customerId: subscription.customer 
    });
    
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted) {
      throw new Error("Customer not found or deleted");
    }
    
    const customerEmail = customer.email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    const isActive = subscription.status === 'active';
    const currentPeriodEnd = subscription.current_period_end ? 
      new Date(subscription.current_period_end * 1000).toISOString() : null;

    // Update profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        subscription_status: isActive ? 'active' : subscription.status,
        subscription_tier: isActive ? 'pro' : 'free',
        subscription_end_date: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('email', customerEmail);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    // Update subscribers table
    const { error: subscriberError } = await supabaseClient
      .from('subscribers')
      .update({
        subscribed: isActive,
        subscription_tier: isActive ? 'pro' : 'free',
        subscription_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('email', customerEmail);

    if (subscriberError) {
      throw new Error(`Failed to update subscriber: ${subscriberError.message}`);
    }

    logStep("Subscription change processed successfully", { email: customerEmail, status: subscription.status });
  } catch (error) {
    logStep("Error handling subscription change", { error: error.message });
    throw error;
  }
}
