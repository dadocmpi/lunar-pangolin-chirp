import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, accountId, amount, iban, email } = await req.json()

    console.log("[withdrawal-notification] NEW WITHDRAWAL REQUEST RECEIVED", {
      investor: name,
      email: email,
      accountId: accountId,
      amount: amount,
      iban: iban,
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