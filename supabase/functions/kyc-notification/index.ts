// KYC Notification Edge Function
// This function sends an email to the company when a user submits identity verification

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";

interface KYCNotificationPayload {
  userId: string;
  fullName: string;
  email: string;
  country: string;
  verificationMethod: string;
  documentType: string;
  documentUrl: string;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload: KYCNotificationPayload = await req.json();

    // Validate required fields
    if (!payload.userId || !payload.email || !payload.country) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get document name for display
    const documentName = getDocumentName(payload.documentType);
    
    // Get country name
    const countryName = getCountryName(payload.country);
    
    // Get method name
    const methodName = getMethodName(payload.verificationMethod);

    // Create email content
    const emailSubject = "Identity Verification";
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #000000 0%, #0a0e27 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .field { margin-bottom: 15px; padding: 15px; background: white; border-left: 4px solid #D4AF37; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
    .value { font-size: 16px; font-weight: bold; color: #333; margin-top: 5px; }
    .buttons { padding: 30px; text-align: center; }
    .btn { display: inline-block; padding: 15px 40px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
    .btn-approve { background: #22c55e; color: white; }
    .btn-deny { background: #ef4444; color: white; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .document-link { color: #D4AF37; word-break: break-all; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Identity Verification Request</h1>
    <p>New KYC submission requires review</p>
  </div>
  
  <div class="content">
    <div class="field">
      <div class="label">Full Name</div>
      <div class="value">${escapeHtml(payload.fullName || 'N/A')}</div>
    </div>
    
    <div class="field">
      <div class="label">User ID</div>
      <div class="value">${escapeHtml(payload.userId)}</div>
    </div>
    
    <div class="field">
      <div class="label">Email Address</div>
      <div class="value">${escapeHtml(payload.email)}</div>
    </div>
    
    <div class="field">
      <div class="label">Country</div>
      <div class="value">${escapeHtml(countryName)} (${escapeHtml(payload.country)})</div>
    </div>
    
    <div class="field">
      <div class="label">Verification Method</div>
      <div class="value">${escapeHtml(methodName)}</div>
    </div>
    
    <div class="field">
      <div class="label">Uploaded Document</div>
      <div class="value">${escapeHtml(documentName)}</div>
    </div>
    
    ${payload.documentUrl ? `
    <div class="field">
      <div class="label">Document Image</div>
      <div class="value"><a href="${escapeHtml(payload.documentUrl)}" class="document-link" target="_blank">View Uploaded Document</a></div>
    </div>
    ` : ''}
  </div>
  
  <div class="buttons">
    <p style="margin-bottom: 20px; color: #666;">Please review the submitted document and take action:</p>
    
    <a href="${getApprovalUrl(payload.userId)}" class="btn btn-approve" target="_blank">
      ✓ Approve Verification
    </a>
    
    <a href="${getDenialUrl(payload.userId)}" class="btn btn-deny" target="_blank">
      ✗ Deny Verification
    </a>
  </div>
  
  <div class="footer">
    <p>This is an automated notification from Braxel Markets KYC System.</p>
    <p>Submitted at: ${new Date().toISOString()}</p>
  </div>
</body>
</html>
    `;

    const emailText = `
IDENTITY VERIFICATION REQUEST

A new KYC submission requires your review.

Full Name: ${payload.fullName || 'N/A'}
User ID: ${payload.userId}
Email Address: ${payload.email}
Country: ${countryName} (${payload.country})
Verification Method: ${methodName}
Uploaded Document: ${documentName}
${payload.documentUrl ? `Document URL: ${payload.documentUrl}` : ''}

Submitted at: ${new Date().toISOString()}

---
Action Required:
- Approve: Click here to approve this verification
- Deny: Click here to deny this verification

This is an automated notification from Braxel Markets KYC System.
    `;

    // Send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Braxel Markets KYC <kyc@braxelmarkets.com>',
          to: COMPANY_EMAIL,
          subject: emailSubject,
          html: emailHtml,
          text: emailText
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Resend API error:', errorData);
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully",
          emailId: result.id
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    } else {
      // Fallback: log the notification if Resend is not configured
      console.log("KYC Notification (RESEND NOT CONFIGURED):", {
        to: COMPANY_EMAIL,
        subject: emailSubject,
        userId: payload.userId,
        email: payload.email,
        country: payload.country,
        method: payload.verificationMethod,
        documentType: payload.documentType
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Notification logged (Resend not configured)",
          notificationId: crypto.randomUUID()
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    }

  } catch (error) {
    console.error("Error sending KYC notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper functions
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getDocumentName(docId: string): string {
  const documents: { [key: string]: string } = {
    'rg': 'RG (Brazilian Identity Document)',
    'cpf': 'CPF (Brazilian Tax ID)',
    'passport': 'Passport',
    'passport_br': 'Brazilian Passport',
    'cnh': 'CNH (Brazilian Driver License)',
    'state_id': 'State ID Card (US)',
    'passport_uk': 'UK Passport',
    'driving_license_uk': 'UK Driving License',
    'brp': 'Biometric Residence Permit (UK)',
    'personalausweis': 'Personalausweis (German ID)',
    'passport_de': 'German Passport',
    'fuehrerschein': 'Führerschein (German Driver License)',
    'cni': "Carte d'identité Nationale (France)",
    'passport_fr': 'French Passport',
    'titre_sejour': 'Titre de Séjour (France Residence Permit)',
    'dni': 'DNI (Spanish National ID)',
    'nie': 'NIE (Spanish Foreigner ID)',
    'passport_es': 'Spanish Passport',
    'carta_id': "Carta d'Identità (Italian ID)",
    'passport_it': 'Italian Passport',
    'cc': 'Cartão de Cidadão (Portuguese Citizen Card)',
    'passport_pt': 'Portuguese Passport',
    'passport_ru': 'Russian Passport',
    'foreign_passport_ru': 'Russian Foreign Passport',
    'id_card_cn': 'Chinese Identity Card',
    'passport_cn': 'Chinese Passport',
    'passport_jp': 'Japanese Passport',
    'zairyu': '在留カード (Japanese Residence Card)',
    'aadhaar': 'Aadhaar Card (India)',
    'voter_id': 'Voter ID (India)',
    'passport_in': 'Indian Passport',
    'passport_intl': 'International Passport',
    'national_id_intl': 'National ID Card'
  };
  return documents[docId] || docId;
}

function getCountryName(countryCode: string): string {
  const countries: { [key: string]: string } = {
    'BR': 'Brazil',
    'US': 'United States',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'PT': 'Portugal',
    'RU': 'Russia',
    'CN': 'China',
    'JP': 'Japan',
    'IN': 'India',
    'OTHER': 'Other Countries'
  };
  return countries[countryCode] || countryCode;
}

function getMethodName(methodId: string): string {
  const methods: { [key: string]: string } = {
    'id_card': 'National ID Card',
    'passport': 'Passport',
    'drivers_license': "Driver's License",
    'biometric': 'Biometric Residence Permit',
    'residence': 'Residence Permit',
    'foreign_passport': 'Foreign Passport',
    'national_id': 'National ID Card'
  };
  return methods[methodId] || methodId;
}

function getApprovalUrl(userId: string): string {
  // In production, this would be a proper admin dashboard URL
  // For now, return a placeholder URL
  return `https://braxelmarkets.com/admin/kyc/approve?userId=${userId}&token=${generateToken(userId, 'approve')}`;
}

function getDenialUrl(userId: string): string {
  // In production, this would be a proper admin dashboard URL
  // For now, return a placeholder URL
  return `https://braxelmarkets.com/admin/kyc/deny?userId=${userId}&token=${generateToken(userId, 'deny')}`;
}

function generateToken(userId: string, action: string): string {
  // In production, use proper JWT or signed tokens
  const payload = `${userId}:${action}:${Date.now()}`;
  return btoa(payload);
}