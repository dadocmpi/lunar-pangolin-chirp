import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Strict Authentication Check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[withdrawal-notification] Unauthorized: Missing Authorization header")
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

    // Verify the JWT and get user data
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error("[withdrawal-notification] Unauthorized: Invalid or expired token", authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const { name, accountId, amount, iban, email } = await req.json()

    // 2. Data Integrity Check
    // Ensure the email in the request matches the authenticated user's email
    if (user.email !== email) {
      console.warn("[withdrawal-notification] Security Alert: User email mismatch", { 
        authEmail: user.email, 
        reqEmail: email 
      })
      return new Response(JSON.stringify({ error: 'Forbidden: Identity mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 3. Privacy: Mask Sensitive Data (IBAN)
    // We only log the last 4 digits for auditing purposes
    const maskedIban = iban ? iban.replace(/.+(.{4})$/, "************$1") : "N/A"

    console.log("[withdrawal-notification] SECURE WITHDRAWAL REQUEST", {
      investor: name,
      userId: user.id,
      accountId: accountId,
      amount: amount,
      iban: maskedIban,
      timestamp: new Date().toISOString()
    });

    // Here you would typically trigger an internal notification system or email service
    
    return new Response(
      JSON.stringify({ message: "Withdrawal request received and verified." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    console.error("[withdrawal-notification] Critical Error", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})