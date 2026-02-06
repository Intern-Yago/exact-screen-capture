import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let client;
  try {
    const { email, phone } = await req.json();

    if (!email || !phone) {
      throw new Error("Email e telefone são obrigatórios");
    }

    // Connect to MySQL using environment variables
    client = await new Client().connect({
      hostname: Deno.env.get("MYSQL_HOST") || "",
      username: Deno.env.get("MYSQL_USER") || "",
      password: Deno.env.get("MYSQL_PASSWORD") || "",
      db: Deno.env.get("MYSQL_DATABASE") || "",
      port: 3306,
    });

    // Create leads table if not exists (MySQL Syntax)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Insert lead into MySQL
    const result = await client.execute(
      `INSERT INTO leads (email, phone) VALUES (?, ?)`,
      [email, phone]
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId: result.lastInsertId,
        message: "Lead salvo no MySQL com sucesso" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Erro na Edge Function:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: "Verifique se as variáveis de ambiente MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD e MYSQL_DATABASE estão configuradas no Supabase."
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
});
