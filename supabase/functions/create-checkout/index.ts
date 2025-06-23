
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
  "price_1Rb8vR1d1AvgoBGoNIjxLKRR", // Monthly Pro ($9.99/month)
  "price_1Rb8wD1d1AvgoBGoC8nfQXNK", // Annual Pro ($107.88/year - 10% discount)
];

const validateEnvironment = () => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please set it in Supabase Dashboard.");
  }
  
  if (!stripeKey.startsWith('sk_')) {
    throw new Error("Invalid STRIPE_SECRET_KEY format. It should start with 'sk_' (secret key), not 'pk_' (publishable key). Please use your secret key from the Stripe Dashboard.");
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is incomplete.");
  }

  return { stripeKey, supabaseUrl, supabaseAnonKey };
};

const authenticateUser = async (req: Request, supabaseClient: any) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("No authorization header provided");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    throw new Error(`Authentication error: ${userError.message}`);
  }
  
  const user = userData.user;
  if (!user?.email) {
    throw new Error("User not authenticated or email not available");
  }

  return user;
};

const validatePriceId = async (stripe: Stripe, priceId: string) => {
  if (!VALID_PRICE_IDS.includes(priceId)) {
    throw new Error(`Invalid price ID: ${priceId}. Please use a valid price ID.`);
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    
    if (!price.active) {
      throw new Error("The selected price is not active in Stripe");
    }

    logStep("Price verified in Stripe", { 
      priceId: price.id, 
      active: price.active, 
      amount: price.unit_amount,
      interval: price.recurring?.interval,
      intervalCount: price.recurring?.interval_count
    });

    return price;
  } catch (priceError: any) {
    if (priceError.code === 'resource_missing') {
      throw new Error(`Price ID '${priceId}' does not exist in your Stripe account. Please verify the price ID in your Stripe Dashboard.`);
    }
    throw new Error(`Price validation failed: ${priceError.message}`);
  }
};

const getOrCreateCustomer = async (stripe: Stripe, userEmail: string, userId: string) => {
  const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
  
  if (customers.data.length > 0) {
    const customerId = customers.data[0].id;
    logStep("Existing customer found", { customerId });
    return customerId;
  }

  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { user_id: userId }
  });
  
  logStep("New customer created", { customerId: customer.id });
  return customer.id;
};

const createCheckoutSession = async (
  stripe: Stripe, 
  customerId: string, 
  priceId: string, 
  userId: string, 
  origin: string,
  mode: string
) => {
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment-cancelled`,
    metadata: {
      user_id: userId,
      price_id: priceId,
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  };

  logStep("Creating checkout session with config", { 
    mode: sessionConfig.mode,
    successUrl: sessionConfig.success_url,
    cancelUrl: sessionConfig.cancel_url,
    priceId: priceId
  });

  const session = await stripe.checkout.sessions.create(sessionConfig);

  if (!session.url) {
    throw new Error("Stripe checkout session created but no URL returned");
  }

  logStep("Checkout session created successfully", { 
    sessionId: session.id, 
    url: session.url,
    urlLength: session.url?.length 
  });

  return session;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate environment variables
    const { stripeKey, supabaseUrl, supabaseAnonKey } = validateEnvironment();
    logStep("Environment validated");

    // Initialize clients
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Authenticate user
    const user = await authenticateUser(req, supabaseClient);
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { priceId, mode = "subscription" } = await req.json();
    if (!priceId) {
      throw new Error("Price ID is required");
    }
    logStep("Request body parsed", { priceId, mode });

    // Validate price
    await validatePriceId(stripe, priceId);

    // Get or create customer
    const customerId = await getOrCreateCustomer(stripe, user.email, user.id);

    // Create checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await createCheckoutSession(stripe, customerId, priceId, user.id, origin, mode);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check the Edge Function logs in Supabase Dashboard for more information."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
