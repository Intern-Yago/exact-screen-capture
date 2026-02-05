import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Prices in cents for each tier
const TIER_PRICES: Record<string, { amount: number; priceId: string | null }> = {
  basico: { amount: 50000, priceId: null },
  intermediario: { amount: 55000, priceId: null },
  premium: { amount: 60000, priceId: null },
  teste: { amount: 100, priceId: null }, // R$ 1,00
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("STRIPE_SECRET_KEY mode:", stripeKey?.startsWith("sk_live_") ? "LIVE" : "TEST/UNKNOWN");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      tier,
      fullName,
      email,
      phone,
      birthDate,
      cpf,
      cnpj,
      areaAtuacao,
    } = await req.json();

    logStep("Request received", {
      tier,
      fullName,
      email,
      phone: phone?.slice(0, 4) + "***",
    });

    // Validate required fields
    if (!tier || !fullName || !email || !phone) {
      throw new Error("Campos obrigatórios: tier, fullName, email, phone");
    }

    const tierConfig = TIER_PRICES[tier];
    if (!tierConfig) {
      throw new Error(`Tier inválido: ${tier}`);
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-01-28.clover",
    });

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
        metadata: {
          source: "checkout",
          cpf: cpf || "",
          cnpj: cnpj || "",
          birthDate: birthDate || "",
          areaAtuacao: areaAtuacao || "",
        },
      });

      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    /**
     * ✅ Cria o PaymentIntent
     * IMPORTANTE:
     * - Recomendo automatic_payment_methods para permitir Pix/Boleto futuramente
     * - Mas se você quer só cartão, pode manter payment_method_types: ["card"]
     */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tierConfig.amount,
      currency: "brl",
      customer: customerId,

      // Recomendado (melhor compatibilidade com PaymentElement)
      automatic_payment_methods: { enabled: true },

      // Se quiser forçar apenas cartão, use isso e remova automatic_payment_methods
      // payment_method_types: ["card"],

      payment_method_options: {
        card: {
          installments: {
            enabled: true,
          },
        },
      },

      metadata: {
        tier,
        fullName,
        email,
        phone,
        cpf: cpf || "",
        cnpj: cnpj || "",
        birthDate: birthDate || "",
        areaAtuacao: areaAtuacao || "",
      },
    });

    logStep("PaymentIntent created", {
      paymentIntentId: paymentIntent.id,
      amount: tierConfig.amount,
    });

    /**
     * ✅ AQUI ESTÁ A CORREÇÃO PRINCIPAL
     * Agora criamos uma Elements Session para o Stripe PaymentElement
     */
    const elementsSession = await stripe.elements.sessions.create({
      payment_intent: paymentIntent.id,
    });

    logStep("Elements Session created", {
      elementsSessionId: elementsSession.id,
    });

    // Create order in Supabase database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        full_name: fullName,
        email,
        phone,
        tier:
          tier === "basico"
            ? "individual"
            : tier === "intermediario"
              ? "vip"
              : tier === "premium"
                ? "dupla"
                : "individual",
        amount_cents: tierConfig.amount,
        payment_status: "pending",
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: customerId,
      })
      .select()
      .single();

    if (orderError) {
      logStep("Error creating order in Supabase", { error: orderError.message });
    } else {
      logStep("Order created in Supabase", { orderId: order.id });
    }

    // Save to MySQL (pending status)
    try {
      const mysqlHost = Deno.env.get("MYSQL_HOST");
      const mysqlUser = Deno.env.get("MYSQL_USER");
      const mysqlPassword = Deno.env.get("MYSQL_PASSWORD");
      const mysqlDatabase = Deno.env.get("MYSQL_DATABASE");

      if (mysqlHost && mysqlUser && mysqlPassword && mysqlDatabase) {
        const client = await new Client().connect({
          hostname: mysqlHost,
          username: mysqlUser,
          password: mysqlPassword,
          db: mysqlDatabase,
          port: 3306,
        });

        logStep("Connected to MySQL");

        await client.execute(`
          CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            birth_date VARCHAR(20),
            cpf VARCHAR(20),
            cnpj VARCHAR(25),
            area_atuacao VARCHAR(100),
            tier VARCHAR(50) NOT NULL,
            amount_cents INT NOT NULL,
            payment_method VARCHAR(50),
            payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
            stripe_payment_intent_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);

        const result = await client.execute(
          `INSERT INTO orders 
            (full_name, email, phone, birth_date, cpf, cnpj, area_atuacao, tier, amount_cents, payment_method, payment_status, stripe_payment_intent_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fullName,
            email,
            phone,
            birthDate || null,
            cpf || null,
            cnpj || null,
            areaAtuacao || null,
            tier,
            tierConfig.amount,
            null, // payment_method ainda não definido
            "pending",
            paymentIntent.id,
          ]
        );

        logStep("Order saved to MySQL", { insertId: result.lastInsertId });

        await client.close();
      } else {
        logStep("MySQL credentials not configured, skipping MySQL save");
      }
    } catch (mysqlError) {
      logStep("MySQL save error", {
        error: mysqlError instanceof Error ? mysqlError.message : String(mysqlError),
      });
    }

    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret, // ou elementsClientSecret, tanto faz
        orderId: order?.id ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
