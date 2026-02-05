import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Price IDs for each ticket tier
const PRICE_IDS = {
  individual: "price_1Swt4f3VZv7Wqzya5DTb88Io",
  vip: "price_1Swt5i3VZv7Wqzya22co3rE0",
  dupla: "price_1Swt5G3VZv7WqzyaMBZ0zbrJ",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    console.log("STRIPE_SECRET_KEY prefix:", stripeKey?.slice(0, 7));
    console.log(
      "STRIPE_SECRET_KEY mode:",
      stripeKey?.startsWith("sk_live_") ? "LIVE" : "TEST/UNKNOWN"
    );

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body to get the tier
    const { tier, email } = await req.json();
    logStep("Request received", { tier, email });

    if (!tier || !PRICE_IDS[tier as keyof typeof PRICE_IDS]) {
      throw new Error(`Invalid tier: ${tier}. Valid options are: individual, vip, dupla`);
    }

    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];
    logStep("Price ID determined", { tier, priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2026-01-28.clover" });

    // Check if customer exists by email (for guest checkout)
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://id-preview--72fdbf24-5c47-4884-9620-cc4ddd91642f.lovable.app";

    // Create a one-time payment session (guest checkout allowed)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: tier === "dupla" ? 1 : 1, // Dupla already includes 2 tickets in the product
        },
      ],
      mode: "payment",
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=canceled`,
      locale: "pt-BR",
      payment_method_types: ["card"],
      billing_address_collection: "required",
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
