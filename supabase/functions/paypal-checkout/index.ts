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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("[paypal-checkout] Unauthorized: Missing Authorization header")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      console.error("[paypal-checkout] Unauthorized: Invalid token", authError)
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    const { orderId, planName, accountSize } = await req.json()

    // PayPal Credentials from Secrets
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      console.error("[paypal-checkout] Configuration Error: Missing PayPal Secrets")
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    // Use sandbox URL for testing, change to 'api-m.paypal.com' for production
    const paypalBaseUrl = 'https://api-m.sandbox.paypal.com'
    
    // 1. Get PayPal Access Token
    const auth = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    
    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Capture the Order
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const captureData = await captureResponse.json()

    if (captureData.status === 'COMPLETED') {
      // 3. Create the service in the database
      const accountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`
      const balance = parseFloat(accountSize.replace(/[^0-9.]/g, ''))

      const { error: dbError } = await supabaseClient
        .from('services')
        .insert([{
          user_id: user.id,
          plan_name: planName,
          account_id: accountId,
          status: 'Active',
          balance: balance
        }])

      if (dbError) {
        console.error("[paypal-checkout] Database Error:", dbError)
        throw dbError
      }

      console.log(`[paypal-checkout] SUCCESS: Payment verified and service created for user ${user.id}`)
      return new Response(JSON.stringify({ status: 'success', accountId }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.warn("[paypal-checkout] Payment not completed", captureData)
    return new Response(JSON.stringify({ error: 'Payment not completed', details: captureData }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })

  } catch (error: any) {
    console.error("[paypal-checkout] Critical Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    })
  }
})