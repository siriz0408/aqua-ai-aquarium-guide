
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified", { keyPrefix: stripeKey.substring(0, 7) });

    // Get request body
    const { userId, email, priceId } = await req.json();
    logStep("Request data received", { userId, email, priceId });

    // Validate required fields
    if (!userId || !email) {
      throw new Error("Missing user information");
    }

    // Validate price ID against allowed values
    const validPriceIds = [
      'price_1Rb8vR1d1AvgoBGoNIjxLKRR', // Monthly
      'price_1Rb8wD1d1AvgoBGoC8nfQXNK'  // Annual
    ];

    if (!priceId || !validPriceIds.includes(priceId)) {
      logStep("ERROR: Invalid price ID", {
        priceId,
        validPriceIds,
        availablePlans: validPriceIds
      });
      throw new Error(`Invalid price ID: ${priceId}. Valid options are: ${validPriceIds.join(', ')}`);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        supabase_user_id: userId,
        user_email: email
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
