// ─── Shared email wrapper ─────────────────────────────────────────────────────
const emailBase = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gospel Lens</title>
</head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:'Inter',Arial,sans-serif;color:#E0E0E0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0a2e,#0d1a3a);padding:32px;text-align:center;border-bottom:1px solid #2A2A2A;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;background:#E040A0;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                <span style="color:white;font-size:20px;font-weight:900;line-height:36px;display:block;text-align:center;">G</span>
              </div>
              <span style="color:white;font-size:20px;font-weight:700;font-family:Georgia,serif;letter-spacing:-0.5px;">Gospel Lens</span>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:36px 40px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2A2A2A;text-align:center;">
            <p style="color:#616161;font-size:12px;margin:0;">
              Gospel Lens · Bringing the Word closer to you ·
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy-policy" style="color:#616161;">Privacy</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const emailHelpers = {
  btn: (text: string, href: string) =>
    `<a href="${href}" style="display:inline-block;background:#E040A0;color:white;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;margin-top:24px;">${text}</a>`,
  h1: (text: string) =>
    `<h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 12px;">${text}</h1>`,
  p: (text: string) =>
    `<p style="color:#9E9E9E;font-size:15px;line-height:1.7;margin:0 0 12px;">${text}</p>`,
  base: emailBase,
};

// ─── Templates ────────────────────────────────────────────────────────────────
// Payment/donation templates have been removed — Gospel Lens has no premium tier.
// Add future transactional email templates here (e.g. welcome email, weekly digest).
