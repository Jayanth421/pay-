import { logMockEmail } from './mockData';

interface EmailPayload {
  to: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  paymentReference: string;
  upiId?: string;
  rejectionReason?: string;
}

export async function sendReceiptEmail(payload: EmailPayload): Promise<{ success: boolean; simulated?: boolean }> {
  const subject = `Thank you for contributing! — YEAHZZ (Ref: ${payload.paymentReference})`;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && !resendApiKey.includes('your-resend-key')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || process.env.EMAIL_FROM || 'YEAHZZ <noreply@yeahzz.in>',
          to: [payload.to],
          subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 2px solid #000000; border-radius: 16px; background: #ffffff; box-shadow: 4px 4px 0px #000000;">
              <div style="background: #FFDE59; padding: 18px; border: 2px solid #000000; border-radius: 12px; margin-bottom: 20px; box-shadow: 2px 2px 0px #000000;">
                <p style="margin: 0; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000000;">Official Confirmation • YEAHZZ</p>
                <h1 style="color: #000000; margin: 6px 0 0 0; font-size: 22px; font-weight: 900;">Thank You for Contributing!</h1>
              </div>

              <p style="color: #000000; font-size: 15px; font-weight: 600;">Dear <strong>${payload.studentName}</strong> (${payload.rollNumber}),</p>
              
              <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                Thank you for contributing to <strong>YEAHZZ</strong>! We have received your contribution details and registered your payment reference in our system.
              </p>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; border: 2px solid #000000; border-radius: 10px; overflow: hidden;">
                <tr style="background: #FAF9F6; border-bottom: 1px solid #000000;">
                  <td style="padding: 12px 14px; color: #555555; font-weight: bold;">Payment Reference:</td>
                  <td style="padding: 12px 14px; color: #000000; font-weight: 900; text-align: right; font-family: monospace;">${payload.paymentReference}</td>
                </tr>
                <tr style="border-bottom: 1px solid #000000;">
                  <td style="padding: 12px 14px; color: #555555; font-weight: bold;">Contribution Amount:</td>
                  <td style="padding: 12px 14px; color: #000000; font-weight: 900; text-align: right;">₹${payload.amount}</td>
                </tr>
                <tr style="background: #FAF9F6; border-bottom: 1px solid #000000;">
                  <td style="padding: 12px 14px; color: #555555; font-weight: bold;">Recipient UPI:</td>
                  <td style="padding: 12px 14px; color: #000000; font-weight: 700; text-align: right; font-family: monospace;">${payload.upiId || 'YEAHZZ'}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 14px; color: #555555; font-weight: bold;">Current Status:</td>
                  <td style="padding: 12px 14px; color: #d97706; font-weight: 900; text-align: right;">Awaiting Verification</td>
                </tr>
              </table>

              <div style="background: #FEFCE8; padding: 14px; border: 1.5px solid #000000; border-radius: 10px; font-size: 12px; color: #000000; line-height: 1.5; margin-bottom: 20px;">
                <strong>Notice:</strong> Your transaction reference is being verified against our accounts. A confirmation notice will follow once verified.
              </div>

              <div style="border-top: 2px solid #000000; padding-top: 16px; text-align: center;">
                <p style="margin: 0; font-size: 13px; font-weight: 900; color: #000000;">With sincere gratitude,</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 900; color: #000000;">Team YEAHZZ</p>
                <p style="margin: 8px 0 0 0; font-size: 11px; font-weight: 700; color: #666666;">YEAHZZ • <a href="https://yeahzz.in" style="color: #000000; text-decoration: underline;">yeahzz.in</a></p>
              </div>
            </div>
          `,
        }),
      });

      if (res.ok) {
        logMockEmail(payload.to, 'receipt_email_sent_live', subject, payload as unknown as Record<string, unknown>);
        return { success: true, simulated: false };
      } else {
        const errorText = await res.text();
        console.warn('Resend live call failed with status:', res.status, errorText);
      }
    } catch (e) {
      console.warn('Resend live call exception, falling back to simulated log:', e);
    }
  }

  logMockEmail(payload.to, 'receipt_email_pending_verification', subject, {
    ...payload,
    from: 'YEAHZZ <noreply@yeahzz.in>',
    disclaimer: 'Thank you for contributing from YEAHZZ',
  });
  return { success: true, simulated: true };
}

export async function sendApprovalEmail(payload: EmailPayload): Promise<{ success: boolean; simulated?: boolean }> {
  const subject = `Payment Verified & Approved — Thank You from YEAHZZ! (Ref: ${payload.paymentReference})`;

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && !resendApiKey.includes('your-resend-key')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || process.env.EMAIL_FROM || 'YEAHZZ <noreply@yeahzz.in>',
          to: [payload.to],
          subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 2px solid #000000; border-radius: 16px; background: #ffffff; box-shadow: 4px 4px 0px #000000;">
              <div style="background: #4ADE80; padding: 18px; border: 2px solid #000000; border-radius: 12px; margin-bottom: 20px; box-shadow: 2px 2px 0px #000000;">
                <p style="margin: 0; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000000;">Verified • YEAHZZ</p>
                <h1 style="color: #000000; margin: 6px 0 0 0; font-size: 22px; font-weight: 900;">Payment Verified & Approved!</h1>
              </div>

              <p style="color: #000000; font-size: 15px; font-weight: 600;">Dear <strong>${payload.studentName}</strong> (${payload.rollNumber}),</p>
              
              <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                We are thrilled to confirm that your contribution of <strong>₹${payload.amount}</strong> to <strong>YEAHZZ</strong> has been successfully reconciled and marked as <strong>Approved</strong>.
              </p>

              <div style="border: 2px solid #000000; border-radius: 10px; padding: 16px; margin: 20px 0; background: #FAF9F6; box-shadow: 2px 2px 0px #000000;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 900; text-transform: uppercase; color: #555555;">Official Verified Receipt:</p>
                <p style="margin: 4px 0; font-size: 14px; color: #000000;"><strong>Reference:</strong> <span style="font-family: monospace;">${payload.paymentReference}</span></p>
                <p style="margin: 4px 0; font-size: 14px; color: #000000;"><strong>Verified Amount:</strong> ₹${payload.amount}</p>
                <p style="margin: 4px 0; font-size: 14px; color: #000000;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 900;">APPROVED / CONFIRMED</span></p>
              </div>

              <p style="color: #333333; font-size: 14px; line-height: 1.6;">
                Thank you once again for supporting YEAHZZ. Please retain this email as proof of your contribution.
              </p>

              <div style="border-top: 2px solid #000000; padding-top: 16px; text-align: center; margin-top: 24px;">
                <p style="margin: 0; font-size: 13px; font-weight: 900; color: #000000;">Warm regards,</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 900; color: #000000;">Team YEAHZZ</p>
                <p style="margin: 8px 0 0 0; font-size: 11px; font-weight: 700; color: #666666;">YEAHZZ • <a href="https://yeahzz.in" style="color: #000000; text-decoration: underline;">yeahzz.in</a></p>
              </div>
            </div>
          `,
        }),
      });

      if (res.ok) {
        logMockEmail(payload.to, 'approval_email_sent_live', subject, payload as unknown as Record<string, unknown>);
        return { success: true, simulated: false };
      } else {
        const errorText = await res.text();
        console.warn('Live approval email failed:', res.status, errorText);
      }
    } catch (e) {
      console.warn('Live approval email exception:', e);
    }
  }

  logMockEmail(payload.to, 'approval_email_confirmed', subject, payload as unknown as Record<string, unknown>);
  return { success: true, simulated: true };
}

export async function sendRejectionEmail(payload: EmailPayload): Promise<{ success: boolean; simulated?: boolean }> {
  const subject = `Contribution Verification Notice — YEAHZZ (Ref: ${payload.paymentReference})`;
  logMockEmail(payload.to, 'rejection_email_sent', subject, payload as unknown as Record<string, unknown>);
  return { success: true, simulated: true };
}
