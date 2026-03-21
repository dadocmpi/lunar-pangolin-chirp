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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    const { orderId, planName, accountSize } = await req.json()

    // 1. Obter Token do PayPal
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    
    const auth = btoa(`${clientId}:${clientSecret}`)
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    
    const { access_token } = await tokenResponse.json()

    // 2. Capturar o Pedido
    const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const captureData = await captureResponse.json()

    if (captureData.status === 'COMPLETED') {
      // 3. Criar o serviço no banco de dados
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

      if (dbError) throw dbError

      console.log(`[paypal-checkout] Payment verified and service created for user ${user.id}`)
      return new Response(JSON.stringify({ status: 'success', accountId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Payment not completed' }), { status: 400, headers: corsHeaders })

  } catch (error) {
    console.error("[paypal-checkout] Critical Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})