
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
    logStep("Event verified", { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id, customerId: session.customer });
        
        if (session.customer && session.mode === 'subscription') {
          const customerId = session.customer as string;
          
          // Get customer details
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          if (!customer.email) break;
          
          // Find user by email
          const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', customer.email)
            .limit(1);
            
          if (!profiles || profiles.length === 0) {
            logStep("No user found for email", { email: customer.email });
            break;
          }
          
          const userId = profiles[0].id;
          
          // Get subscription details
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1
          });
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            
            // Update user profile to active pro subscription
            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_tier: 'pro',
                subscription_type: 'paid',
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
              
            if (updateError) {
              logStep("Error updating user profile", { error: updateError });
            } else {
              logStep("User profile updated successfully", { userId, subscriptionId: subscription.id });
            }
          }
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (!customer.email) break;
        
        // Find user by email
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .limit(1);
          
        if (!profiles || profiles.length === 0) break;
        
        const userId = profiles[0].id;
        
        if (event.type === 'customer.subscription.deleted' || subscription.status !== 'active') {
          // Subscription cancelled or inactive
          await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'expired',
              subscription_tier: 'free',
              subscription_type: 'expired',
              subscription_end_date: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          logStep("Subscription cancelled", { userId, subscriptionId: subscription.id });
        } else {
          // Subscription updated
          await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_tier: 'pro',
              subscription_type: 'paid',
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          logStep("Subscription updated", { userId, subscriptionId: subscription.id });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (!customer.email) break;
        
        // Find user by email
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .limit(1);
          
        if (!profiles || profiles.length === 0) break;
        
        const userId = profiles[0].id;
        
        // If this is a subscription invoice, ensure user has active status
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_tier: 'pro',
              subscription_type: 'paid',
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
            
          logStep("Payment succeeded, subscription renewed", { userId, subscriptionId: subscription.id });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (!customer.email) break;
        
        // Find user by email
        const { data: profiles } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', customer.email)
          .limit(1);
          
        if (!profiles || profiles.length === 0) break;
        
        const userId = profiles[0].id;
        
        logStep("Payment failed for user", { userId, customerId });
        // Note: We don't immediately cancel on payment failure as Stripe has retry logic
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
