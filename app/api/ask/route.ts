export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resend } from "@/lib/email/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, question } = body;

    if (!question || question.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a more detailed question (at least 10 characters)." }, { status: 400 });
    }
    if (question.trim().length > 2000) {
      return NextResponse.json({ error: "Question is too long (max 2000 characters)." }, { status: 400 });
    }

    const senderName = name?.trim() || "Anonymous";
    const senderEmail = email?.trim() || "not provided";
    const submitted = new Date().toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });
    const safeQ = question.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Notify the Gospel Lens team
    await resend.emails.send({
      from: "Gospel Lens Questions <onboarding@resend.dev>",
      to: "info.gospellens@gmail.com",
      replyTo: email || undefined,
      subject: `New Theology Question from ${senderName}`,
      html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:Inter,Arial,sans-serif;color:#E0E0E0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1a0a2e,#0d1a3a);padding:28px 32px;text-align:center;border-bottom:1px solid #2A2A2A;">
<span style="display:inline-block;width:36px;height:36px;background:#E040A0;border-radius:8px;line-height:36px;text-align:center;color:white;font-size:20px;font-weight:900;">G</span>
<span style="color:white;font-size:20px;font-weight:700;font-family:Georgia,serif;vertical-align:middle;margin-left:10px;">Gospel Lens</span>
<p style="color:#B0B0B0;font-size:13px;margin:8px 0 0;">New question from the Ask page</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<h2 style="color:white;font-size:18px;font-weight:700;margin:0 0 20px;">Theology Question</h2>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr><td style="padding:5px 0;color:#9E9E9E;font-size:13px;width:90px;">From:</td><td style="padding:5px 0;color:white;font-size:14px;font-weight:600;">${senderName}</td></tr>
<tr><td style="padding:5px 0;color:#9E9E9E;font-size:13px;">Email:</td><td style="padding:5px 0;color:#29B6F6;font-size:14px;">${senderEmail}</td></tr>
<tr><td style="padding:5px 0;color:#9E9E9E;font-size:13px;">Submitted:</td><td style="padding:5px 0;color:white;font-size:14px;">${submitted}</td></tr>
</table>
<div style="background:#111;border-left:3px solid #E040A0;border-radius:4px;padding:20px 24px;">
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;margin:0;white-space:pre-wrap;">${safeQ}</p>
</div>
${email ? `<p style="margin-top:18px;color:#9E9E9E;font-size:13px;">Hit <strong style="color:white;">Reply</strong> to respond directly to ${senderName}.</p>` : ""}
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #2A2A2A;text-align:center;">
<p style="color:#616161;font-size:12px;margin:0;">Gospel Lens &middot; info.gospellens@gmail.com</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
    });

    // Send confirmation to user if they gave their email
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const shortQ = safeQ.slice(0, 300) + (question.trim().length > 300 ? "..." : "");
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gospellens.site";
      await resend.emails.send({
        from: "Gospel Lens <onboarding@resend.dev>",
        to: email,
        subject: "We received your question",
        html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1a0a2e,#0d1a3a);padding:28px 32px;text-align:center;border-bottom:1px solid #2A2A2A;">
<span style="display:inline-block;width:36px;height:36px;background:#E040A0;border-radius:8px;line-height:36px;text-align:center;color:white;font-size:20px;font-weight:900;">G</span>
<span style="color:white;font-size:20px;font-weight:700;font-family:Georgia,serif;vertical-align:middle;margin-left:10px;">Gospel Lens</span>
</td></tr>
<tr><td style="padding:36px 40px;">
<h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 12px;">Thank you, ${senderName}!</h1>
<p style="color:#9E9E9E;font-size:15px;line-height:1.7;margin:0 0 20px;">We received your question and our team will look into it. We review all questions and may feature selected answers on Gospel Lens.</p>
<div style="background:#111;border-left:3px solid #E040A0;border-radius:4px;padding:16px 20px;margin-bottom:24px;">
<p style="color:#B0B0B0;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Your question:</p>
<p style="color:#E0E0E0;font-size:14px;line-height:1.7;margin:0;">${shortQ}</p>
</div>
<p style="color:#9E9E9E;font-size:14px;line-height:1.7;margin:0 0 4px;">In the meantime, explore thousands of sermons, articles, and podcasts from trusted ministries.</p>
<a href="${siteUrl}/home" style="display:inline-block;background:#E040A0;color:white;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;margin-top:24px;">Continue Exploring</a>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #2A2A2A;text-align:center;">
<p style="color:#616161;font-size:12px;margin:0;">Gospel Lens &middot; Bringing the Word closer to you</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/ask:", error);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}
