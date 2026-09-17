export type OtpEmailPurpose = 'registration' | 'password_reset';

interface OtpEmailTemplateInput {
  otp: string;
  purpose: OtpEmailPurpose;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function otpEmailTemplate({
  otp,
  purpose,
}: OtpEmailTemplateInput): string {
  const instruction = purpose === 'registration'
    ? 'Enter this code to verify your email address.'
    : 'Enter this code to reset your XpertAssistant password.';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>XpertAssistant verification code</title>
  </head>
  <body style="margin:0;background:#f4f7fb;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px;">
            <tr>
              <td>
                <h1 style="margin:0 0 16px;font-size:24px;color:#172033;">XpertAssistant</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">${instruction}</p>
                <p style="margin:0 0 24px;padding:18px;text-align:center;background:#eef3ff;border-radius:8px;font-size:32px;letter-spacing:8px;font-weight:700;color:#3155c8;">${escapeHtml(otp)}</p>
                <p style="margin:0;font-size:14px;line-height:1.5;color:#5c667a;">This code expires in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
