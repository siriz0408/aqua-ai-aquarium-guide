
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("One-time payment function started");

    // Validate environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!stripeKey.startsWith('sk_')) {
      logStep("ERROR: Invalid STRIPE_SECRET_KEY format", { keyPrefix: stripeKey.substring(0, 7) });
      throw new Error("Invalid STRIPE_SECRET_KEY format. Please use your secret key from Stripe Dashboard.");
    }

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
    const { productId } = await req.json();
    if (!productId) {
      logStep("ERROR: No product ID provided");
      throw new Error("Product ID is required");
    }
    logStep("Product ID received", { productId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Validate product exists in Stripe
    try {
      const product = await stripe.products.retrieve(productId);
      logStep("Product verified in Stripe", { productId: product.id, active: product.active, name: product.name });
      
      if (!product.active) {
        throw new Error("The selected product is not active in Stripe");
      }
    } catch (productError: any) {
      logStep("ERROR: Product validation failed", { error: productError.message, code: productError.code });
      if (productError.code === 'resource_missing') {
        throw new Error(`Product ID '${productId}' does not exist in your Stripe account.`);
      }
      throw new Error(`Product validation failed: ${productError.message}`);
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
    
    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: productId,
            unit_amount: 499, // $4.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-cancelled`,
      metadata: {
        user_id: user.id,
        product_id: productId,
        payment_type: "one_time"
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    logStep("One-time payment session created", { sessionId: session.id, url: session.url });

    // Create Supabase service client to record the order
    const supabaseService = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Record the order in Supabase (optional but recommended for tracking)
    try {
      const { error: insertError } = await supabaseService
        .from('orders')
        .insert({
          user_id: user.id,
          stripe_session_id: session.id,
          stripe_customer_id: customerId,
          product_id: productId,
          amount: 499,
          currency: 'usd',
          status: 'pending',
          payment_type: 'one_time',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        logStep("WARNING: Failed to record order in database", { error: insertError.message });
        // Don't fail the entire request for this
      } else {
        logStep("Order recorded in database");
      }
    } catch (dbError) {
      logStep("WARNING: Database operation failed", { error: dbError });
      // Continue with the payment flow
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check the Edge Function logs in Supabase Dashboard for more information."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
