# Gospel Lens — Deployment Guide

**GitHub Repo:** https://github.com/Hogwartsofweb3/gospellens  
**Hosting:** Vercel  
**Domain:** To be added when build is finalized

---

## Step 1 — Push Code to GitHub

In your terminal, from the `Gospel Lens` project folder:

```bash
git init
git remote add origin https://github.com/Hogwartsofweb3/gospellens.git
git add .
git commit -m "feat: Gospel Lens MVP — all phases complete"
git branch -M main
git push -u origin main
```

> If the repo already has commits, use `git push --force` (only safe on first push).

---

## Step 2 — Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New → Project"**
3. Select **"Hogwartsofweb3/gospellens"** from the list
4. Vercel will auto-detect Next.js — click **"Deploy"** (it will fail on first deploy without env vars — that's OK)
5. Go to your project **Settings → Environment Variables**

---

## Step 3 — Set Environment Variables in Vercel

Add every variable below to **Production**, **Preview**, and **Development** environments:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (secret) |
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs → YouTube Data API v3 |
| `UPSTASH_REDIS_URL` | Upstash Console → your Redis database |
| `UPSTASH_REDIS_TOKEN` | Upstash Console → your Redis database |
| `CRON_SECRET` | Your generated value: `piFvZHq6Ji5Moo6BBp6Qj5ff4dICidbuRJnOFLuZe2U=` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Step 6 below |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_PRICE_SUPPORTER_MONTHLY` | Stripe Dashboard → Products |
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | e.g. `Gospel Lens <noreply@yourdomain.com>` |
| `NEXT_PUBLIC_SITE_URL` | Your production URL e.g. `https://gospellens.vercel.app` |
| `SENTRY_DSN` | Sentry Dashboard → Project → Settings → SDK Setup |
| `SENTRY_ORG` | Your Sentry org slug |
| `SENTRY_PROJECT` | Your Sentry project slug |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog Dashboard → Project Settings |

After adding all variables, click **"Redeploy"** from the Deployments tab.

---

## Step 4 — Set Up Supabase for Production

### 4.1 — Allowed Auth URLs
- Go to Supabase Dashboard → **Authentication → URL Configuration**
- Add your Vercel production URL to **Site URL**: `https://gospellens.vercel.app`
- Add to **Redirect URLs**: `https://gospellens.vercel.app/**`

### 4.2 — Enable Row Level Security
- Go to **Database → Tables**
- Verify RLS is enabled on: `users`, `content`, `ministries`, `bookmarks`, `user_follows`, `subscriptions`, `notifications`

### 4.3 — Enable Automatic Backups
- Go to **Project Settings → Database**
- Enable **Point in Time Recovery** (requires Pro plan) or rely on daily backups on free plan

---

## Step 5 — Register Stripe Webhook (Production)

Once your Vercel URL is live:

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://gospellens.vercel.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **"Add endpoint"** → copy the **Signing secret** (`whsec_...`)
6. Add it to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

### Switch Stripe to Live Mode (when ready for real payments)
- Replace `sk_test_...` with `sk_live_...` in Vercel env vars
- Replace `pk_test_...` with `pk_live_...`
- Register a new webhook endpoint for live mode (same steps as above)

---

## Step 6 — Set Up Sentry

1. Go to [https://sentry.io](https://sentry.io) and create an account
2. Create a new project → select **Next.js**
3. Copy your **DSN** from the setup page
4. Add to Vercel: `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
5. Sentry will automatically capture errors from the Sentry configs in the codebase

---

## Step 7 — Vercel Cron Job (RSS Refresh)

The `vercel.json` is already configured with:
```json
{
  "crons": [{ "path": "/api/admin/refresh-feeds", "schedule": "*/30 * * * *" }]
}
```

This runs the RSS ingester every 30 minutes automatically on Vercel. No external cron service needed.

> **Important:** The `/api/admin/refresh-feeds` endpoint checks the `CRON_SECRET` header. Vercel calls it automatically — no action needed.

---

## Step 8 — Add Your Custom Domain (When Ready)

1. Vercel → Project → **Settings → Domains**
2. Add your domain
3. Follow Vercel's DNS instructions (add CNAME or A record at your registrar)
4. After domain is live, update `NEXT_PUBLIC_SITE_URL` env var to your custom domain
5. Update Supabase Auth allowed URLs with your custom domain
6. Update Stripe webhook endpoint URL to your custom domain

---

## Step 9 — Launch Checklist

Run through this before announcing Gospel Lens publicly:

### Functionality
- [ ] All pages load without console errors
- [ ] Sign up → onboarding → home feed works end-to-end
- [ ] Content loads from real RSS feeds (visit `/home` and check)
- [ ] RSS CRON job is running (check Vercel → Functions → Cron Jobs)
- [ ] Stripe test checkout completes successfully
- [ ] Stripe webhook delivers correctly (check Stripe Dashboard → Webhooks → Recent deliveries)
- [ ] Donation email arrives via Resend after test checkout
- [ ] Supporter badge appears on profile after Supporter subscription

### SEO & Discovery
- [ ] `/sitemap.xml` returns valid XML with content URLs
- [ ] `/robots.txt` returns correct directives
- [ ] OG image shows correctly — test at https://opengraph.xyz
- [ ] Privacy Policy live at `/privacy-policy`
- [ ] Terms of Service live at `/terms`

### Mobile & Performance
- [ ] App is responsive at 390px (iPhone), 768px (tablet), 1440px (desktop)
- [ ] Images load correctly (no broken images from external sources)
- [ ] No horizontal scroll on mobile

### Monitoring
- [ ] Sentry is receiving errors (trigger a test error in dev tools)
- [ ] Vercel Analytics is enabled (Vercel → Project → Analytics tab)

---

## Ongoing Maintenance

| Task | When |
|---|---|
| Update Supabase migrations for schema changes | Before each new feature |
| Rotate `CRON_SECRET` | Every 6 months |
| Switch Stripe to live mode | When accepting real payments |
| Monitor Sentry for new errors | Weekly |
| Check Vercel usage limits | Monthly |
| Review Supabase DB size | Monthly |
