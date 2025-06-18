
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper logging function for enhanced debugging
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

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
    
    // Get the signature from the header
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Get the raw body
    const body = await req.text();
    logStep("Raw body received", { bodyLength: body.length });

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type, eventId: event.id });
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Extract relevant data from the event
    let customerId: string | null = null;
    let subscriptionId: string | null = null;
    
    // Handle different event types to extract customer and subscription IDs
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        customerId = subscription.customer as string;
        subscriptionId = subscription.id;
        break;
        
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        customerId = invoice.customer as string;
        subscriptionId = invoice.subscription as string;
        break;
        
      case 'customer.created':
      case 'customer.updated':
        const customer = event.data.object as Stripe.Customer;
        customerId = customer.id;
        break;
    }

    logStep("Event data extracted", { 
      eventType: event.type, 
      customerId, 
      subscriptionId 
    });

    // Process the webhook using our database function
    const { data, error } = await supabaseClient.rpc('process_stripe_webhook', {
      event_id: event.id,
      event_type: event.type,
      customer_id: customerId,
      subscription_id: subscriptionId,
      event_data: event as any
    });

    if (error) {
      console.error("Error processing webhook:", error);
      return new Response(`Webhook processing failed: ${error.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    logStep("Webhook processed successfully", { result: data });

    return new Response(JSON.stringify({ received: true, processed: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
