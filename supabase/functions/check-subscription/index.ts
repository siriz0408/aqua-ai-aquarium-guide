
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION-PRO] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("100% Paywall Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logStep("ERROR: Missing Supabase configuration");
      throw new Error("Supabase configuration is incomplete");
    }

    // Use service role key for database operations
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Get user from auth header using anon client
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    
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

    // Get user profile using service role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logStep("ERROR: Failed to get user profile", { error: profileError.message });
      throw new Error(`Failed to get user profile: ${profileError.message}`);
    }

    if (!profile) {
      logStep("ERROR: User profile not found");
      throw new Error("User profile not found");
    }

    logStep("User profile retrieved", { 
      userId: profile.id, 
      subscriptionStatus: profile.subscription_status,
      subscriptionTier: profile.subscription_tier,
      isAdmin: profile.is_admin
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Admin always has access (100% paywall exception)
    if (profile.is_admin) {
      logStep("Admin user detected - granting access");
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: 'unlimited',
        subscription_status: 'admin',
        has_access: true,
        access_type: 'admin'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for active Stripe subscription (ONLY way for non-admins to get access)
    let hasActiveSubscription = false;
    let subscriptionEnd = null;

    if (profile.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          hasActiveSubscription = true;
          const subscription = subscriptions.data[0];
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          logStep("Active Stripe subscription found", { 
            subscriptionId: subscription.id,
            endDate: subscriptionEnd 
          });
        } else {
          logStep("No active Stripe subscription found");
        }
      } catch (stripeError) {
        logStep("WARNING: Stripe API error", { error: stripeError });
        // Continue with database-only check
      }
    } else {
      logStep("No Stripe customer ID found");
    }

    // 100% PAYWALL: Only paid subscribers (with active Stripe subscription) get access
    const hasAccess = hasActiveSubscription;
    const accessType = hasActiveSubscription ? 'paid' : 'no_access';
    const subscriptionTier = hasActiveSubscription ? 'pro' : 'free';

    const result = {
      subscribed: hasActiveSubscription,
      subscription_tier: subscriptionTier,
      subscription_status: accessType,
      subscription_end: subscriptionEnd,
      has_access: hasAccess,
      access_type: accessType,
      trial_hours_remaining: 0, // No trials in 100% paywall
      can_start_trial: false,   // No trials allowed
      trial_type: null
    };

    logStep("100% Paywall check complete", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription-pro", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false,
      has_access: false,
      access_type: 'error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
