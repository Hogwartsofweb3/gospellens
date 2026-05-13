import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Lower in production to reduce costs/noise
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay — only in production, opt-in
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 0,

  // Suppress known noise errors
  ignoreErrors: [
    "ChunkLoadError",
    "Loading chunk",
    "NetworkError",
    "Failed to fetch",
    "AbortError",
    /^ResizeObserver loop/,
  ],

  // Don't send PII
  sendDefaultPii: false,
});
