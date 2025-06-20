
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

// Valid price IDs for the application
const VALID_PRICE_IDS = [
  "price_1Rb8vR1d1AvgoBGoNIjxLKRR", // Monthly Pro
  "price_ANNUAL_PRO_PLACEHOLDER", // Annual Pro - needs to be created in Stripe
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not configured. Please set it in Supabase Dashboard.");
    }
    
    // Validate Stripe key format
    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid STRIPE_SECRET_KEY format", { keyPrefix: stripeKey.substring(0, 7) });
      throw new Error("Invalid STRIPE_SECRET_KEY format. It should start with 'sk_' (secret key), not 'pk_' (publishable key). Please use your secret key from the Stripe Dashboard.");
    }
    
    logStep("Stripe key verified", { keyPrefix: stripeKey.substring(0, 7) });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logStep("ERROR: Missing Supabase configuration");
      throw new Error("Supabase configuration is incomplete.");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get request body
    const { priceId, trialPeriodDays } = await req.json();
    if (!priceId) {
      logStep("ERROR: No price ID provided");
      throw new Error("Price ID is required");
    }

    // Validate price ID
    if (!VALID_PRICE_IDS.includes(priceId)) {
      logStep("ERROR: Invalid price ID", { priceId, validPriceIds: VALID_PRICE_IDS });
      throw new Error(`Invalid price ID: ${priceId}. Please use a valid price ID.`);
    }

    logStep("Request body received", { priceId, trialPeriodDays });

    // Initialize Stripe with better error handling
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Validate price exists in Stripe
    try {
      const price = await stripe.prices.retrieve(priceId);
      logStep("Price verified in Stripe", { 
        priceId: price.id, 
        active: price.active, 
        amount: price.unit_amount,
        interval: price.recurring?.interval,
        intervalCount: price.recurring?.interval_count
      });
      
      if (!price.active) {
        throw new Error("The selected price is not active in Stripe");
      }
    } catch (priceError: any) {
      logStep("ERROR: Price validation failed", { error: priceError.message, code: priceError.code });
      if (priceError.code === 'resource_missing') {
        throw new Error(`Price ID '${priceId}' does not exist in your Stripe account. Please verify the price ID in your Stripe Dashboard.`);
      }
      throw new Error(`Price validation failed: ${priceError.message}`);
    }
    
    // Check if customer exists or create new one
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    logStep("Origin detected", { origin });
    
    // Create checkout session with proper trial configuration
    const sessionConfig: any = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        user_id: user.id,
        price_id: priceId,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    };

    // Add subscription data with trial period if specified
    if (trialPeriodDays && trialPeriodDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialPeriodDays,
        metadata: {
          user_id: user.id,
          trial_days: trialPeriodDays.toString(),
          price_id: priceId,
        }
      };
      logStep("Adding trial period to subscription", { trialPeriodDays });
    }

    logStep("Creating checkout session with config", { 
      mode: sessionConfig.mode,
      successUrl: sessionConfig.success_url,
      cancelUrl: sessionConfig.cancel_url,
      trialDays: trialPeriodDays,
      priceId: priceId
    });

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url,
      urlLength: session.url?.length 
    });

    // Validate the URL before returning
    if (!session.url) {
      throw new Error("Stripe checkout session created but no URL returned");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    // Return user-friendly error messages
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check the Edge Function logs in Supabase Dashboard for more information."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
