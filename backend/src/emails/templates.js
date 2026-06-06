/**
 * Inline-styled HTML email templates. Email clients strip <style> tags and have
 * no flexbox/grid support, so everything is table-based with inline styles —
 * the standard for reliable rendering across Gmail/Outlook/Apple Mail.
 */

const baseLayout = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">AuthPlatform</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1f2937;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
                You are receiving this email because an action was requested on your account.<br/>
                If this wasn't you, you can safely ignore this message.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const button = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:8px;background:#4f46e5;">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;

export const verificationEmailTemplate = ({ name, url }) =>
  baseLayout(
    'Verify your email',
    `<h1 style="margin:0 0 12px;font-size:22px;">Welcome, ${name}! 👋</h1>
     <p style="margin:0 0 8px;">Thanks for signing up. Please confirm your email address to activate your account.</p>
     ${button(url, 'Verify Email Address')}
     <p style="margin:0;color:#6b7280;font-size:13px;">This link expires in 24 hours. If the button doesn't work, copy and paste this URL:</p>
     <p style="margin:8px 0 0;word-break:break-all;color:#4f46e5;font-size:13px;">${url}</p>`
  );

export const passwordResetEmailTemplate = ({ name, url }) =>
  baseLayout(
    'Reset your password',
    `<h1 style="margin:0 0 12px;font-size:22px;">Password reset requested</h1>
     <p style="margin:0 0 8px;">Hi ${name}, we received a request to reset your password. Click below to choose a new one.</p>
     ${button(url, 'Reset Password')}
     <p style="margin:0;color:#6b7280;font-size:13px;">This link expires in 1 hour. If you didn't request this, no action is needed and your password stays the same.</p>
     <p style="margin:8px 0 0;word-break:break-all;color:#4f46e5;font-size:13px;">${url}</p>`
  );

export const welcomeEmailTemplate = ({ name }) =>
  baseLayout(
    'Welcome aboard',
    `<h1 style="margin:0 0 12px;font-size:22px;">Your email is verified 🎉</h1>
     <p style="margin:0;">Hi ${name}, your account is now fully active. You can log in and start exploring the platform.</p>`
  );

export default {
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  welcomeEmailTemplate,
};
