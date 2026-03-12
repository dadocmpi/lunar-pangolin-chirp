import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[withdrawal-notification] Unauthorized: No Authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error("[withdrawal-notification] Unauthorized: Invalid token", authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const { name, accountId, amount, iban, email } = await req.json()

    // 2. Mask Sensitive Data (IBAN)
    const maskedIban = iban ? iban.replace(/.+(.{4})$/, "************$1") : "N/A"

    console.log("[withdrawal-notification] NEW WITHDRAWAL REQUEST RECEIVED", {
      investor: name,
      email: email,
      userId: user.id,
      accountId: accountId,
      amount: amount,
      iban: maskedIban, // Log only masked IBAN
      timestamp: new Date().toISOString()
    });

    // In a real scenario, you would trigger an email service here
    
    return new Response(
      JSON.stringify({ message: "Notification processed securely" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    console.error("[withdrawal-notification] Error processing notification", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})