import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONFIRM-PAYMENT] ${step}${detailsStr}`);
};

async function updateMySQLOrder(paymentIntentId: string, paymentStatus: string, paymentMethod: string) {
  try {
    const mysqlHost = Deno.env.get("MYSQL_HOST");
    const mysqlUser = Deno.env.get("MYSQL_USER");
    const mysqlPassword = Deno.env.get("MYSQL_PASSWORD");
    const mysqlDatabase = Deno.env.get("MYSQL_DATABASE");

    if (!mysqlHost || !mysqlUser || !mysqlPassword || !mysqlDatabase) {
      logStep("MySQL credentials not configured, skipping MySQL update");
      return;
    }

    const client = await new Client().connect({
      hostname: mysqlHost,
      username: mysqlUser,
      password: mysqlPassword,
      db: mysqlDatabase,
      port: 3306,
    });

    logStep("Connected to MySQL for update");

    // Update order status
    await client.execute(
      `UPDATE orders SET payment_status = ?, payment_method = ?, updated_at = NOW() WHERE stripe_payment_intent_id = ?`,
      [paymentStatus, paymentMethod, paymentIntentId]
    );

    logStep("Order updated in MySQL", { paymentIntentId, paymentStatus, paymentMethod });

    await client.close();
  } catch (error) {
    logStep("MySQL update error", { error: error instanceof Error ? error.message : String(error) });
  }
}

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

    const paymentMethod = paymentIntent.payment_method_types?.[0] || "card";

    // Update order in Supabase
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_method: paymentMethod,
      })
      .eq("stripe_payment_intent_id", paymentIntentId);

    if (updateError) {
      logStep("Error updating order in Supabase", { error: updateError.message });
    } else {
      logStep("Order updated in Supabase", { paymentStatus });
    }

    // Also update MySQL order status
    await updateMySQLOrder(paymentIntentId, paymentStatus, paymentMethod);

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
