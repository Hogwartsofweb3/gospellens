import { Resend } from "resend";

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
  console.warn("⚠️ Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "dummy-key");
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "info.gospellens@gmail.com";
