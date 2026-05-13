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

const pinkBtn = (text: string, href: string) =>
  `<a href="${href}" style="display:inline-block;background:#E040A0;color:white;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;margin-top:24px;">${text}</a>`;

const h1 = (text: string) =>
  `<h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 12px;">${text}</h1>`;

const p = (text: string) =>
  `<p style="color:#9E9E9E;font-size:15px;line-height:1.7;margin:0 0 12px;">${text}</p>`;

const check = (text: string) =>
  `<li style="color:#E0E0E0;font-size:14px;line-height:1.8;list-style:none;padding:2px 0;">
    <span style="color:#E040A0;margin-right:8px;">✓</span>${text}
  </li>`;

// ─── Templates ────────────────────────────────────────────────────────────────

export function donationThankYouEmail(name: string, amount: string) {
  return emailBase(`
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:48px;">🙏</span>
    </div>
    ${h1("Thank you for your gift!")}
    ${p(`Dear ${name || "friend"},`)}
    ${p(`Your generous donation of <strong style="color:white;">${amount}</strong> means the world to us. Gospel Lens is built with love to bring the best Christian content closer to believers everywhere — and gifts like yours keep it going.`)}
    ${p("Every penny goes toward server costs, development, and making the platform better for the whole community.")}
    <div style="text-align:center;">
      ${pinkBtn("Back to Gospel Lens", process.env.NEXT_PUBLIC_APP_URL || "https://gospellens.app")}
    </div>
    <p style="color:#616161;font-size:13px;text-align:center;margin-top:24px;">May God bless you richly. 🙏</p>
  `);
}

export function supporterWelcomeEmail(name: string) {
  return emailBase(`
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:48px;">✦</span>
    </div>
    ${h1("Welcome, Supporter!")}
    ${p(`Dear ${name || "friend"},`)}
    ${p("You are now a Gospel Lens Supporter — thank you from the bottom of our hearts. Your Supporter ✦ badge is now active on your profile.")}
    <ul style="margin:16px 0;padding:0;">
      ${check("Supporter ✦ badge on your profile")}
      ${check("Early access to new features")}
      ${check("Priority feedback channel")}
      ${check("The knowledge you're keeping the lights on 💡")}
    </ul>
    ${p("Remember — all content on Gospel Lens remains completely free for everyone. You're simply helping us do more of what we love.")}
    <div style="text-align:center;">
      ${pinkBtn("Go to My Profile", `${process.env.NEXT_PUBLIC_APP_URL}/profile`)}
    </div>
  `);
}

export function supporterCancelledEmail(name: string) {
  return emailBase(`
    ${h1("We'll miss you, Supporter.")}
    ${p(`Dear ${name || "friend"},`)}
    ${p("Your Gospel Lens Supporter subscription has been cancelled. Your Supporter badge will remain active until the end of your current billing period.")}
    ${p("All content on Gospel Lens remains completely free — your access to everything won't change at all.")}
    ${p("If you ever want to support us again, we'd be deeply grateful. 🙏")}
    <div style="text-align:center;">
      ${pinkBtn("Re-activate Support", `${process.env.NEXT_PUBLIC_APP_URL}/profile`)}
    </div>
  `);
}

export function paymentFailedEmail(name: string) {
  return emailBase(`
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:48px;">⚠️</span>
    </div>
    ${h1("Payment failed")}
    ${p(`Dear ${name || "friend"},`)}
    ${p("We weren't able to process your Supporter payment. Please update your payment method to keep your Supporter badge active.")}
    <div style="text-align:center;">
      ${pinkBtn("Update Payment Method", `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/customer-portal`)}
    </div>
    ${p("If you have any questions, just reply to this email — we're happy to help.")}
  `);
}
