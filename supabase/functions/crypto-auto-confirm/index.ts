// Crypto Auto-Confirmation Edge Function
// Automatically verifies crypto transactions on blockchain and activates accounts
// Called when user clicks "Confirm Transfer" button

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";

// Wallet addresses for each network
const WALLET_ADDRESSES: Record<string, string> = {
  'TRC20': 'TJZARrDbBjTjjUvEb7BwqD3AoFsVNyShtm',
  'BTC': 'bc1qfhkwc02k58h0q8yq9tqcyvja7cnrq57hwygm76',
  'ETH': '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68',
  'BNB': '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68',
  'POLYGON': '0x46252C57F22A5e3f2d5638bD21C892c9876D6e68',
  'SOL': '6Hj6JfMDhSBJuPcX7keB6pPcVXsojEwqdgPt7HKcwxjQ',
};

// Network explorers for transaction lookup
const EXPLORERS: Record<string, string> = {
  'TRC20': 'https://tronscan.org',
  'BTC': 'https://blockstream.info/api',
  'ETH': 'https://api.etherscan.io/api',
  'BNB': 'https://api.bscscan.com/api',
  'POLYGON': 'https://api.polygonscan.com/api',
  'SOL': 'https://api.solscan.io',
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Verify BTC transaction using Blockstream API
async function verifyBtcTransaction(address: string, expectedAmount: number): Promise<{ verified: boolean; txHash?: string; amount?: number; confirmations?: number }> {
  try {
    // Get address transactions from Blockstream
    const response = await fetch(`${EXPLORERS['BTC']}/address/${address}/txs`);
    if (!response.ok) {
      console.error("[verifyBtcTransaction] Failed to fetch BTC transactions");
      return { verified: false };
    }
    
    const transactions = await response.json();
    
    // Check for incoming transactions to our address
    // BTC amount is in satoshis, need to convert
    const minAmount = (expectedAmount * 0.95) * 100000000; // 5% tolerance
    const maxAmount = (expectedAmount * 1.05) * 100000000;
    
    for (const tx of transactions) {
      // Check if this is an incoming transaction
      for (const input of tx.vin) {
        if (input.prevout?.scriptpubkey_address !== address) {
          // This is an incoming transaction
          const amount = tx.vout.find((v: any) => v.scriptpubkey_address === address)?.value;
          if (amount && amount >= minAmount && amount <= maxAmount) {
            return {
              verified: true,
              txHash: tx.txid,
              amount: amount / 100000000, // Convert satoshis to BTC
              confirmations: tx.status.confirmed ? tx.confirmations || 1 : 0
            };
          }
        }
      }
    }
    
    return { verified: false };
  } catch (error) {
    console.error("[verifyBtcTransaction] Error:", error);
    return { verified: false };
  }
}

// Verify TRC20 (USDT on TRON) transaction
async function verifyTrc20Transaction(address: string, expectedAmount: number): Promise<{ verified: boolean; txHash?: string; amount?: number; confirmations?: number }> {
  try {
    // Use TronScan API to get transactions
    const response = await fetch(`https://api.tronscan.org/api/transaction-history?address=${address}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&confirm=1&limit=50`);
    if (!response.ok) {
      console.error("[verifyTrc20Transaction] Failed to fetch TRC20 transactions");
      return { verified: false };
    }
    
    const data = await response.json();
    
    // Check for transactions with expected amount (with 5% tolerance)
    const minAmount = expectedAmount * 0.95;
    const maxAmount = expectedAmount * 1.05;
    
    for (const tx of data.data || []) {
      if (tx.toAddress === address || tx.to === address) {
        const amount = parseFloat(tx.amount) / 1000000; // USDT has 6 decimals
        if (amount >= minAmount && amount <= maxAmount && tx.confirmed) {
          return {
            verified: true,
            txHash: tx.hash,
            amount: amount,
            confirmations: tx.confirmations || 1
          };
        }
      }
    }
    
    return { verified: false };
  } catch (error) {
    console.error("[verifyTrc20Transaction] Error:", error);
    return { verified: false };
  }
}

// Generic transaction verification for other networks
async function verifyGenericTransaction(network: string, address: string, expectedAmount: number): Promise<{ verified: boolean; txHash?: string; amount?: number; confirmations?: number }> {
  // For now, we'll require manual verification for networks without API support
  console.log(`[verifyGenericTransaction] Network ${network} requires manual verification`);
  return { verified: false };
}

// Main verification function
async function verifyTransaction(network: string, amountUSD: number): Promise<{ verified: boolean; txHash?: string; amount?: number; confirmations?: number }> {
  const walletAddress = WALLET_ADDRESSES[network];
  
  if (!walletAddress) {
    console.error(`[verifyTransaction] Unknown network: ${network}`);
    return { verified: false };
  }
  
  switch (network) {
    case 'BTC':
      return await verifyBtcTransaction(walletAddress, amountUSD);
    case 'TRC20':
      return await verifyTrc20Transaction(walletAddress, amountUSD);
    default:
      return await verifyGenericTransaction(network, walletAddress, amountUSD);
  }
}

// Send confirmation email to user
async function sendUserConfirmationEmail(
  userEmail: string, 
  fullName: string, 
  planName: string, 
  amount: string, 
  accountId: string,
  network: string,
  txHash?: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("PAYMENT CONFIRMED (Resend not configured):", { to: userEmail, planName, amount });
    return;
  }

  const explorerLink = txHash ? `${EXPLORERS[network] || ''}/tx/${txHash}` : '#';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:40px;text-align:center}
    .header h1{color:#D4AF37;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0}
    .success{padding:20px;background:#d4edda;border-left:4px solid #28a745;margin:20px 0}
    .details{padding:20px;background:#f9f9f9;border-radius:4px;margin:20px 0}
    .body{padding:40px}
    .title{font-size:20px;font-weight:bold;color:#222;margin-bottom:20px}
    .text{font-size:15px;color:#555;line-height:1.7;margin-bottom:20px}
    .btn{display:inline-block;padding:16px 40px;background:#D4AF37;color:#000;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-radius:3px}
    .footer{padding:20px 40px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
    .tx-link{font-family:monospace;background:#f9f9f9;padding:10px;word-break:break-all;font-size:12px;border-radius:4px}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Braxel Markets</h1>
  </div>
  <div class="body">
    <div class="success">
      <strong>✓ Payment Confirmed!</strong>
      <p style="margin:10px 0 0;font-size:14px">Your ${network} payment has been verified on the blockchain. Your account is now active!</p>
    </div>
    <div class="title">Welcome, ${escapeHtml(fullName || "User")}!</div>
    <p class="text">Great news! Your payment has been confirmed on the ${escapeHtml(network)} network. Your trading account is now fully active. Here are your account details:</p>
    <div class="details">
      <p style="margin:5px 0;font-size:14px"><strong>Account ID:</strong> ${escapeHtml(accountId)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Plan:</strong> ${escapeHtml(planName)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Amount Paid:</strong> ${escapeHtml(amount)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Network:</strong> ${escapeHtml(network)}</p>
      <p style="margin:5px 0;font-size:14px"><strong>Status:</strong> Active</p>
      ${txHash ? `<p style="margin:5px 0;font-size:14px"><strong>Transaction:</strong> <a href="${explorerLink}" style="color:#D4AF37">${txHash.substring(0, 20)}...</a></p>` : ''}
    </div>
    <p class="text">Your infrastructure deployment is in progress. Within the next few minutes, your algorithmic trading system will be operational.</p>
    <p style="text-align:center;margin:30px 0">
      <a href="#" class="btn">Access Your Dashboard</a>
    </p>
    <p class="text">If you have any questions, our institutional support team is available 24/7.</p>
    <p class="text">Best regards,<br/>Braxel Markets Team</p>
  </div>
  <div class="footer">© 2026 Braxel Markets — Institutional Trading Infrastructure</div>
</div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <noreply@braxelmarkets.com>",
        to: userEmail,
        subject: `✓ Payment Confirmed — ${planName}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend confirmation email error:", err);
    } else {
      const result = await res.json();
      console.log("Confirmation email sent:", { to: userEmail, emailId: result.id });
    }
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

// Send notification to company about activated account
async function sendCompanyActivationEmail(
  userEmail: string, 
  fullName: string, 
  planName: string, 
  amount: string, 
  accountId: string,
  network: string,
  txHash?: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("ACCOUNT ACTIVATED (Resend not configured):", { to: COMPANY_EMAIL, userEmail, planName, accountId });
    return;
  }

  const explorerLink = txHash ? `${EXPLORERS[network] || ''}/tx/${txHash}` : '#';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:32px;text-align:center}
    .header h1{color:#28a745;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px}
    .header p{color:#aaa;font-size:12px;margin:0}
    .body{padding:32px}
    .success{padding:20px;background:#d4edda;border-left:4px solid #28a745;margin:20px 0}
    .field{margin-bottom:12px;padding:14px;background:#f9f9f9;border-left:4px solid #28a745}
    .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
    .value{font-size:15px;font-weight:700;color:#222}
    .footer{padding:20px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>✓ Account Activated</h1>
    <p>Automatic Payment Verification Success</p>
  </div>
  <div class="body">
    <div class="success">
      <strong>✓ PAYMENT VERIFIED AND ACCOUNT ACTIVATED</strong>
      <p style="margin:10px 0 0;font-size:14px">The crypto payment was automatically verified and the user account has been activated.</p>
    </div>
    <div class="field"><div class="label">Account ID</div><div class="value">${escapeHtml(accountId)}</div></div>
    <div class="field"><div class="label">User Email</div><div class="value">${escapeHtml(userEmail)}</div></div>
    <div class="field"><div class="label">User Name</div><div class="value">${escapeHtml(fullName || "N/A")}</div></div>
    <div class="field"><div class="label">Plan</div><div class="value">${escapeHtml(planName)}</div></div>
    <div class="field"><div class="label">Amount</div><div class="value">${escapeHtml(amount)}</div></div>
    <div class="field"><div class="label">Network</div><div class="value">${escapeHtml(network)}</div></div>
    ${txHash ? `<div class="field"><div class="label">Transaction Hash</div><div class="value"><a href="${explorerLink}" style="color:#D4AF37">${escapeHtml(txHash)}</a></div></div>` : ''}
    <div class="field"><div class="label">Status</div><div class="value" style="color:#28a745">ACTIVATED</div></div>
    <div class="field"><div class="label">Timestamp</div><div class="value">${new Date().toUTCString()}</div></div>
  </div>
  <div class="footer">Automated notification — Braxel Markets Payment System</div>
</div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <system@braxelmarkets.com>",
        to: COMPANY_EMAIL,
        subject: `✓ Account Activated: ${accountId} — ${amount} — ${userEmail}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend company activation email error:", err);
    }
  } catch (error) {
    console.error("Error sending company activation email:", error);
  }
}

// Send email for pending manual verification
async function sendPendingManualVerificationEmail(
  userEmail: string, 
  fullName: string, 
  planName: string, 
  amount: string,
  network: string,
  paymentId: string
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("MANUAL VERIFICATION REQUIRED (Resend not configured):", { to: COMPANY_EMAIL, userEmail, paymentId });
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:32px;text-align:center}
    .header h1{color:#ffc107;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px}
    .header p{color:#aaa;font-size:12px;margin:0}
    .body{padding:32px}
    .alert{padding:20px;background:#fff3cd;border-left:4px solid #ffc107;margin:20px 0}
    .field{margin-bottom:12px;padding:14px;background:#f9f9f9;border-left:4px solid #ffc107}
    .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
    .value{font-size:15px;font-weight:700;color:#222}
    .footer{padding:20px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>⚠ Manual Verification Required</h1>
    <p>Automatic Verification Failed — ACTION REQUIRED</p>
  </div>
  <div class="body">
    <div class="alert">
      <strong>⚠️ AUTOMATIC VERIFICATION FAILED</strong>
      <p style="margin:10px 0 0;font-size:14px">The automatic blockchain verification could not confirm the payment. Manual verification is required.</p>
    </div>
    <div class="field"><div class="label">Payment ID</div><div class="value">${escapeHtml(paymentId)}</div></div>
    <div class="field"><div class="label">User Email</div><div class="value">${escapeHtml(userEmail)}</div></div>
    <div class="field"><div class="label">User Name</div><div class="value">${escapeHtml(fullName || "N/A")}</div></div>
    <div class="field"><div class="label">Plan</div><div class="value">${escapeHtml(planName)}</div></div>
    <div class="field"><div class="label">Amount</div><div class="value">${escapeHtml(amount)}</div></div>
    <div class="field"><div class="label">Network</div><div class="value">${escapeHtml(network)}</div></div>
    <div class="field"><div class="label">Status</div><div class="value" style="color:#ffc107">PENDING — MANUAL VERIFICATION REQUIRED</div></div>
    <div class="field"><div class="label">Timestamp</div><div class="value">${new Date().toUTCString()}</div></div>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
    <p style="font-size:13px;color:#666"><strong>⚠️ Action Required:</strong></p>
    <ol style="font-size:12px;color:#666;margin:12px 0;padding-left:20px">
      <li>Check your ${network} wallet for the incoming transaction</li>
      <li>Verify the transaction on ${EXPLORERS[network] || 'the blockchain explorer'}</li>
      <li>Compare the amount with the expected payment</li>
      <li>If verified, manually activate the account using the admin panel</li>
      <li>Contact the user if there are any issues</li>
    </ol>
  </div>
  <div class="footer">Automated notification — Braxel Markets Payment System</div>
</div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Braxel Markets <system@braxelmarkets.com>",
        to: COMPANY_EMAIL,
        subject: `⚠️ Manual Verification: ${amount} — ${network} — ${userEmail}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend manual verification email error:", err);
    }
  } catch (error) {
    console.error("Error sending manual verification email:", error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const { paymentId, network, amountUSD } = await req.json()

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    // Get pending payment
    const { data: pendingPayment, error: fetchError } = await supabaseClient
      .from('pending_payments')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !pendingPayment) {
      return new Response(JSON.stringify({ 
        error: 'Payment not found or already processed',
        code: 'PAYMENT_NOT_FOUND'
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Verify transaction on blockchain
    console.log(`[crypto-auto-confirm] Verifying ${network} transaction for ${amountUSD} USD...`);
    const verification = await verifyTransaction(network, amountUSD);

    if (verification.verified) {
      console.log(`[crypto-auto-confirm] Transaction verified: ${verification.txHash}, Amount: ${verification.amount}`);
      
      // Create service account
      const accountId = `ACC-${Math.floor(100000 + Math.random() * 900000)}`
      const { error: serviceError } = await supabaseClient
        .from('services')
        .insert([{
          user_id: user.id,
          plan_name: pendingPayment.plan_name,
          account_id: accountId,
          status: 'Active',
          balance: parseFloat(pendingPayment.amount_usd)
        }]);

      if (serviceError) {
        console.error("[crypto-auto-confirm] Service creation error:", serviceError);
        throw serviceError;
      }

      // Update pending payment status
      await supabaseClient
        .from('pending_payments')
        .update({ 
          status: 'confirmed', 
          confirmed_at: new Date().toISOString(),
          tx_hash: verification.txHash,
          account_id: accountId
        })
        .eq('payment_id', paymentId);

      // Send confirmation emails
      await sendUserConfirmationEmail(
        profile?.email || '',
        profile?.full_name || '',
        pendingPayment.plan_name,
        pendingPayment.amount_usd,
        accountId,
        network,
        verification.txHash
      );

      await sendCompanyActivationEmail(
        profile?.email || '',
        profile?.full_name || '',
        pendingPayment.plan_name,
        pendingPayment.amount_usd,
        accountId,
        network,
        verification.txHash
      );

      console.log(`[crypto-auto-confirm] SUCCESS: Payment ${paymentId} confirmed, account ${accountId} created`);
      
      return new Response(JSON.stringify({ 
        success: true,
        verified: true,
        accountId,
        txHash: verification.txHash,
        message: 'Payment verified and account activated!'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      // Automatic verification failed - notify company for manual review
      console.log(`[crypto-auto-confirm] Automatic verification failed for ${paymentId}`);
      
      // Update status to pending_manual
      await supabaseClient
        .from('pending_payments')
        .update({ 
          status: 'pending_manual',
          verification_attempted_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId);

      // Send manual verification notification to company
      await sendPendingManualVerificationEmail(
        profile?.email || '',
        profile?.full_name || '',
        pendingPayment.plan_name,
        pendingPayment.amount_usd,
        network,
        paymentId
      );

      return new Response(JSON.stringify({ 
        success: true,
        verified: false,
        requiresManualVerification: true,
        message: 'Payment not found on blockchain. Our team will verify manually within 1-3 business days.'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

  } catch (error: any) {
    console.error("[crypto-auto-confirm] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
})
