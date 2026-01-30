import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Prices in cents for each tier
const TIER_PRICES = {
  individual: { amount: 99700, priceId: "price_1SuizV3aMoVTeUyes1BxIeYU" },
  vip: { amount: 149700, priceId: "price_1Suizn3aMoVTeUyelrnxBSPD" },
  dupla: { amount: 179700, priceId: "price_1Suj0G3aMoVTeUyeJuuyYqhl" },
  teste: { amount: 100, priceId: null }, // R$ 1,00 for testing (Stripe minimum)
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
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

    const { tier, fullName, email, phone } = await req.json();
    logStep("Request received", { tier, fullName, email, phone: phone?.slice(0, 4) + "***" });

    // Validate required fields
    if (!tier || !fullName || !email || !phone) {
      throw new Error("Campos obrigatórios: tier, fullName, email, phone");
    }

    const tierConfig = TIER_PRICES[tier as keyof typeof TIER_PRICES];
    if (!tierConfig) {
      throw new Error(`Tier inválido: ${tier}`);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    // Find or create Stripe customer
    let customerId: string;
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email,
        name: fullName,
        phone,
        metadata: { source: "ela_event" },
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    // Create PaymentIntent with card (PIX requires activation in Stripe Dashboard)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tierConfig.amount,
      currency: "brl",
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        tier,
        fullName,
        email,
        phone,
      },
    });

    logStep("PaymentIntent created", { 
      paymentIntentId: paymentIntent.id, 
      amount: tierConfig.amount 
    });

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        full_name: fullName,
        email,
        phone,
        tier,
        amount_cents: tierConfig.amount,
        payment_status: "pending",
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: customerId,
      })
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order", { error: orderError.message });
      // Don't fail the payment flow if order creation fails
    } else {
      logStep("Order created", { orderId: order.id });
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order?.id,
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
