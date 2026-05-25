export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { runRssIngestion } from "@/lib/ingestion/rss-ingester";
import { runYouTubeIngestion } from "@/lib/ingestion/youtube-ingester";
import { invalidateCacheKeys } from "@/lib/redis/client";

async function handleRefreshFeeds(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const isCronSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isServiceRole = authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
    
    // Vercel Cron jobs send x-vercel-cron header
    const isVercelCronHeader = req.headers.get("x-vercel-cron") === "true";
    const isDev = process.env.NODE_ENV === "development";

    // Authenticate: Allow in dev, or if Vercel CRON secret matches, or Supabase Service Key matches, or x-vercel-cron is present
    if (!isDev && !isCronSecret && !isServiceRole && !isVercelCronHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`CRON/API Triggered: Refreshing Feeds (${req.method})`);

    // Run ingestions concurrently
    const [rssStats, youtubeStats] = await Promise.all([
      runRssIngestion(),
      runYouTubeIngestion(),
    ]);

    // Invalidate Redis caches to make sure all landing page and discover views immediately display fresh content
    await invalidateCacheKeys("content:*");
    await invalidateCacheKeys("ministries*");

    return NextResponse.json({
      success: true,
      method: req.method,
      rssStats,
      youtubeStats,
    });
  } catch (error: any) {
    console.error("Error in refresh-feeds handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleRefreshFeeds(req);
}

export async function POST(req: Request) {
  return handleRefreshFeeds(req);
}
