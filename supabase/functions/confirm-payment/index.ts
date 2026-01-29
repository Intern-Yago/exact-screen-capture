import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { paymentIntentId } = await req.json();
    logStep("Checking payment", { paymentIntentId });

    if (!paymentIntentId) {
      throw new Error("paymentIntentId is required");
    }

    // Get payment intent status from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    logStep("PaymentIntent status", { status: paymentIntent.status });

    // Map Stripe status to our status
    let paymentStatus: string;
    switch (paymentIntent.status) {
      case "succeeded":
        paymentStatus = "paid";
        break;
      case "processing":
        paymentStatus = "processing";
        break;
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action":
        paymentStatus = "pending";
        break;
      case "canceled":
        paymentStatus = "failed";
        break;
      default:
        paymentStatus = "pending";
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_method: paymentIntent.payment_method_types?.[0] || null,
      })
      .eq("stripe_payment_intent_id", paymentIntentId);

    if (updateError) {
      logStep("Error updating order", { error: updateError.message });
    } else {
      logStep("Order updated", { paymentStatus });
    }

    return new Response(
      JSON.stringify({
        status: paymentIntent.status,
        paymentStatus,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
