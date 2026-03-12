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
    // 1. Extract and verify JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[withdrawal-notification] Missing Authorization header");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error("[withdrawal-notification] Auth error", userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Parse request body
    const { name, accountId, amount, iban, email } = await req.json()

    // 3. Verify account ownership
    // We check if the accountId exists and belongs to the authenticated user
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('id')
      .eq('account_id', accountId)
      .eq('user_id', user.id)
      .single()

    if (serviceError || !service) {
      console.error("[withdrawal-notification] Account verification failed", { 
        accountId, 
        userId: user.id,
        error: serviceError 
      });
      return new Response(JSON.stringify({ error: 'Forbidden: Account does not belong to user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Log the verified request
    console.log("[withdrawal-notification] NEW VERIFIED WITHDRAWAL REQUEST RECEIVED", {
      investor: name,
      email: user.email, // Use verified email from JWT
      accountId: accountId,
      amount: amount,
      iban: iban,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    // In a real scenario, you would use a service like Resend or SendGrid here
    // to send an actual email to marketsbraxel@gmail.com

    return new Response(
      JSON.stringify({ message: "Notification logged successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )
  } catch (error) {
    console.error("[withdrawal-notification] Error processing notification", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    )
  }
})