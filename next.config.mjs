import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "**.gstatic.com" },
      { protocol: "https", hostname: "img.icons8.com" },
      { protocol: "https", hostname: "www.desiringgod.org" },
      { protocol: "https", hostname: "www.thegospelcoalition.org" },
      { protocol: "https", hostname: "www.ligonier.org" },
      { protocol: "https", hostname: "www.gty.org" },
      { protocol: "https", hostname: "bibleproject.com" },
      { protocol: "https", hostname: "gospelinlife.com" },
      { protocol: "https", hostname: "www.monergism.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },

  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js needs unsafe-eval in dev
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.posthog.com app.posthog.com",
              // API connections to Supabase, PostHog, Sentry, Upstash
              "connect-src 'self' *.supabase.co *.supabase.in wss://*.supabase.co *.sentry.io *.posthog.com app.posthog.com *.upstash.io",
              // Images from YouTube, Supabase Storage, CDNs, Icons8, and Ministry official websites
              "img-src 'self' data: blob: i.ytimg.com img.youtube.com *.supabase.co *.supabase.in *.amazonaws.com *.cloudfront.net *.googleapis.com img.icons8.com www.desiringgod.org www.thegospelcoalition.org www.ligonier.org www.gty.org bibleproject.com gospelinlife.com www.monergism.com",
              // YouTube embeds only
              "frame-src 'self' *.youtube.com youtube.com",
              // Google Fonts
              "font-src 'self' fonts.gstatic.com fonts.googleapis.com",
              // Style from self and Google Fonts
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              // Microphone/camera not needed
              // Media: allow podcast audio from CDNs (podbean, simplecast, feedburner, etc.)
              "media-src 'self' blob: *.supabase.co *.amazonaws.com *.cloudfront.net *.podbean.com *.simplecast.com *.simplecastaudio.com *.buzzsprout.com *.soundcloud.com *.podomatic.com feeds.gty.org *.ligonier.org desiringgod.org *.desiringgod.org *.feedburner.com *.rsshub.app media.blubrry.com *.transistor.fm *.spreaker.com *.podtrac.com *.libsyn.com *.renewingyourmind.org renewingyourmind.org *.thegospelcoalition.org anchor.fm *.anchor.fm *.spotify.com *.spotifycdn.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Upload source maps in production builds only
  silent: true, // Suppress logs unless there's an error
  widenClientFileUpload: true,
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  // Automatically instrument Next.js data fetching methods
  automaticVercelMonitors: true,
});
