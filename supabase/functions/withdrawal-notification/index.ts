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
    // 1. Extract Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[withdrawal-notification] Unauthorized: Missing Authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 2. Initialize Supabase client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 3. Verify the JWT and get user data
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error("[withdrawal-notification] Unauthorized: Invalid or expired token", authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 4. Parse request body
    const { accountId, amount, iban } = await req.json()

    // 5. Verify account ownership in the database
    // This ensures the user can only request withdrawals for their own accounts
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('id')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single()

    if (serviceError || !service) {
      console.warn(`[withdrawal-notification] Security Alert: User ${user.id} attempted to withdraw from unauthorized account ${accountId}`)
      return new Response(JSON.stringify({ error: 'Forbidden: Account ownership not verified' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // 6. Log the secure request (masking sensitive IBAN)
    const maskedIban = iban ? iban.replace(/.+(.{4})$/, "************$1") : "N/A"
    console.log("[withdrawal-notification] SECURE WITHDRAWAL REQUEST VERIFIED", {
      userId: user.id,
      userEmail: user.email,
      accountId: accountId,
      amount: amount,
      iban: maskedIban,
      timestamp: new Date().toISOString()
    });

    // Success response
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