// Supabase Edge Function: send-email
// Deploy via: supabase functions deploy send-email --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, recipient, studentName, rollNumber, amount, paymentReference, upiId, rejectionReason } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY environment variable not set. Email logged in console.");
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          message: "Email logged (RESEND_API_KEY not configured)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let htmlContent = "";

    if (type === "receipt") {
      subject = `[Campus Donation] Screenshot Received — Ref: ${paymentReference} (Awaiting Verification)`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <h2 style="color: #1e3a8a; margin: 0 0 6px 0; font-size: 20px;">Payment Screenshot Received</h2>
            <p style="color: #1e40af; margin: 0; font-size: 14px;"><strong>Important:</strong> This confirms receipt of your screenshot submission, NOT payment approval.</p>
          </div>
          <p style="color: #334155; font-size: 15px;">Dear <strong>${studentName}</strong> (${rollNumber}),</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Thank you for contributing! Your payment screenshot for reference <strong>${paymentReference}</strong> has been uploaded and queued for verification.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="text-align: right; font-weight: 600;">₹${amount}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b;">UPI ID:</td><td style="text-align: right; font-mono;">${upiId || 'Campus Account'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Status:</td><td style="text-align: right; color: #d97706; font-weight: 600;">Awaiting Verification</td></tr>
          </table>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">Campus Donation Management</p>
        </div>
      `;
    } else if (type === "approval") {
      subject = `[Campus Donation] Verified & Approved — Ref: ${paymentReference}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <h2 style="color: #065f46; margin: 0 0 6px 0; font-size: 20px;">Payment Verified & Approved</h2>
            <p style="color: #047857; margin: 0; font-size: 14px;">Your transaction has been officially verified by the campus finance team.</p>
          </div>
          <p style="color: #334155; font-size: 15px;">Dear <strong>${studentName}</strong> (${rollNumber}),</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            We confirm that your donation of <strong>₹${amount}</strong> (Ref: ${paymentReference}) has been approved and accounted for. Thank you for your support!
          </p>
        </div>
      `;
    } else {
      subject = `[Campus Donation] Payment Verification Notice — Ref: ${paymentReference}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #b91c1c;">Payment Verification Unsuccessful</h2>
          <p>Dear ${studentName},</p>
          <p>Your payment submission for reference <strong>${paymentReference}</strong> could not be verified.</p>
          <p>Reason: ${rejectionReason || 'Transaction could not be matched with bank record.'}</p>
        </div>
      `;
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") || "Campus Donation <onboarding@resend.dev>",
        to: [recipient],
        subject,
        html: htmlContent,
      }),
    });

    const emailData = await emailRes.json();
    return new Response(JSON.stringify({ success: true, emailData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
