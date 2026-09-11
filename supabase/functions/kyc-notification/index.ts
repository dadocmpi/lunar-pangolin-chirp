// KYC Notification Edge Function
// Sends an email to the company when a user submits identity verification

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const COMPANY_EMAIL = "marketsbraxel@ouvidor.net";
const SUPABASE_FUNCTIONS_URL =
  "https://ymzdxifedtjwkxkzfwqu.supabase.co/functions/v1";
const KYC_ACTION_SECRET = Deno.env.get("KYC_ACTION_SECRET");
if (!KYC_ACTION_SECRET) {
  throw new Error("KYC_ACTION_SECRET environment variable is not set");
}

interface KYCNotificationPayload {
  userId: string;
  fullName: string;
  email: string;
  country: string;
  verificationMethod: string;
  documentType: string;
  documentUrl: string;
}

function generateToken(userId: string, action: string): string {
  return btoa(`${userId}:${action}:${KYC_ACTION_SECRET}`);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getDocumentName(docId: string): string {
  const docs: Record<string, string> = {
    rg: "RG (Brazilian Identity Document)",
    cpf: "CPF (Brazilian Tax ID)",
    passport: "Passport",
    cnh: "CNH (Brazilian Driver License)",
    state_id: "State ID Card (US)",
    passport_uk: "UK Passport",
    driving_license_uk: "UK Driving License",
    brp: "Biometric Residence Permit (UK)",
    personalausweis: "Personalausweis (German ID)",
    passport_de: "German Passport",
    fuehrerschein: "Führerschein (German Driver License)",
    cni: "Carte d'identité Nationale (France)",
    passport_fr: "French Passport",
    titre_sejour: "Titre de Séjour (France Residence Permit)",
    dni: "DNI (Spanish National ID)",
    nie: "NIE (Spanish Foreigner ID)",
    passport_es: "Spanish Passport",
    carta_id: "Carta d'Identità (Italian ID)",
    passport_it: "Italian Passport",
    cc: "Cartão de Cidadão (Portuguese Citizen Card)",
    passport_pt: "Portuguese Passport",
    passport_ru: "Russian Passport",
    foreign_passport_ru: "Russian Foreign Passport",
    id_card_cn: "Chinese Identity Card",
    passport_cn: "Chinese Passport",
    passport_jp: "Japanese Passport",
    zairyu: "在留カード (Japanese Residence Card)",
    aadhaar: "Aadhaar Card (India)",
    voter_id: "Voter ID (India)",
    passport_in: "Indian Passport",
    passport_intl: "International Passport",
    national_id_intl: "National ID Card",
  };
  return docs[docId] || docId;
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    BR: "Brazil",
    US: "United States",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    PT: "Portugal",
    RU: "Russia",
    CN: "China",
    JP: "Japan",
    IN: "India",
    OTHER: "Other Countries",
  };
  return countries[code] || code;
}

