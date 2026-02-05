import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SAVE-TO-MYSQL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const {
      fullName,
      email,
      phone,
      birthDate,
      cpf,
      cnpj,
      areaAtuacao,
      tier,
      amountCents,
      paymentMethod,
      paymentStatus,
      stripePaymentIntentId,
    } = await req.json();

    logStep("Data received", { fullName, email, tier, paymentStatus });

    // Connect to MySQL
    const client = await new Client().connect({
      hostname: Deno.env.get("MYSQL_HOST") || "",
      username: Deno.env.get("MYSQL_USER") || "",
      password: Deno.env.get("MYSQL_PASSWORD") || "",
      db: Deno.env.get("MYSQL_DATABASE") || "",
      port: 3306,
    });

    logStep("Connected to MySQL");

    // Create table if not exists
    await client.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        birth_date VARCHAR(20),
        cpf VARCHAR(20) NOT NULL,
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

    logStep("Table ensured");

    // Insert order
    const result = await client.execute(
      `INSERT INTO orders (full_name, email, phone, birth_date, cpf, cnpj, area_atuacao, tier, amount_cents, payment_method, payment_status, stripe_payment_intent_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        phone,
        birthDate || null,
        cpf,
        cnpj || null,
        areaAtuacao || null,
        tier,
        amountCents,
        paymentMethod,
        paymentStatus || "paid",
        stripePaymentIntentId || null,
      ]
    );

    logStep("Order inserted", { insertId: result.lastInsertId });

    await client.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: result.lastInsertId,
        message: "Order saved to MySQL successfully" 
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
