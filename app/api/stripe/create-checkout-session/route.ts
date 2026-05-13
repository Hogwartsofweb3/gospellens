import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { type, amount, userId, userEmail, userName } = await req.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    // ── DONATION (one-time) ────────────────────────────────────────────────
    if (type === "donation") {
      const amountCents = Math.round(parseFloat(amount) * 100);
      if (!amountCents || amountCents < 100) {
        return NextResponse.json({ error: "Minimum donation is $1.00" }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: {
                name: "Gospel Lens Donation",
                description: "Thank you for supporting Gospel Lens! 🙏",
                images: [`${appUrl}/og-image.png`],
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "donation",
          user_id: userId || "",
          amount: amount.toString(),
          user_name: userName || "",
        },
        success_url: `${appUrl}/profile?donated=true`,
        cancel_url: `${appUrl}/profile`,
      });

      return NextResponse.json({ url: session.url });
    }

    // ── SUPPORTER SUBSCRIPTION (recurring) ────────────────────────────────
    if (type === "supporter") {
      const priceId = process.env.STRIPE_PRICE_SUPPORTER_MONTHLY;
      if (!priceId) {
        return NextResponse.json({ error: "Supporter price not configured" }, { status: 500 });
      }

      // Check if customer already exists
      let customerId: string | undefined;
      if (userEmail) {
        const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
        customerId = existing.data[0]?.id;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: customerId,
        customer_email: customerId ? undefined : userEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          trial_period_days: 7,
          metadata: { user_id: userId || "" },
        },
        metadata: {
          type: "supporter",
          user_id: userId || "",
          user_name: userName || "",
        },
        allow_promotion_codes: true,
        success_url: `${appUrl}/profile?supporter=true`,
        cancel_url: `${appUrl}/profile`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