function getMethodName(id: string): string {
  const methods: Record<string, string> = {
    id_card: "National ID Card",
    passport: "Passport",
    drivers_license: "Driver's License",
    biometric: "Biometric Residence Permit",
    residence: "Residence Permit",
    foreign_passport: "Foreign Passport",
    national_id: "National ID Card",
    drivers: "Driver's License",
  };
  return methods[id] || id;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: KYCNotificationPayload = await req.json();

    if (!payload.userId || !payload.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const countryName = getCountryName(payload.country);
    const methodName = getMethodName(payload.verificationMethod);
    const documentName = getDocumentName(payload.documentType);
    const fullName = payload.fullName?.trim() || "N/A";

    const approveUrl = `${SUPABASE_FUNCTIONS_URL}/kyc-action?userId=${
      encodeURIComponent(payload.userId)
    }&action=approve&token=${
      encodeURIComponent(generateToken(payload.userId, "approve"))
    }`;
    const denyUrl = `${SUPABASE_FUNCTIONS_URL}/kyc-action?userId=${
      encodeURIComponent(payload.userId)
    }&action=deny&token=${
      encodeURIComponent(generateToken(payload.userId, "deny"))
    }`;

    const isImage = payload.documentUrl &&
      /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(payload.documentUrl);

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px}
    .wrap{max-width:600px;margin:0 auto;background:#fff;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .header{background:#0a0e27;padding:32px;text-align:center}
    .header h1{color:#D4AF37;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0 0 6px}
    .header p{color:#aaa;font-size:12px;margin:0}
    .body{padding:32px}
    .field{margin-bottom:12px;padding:14px;background:#f9f9f9;border-left:4px solid #D4AF37}
    .label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px}
    .value{font-size:15px;font-weight:700;color:#222}
    .doc-section{margin:24px 0;text-align:center}
    .doc-section .label{margin-bottom:12px;text-align:left}
    .doc-section img{max-width:100%;max-height:360px;border:2px solid #ddd;border-radius:4px;display:block;margin:0 auto}
    .doc-link{display:inline-block;margin-top:10px;padding:10px 20px;background:#0a0e27;color:#D4AF37;text-decoration:none;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:3px}
    .actions{padding:28px 32px;background:#f9f9f9;text-align:center;border-top:1px solid #eee}
    .actions p{font-size:13px;color:#555;margin-bottom:20px}
    .btn{display:inline-block;padding:16px 40px;margin:6px;text-decoration:none;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-radius:3px}
    .approve{background:#22c55e;color:#fff}
    .deny{background:#ef4444;color:#fff}
    .footer{padding:20px 32px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Identity Verification</h1>
    <p>New KYC submission requires your review</p>
  </div>
  <div class="body">
    <div class="field"><div class="label">Full Name</div><div class="value">${
      escapeHtml(fullName)
    }</div></div>
    <div class="field"><div class="label">User ID</div><div class="value">${
      escapeHtml(payload.userId)
    }</div></div>
    <div class="field"><div class="label">Email Address</div><div class="value">${
      escapeHtml(payload.email)
    }</div></div>
    <div class="field"><div class="label">Country</div><div class="value">${
      escapeHtml(countryName)
    }</div></div>
    <div class="field"><div class="label">Verification Method</div><div class="value">${
      escapeHtml(methodName)
    }</div></div>
    <div class="field"><div class="label">Document Type</div><div class="value">${
      escapeHtml(documentName)
    }</div></div>

    ${
      payload.documentUrl
        ? `
    <div class="doc-section">
      <div class="label">Submitted Document Photo</div>
      ${
          isImage
            ? `<img src="${
              escapeHtml(payload.documentUrl)
            }" alt="Identity Document" />`
            : `<a href="${
              escapeHtml(payload.documentUrl)
            }" class="doc-link" target="_blank">📄 Open Document File</a>`
        }
    </div>
    `
        : ""
    }
  </div>

  <div class="actions">
    <p><strong>Please review the document above and choose an action:</strong></p>
    <a href="${approveUrl}" class="btn approve">✓ Approve Verification</a>
    <a href="${denyUrl}" class="btn deny">✗ Deny Verification</a>
  </div>

  <div class="footer">
    Automated notification — Braxel Markets KYC System<br/>
    Submitted: ${new Date().toUTCString()}
  </div>
</div>
</body>
</html>`;

    const emailText = `IDENTITY VERIFICATION — Braxel Markets

Full Name: ${fullName}
User ID:   ${payload.userId}
Email:     ${payload.email}
Country:   ${countryName}
Method:    ${methodName}
Document:  ${documentName}
${payload.documentUrl ? `Document:  ${payload.documentUrl}` : ""}
Submitted: ${new Date().toISOString()}

--- ACTION REQUIRED ---
APPROVE: ${approveUrl}
DENY:    ${denyUrl}`;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Braxel Markets KYC <kyc@braxelmarkets.com>",
          to: COMPANY_EMAIL,
          subject: "Identity Verification",
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        throw new Error(`Resend API failed: ${res.statusText}`);
      }

      const result = await res.json();
      return new Response(
        JSON.stringify({ success: true, emailId: result.id }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      console.log("KYC NOTIFICATION (Resend not configured):", {
        to: COMPANY_EMAIL,
        userId: payload.userId,
        email: payload.email,
        approveUrl,
        denyUrl,
      });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Logged — configure RESEND_API_KEY to send emails",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("KYC notification error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
