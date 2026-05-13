import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/email/client";
import {
  donationThankYouEmail,
  supporterWelcomeEmail,
  supporterCancelledEmail,
  paymentFailedEmail,
} from "@/lib/email/templates";
import Stripe from "stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Checkout completed ─────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        const userId = meta.user_id;
        const userName = meta.user_name || "friend";
        const userEmail = session.customer_email || session.customer_details?.email || "";

        if (meta.type === "donation") {
          // Send thank-you email
          if (userEmail) {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: userEmail,
              subject: "Thank you for your gift to Gospel Lens 🙏",
              html: donationThankYouEmail(userName, `$${meta.amount}`),
            });
          }
        }

        if (meta.type === "supporter" && userId) {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

          // Update Supabase
          await supabase.from("users").update({ is_premium: true }).eq("id", userId);
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
            plan: "premium",
            status: "active",
          }, { onConflict: "user_id" });

          // Send welcome email
          if (userEmail) {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: userEmail,
              subject: "Welcome to Gospel Lens Supporter ✦",
              html: supporterWelcomeEmail(userName),
            });
          }
        }
        break;
      }

      // ── Subscription updated ───────────────────────────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        const status = sub.status;
        const isActive = ["active", "trialing"].includes(status);

        await supabase.from("users").update({ is_premium: isActive }).eq("id", userId);
        await supabase.from("subscriptions").update({
          status: status as any,
        }).eq("user_id", userId);
        break;
      }

      // ── Subscription deleted/cancelled ─────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.user_id;
        if (!userId) break;

        await supabase.from("users").update({ is_premium: false }).eq("id", userId);
        await supabase.from("subscriptions").update({
          status: "cancelled",
          plan: "free",
        }).eq("user_id", userId);

        // Get user email to send cancellation email
        const { data: userData } = await supabase
          .from("users").select("email, full_name").eq("id", userId).single();
        if (userData?.email) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: userData.email,
            subject: "Your Gospel Lens Supporter subscription has ended",
            html: supporterCancelledEmail(userData.full_name || "friend"),
          });
        }
        break;
      }

      // ── Payment failed ─────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const { data: sub } = await supabase
          .from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).single();
        if (!sub?.user_id) break;

        const { data: userData } = await supabase
          .from("users").select("email, full_name").eq("id", sub.user_id).single();
        if (userData?.email) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: userData.email,
            subject: "Gospel Lens — Payment failed",
            html: paymentFailedEmail(userData.full_name || "friend"),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error processing webhook ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
