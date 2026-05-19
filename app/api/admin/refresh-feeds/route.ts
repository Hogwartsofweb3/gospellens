export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { runRssIngestion } from "@/lib/ingestion/rss-ingester";
import { runYouTubeIngestion } from "@/lib/ingestion/youtube-ingester";
import { invalidateCacheKeys } from "@/lib/redis/client";

export async function POST(req: Request) {
  try {
    // Basic auth check against Service Role Key (simple shared secret for CRON)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("CRON Triggered: Refreshing Feeds");

    // Run ingestions concurrently
    const [rssStats, youtubeStats] = await Promise.all([
      runRssIngestion(),
      runYouTubeIngestion(),
    ]);

    // Invalidate caches matching our keys
    await invalidateCacheKeys("content:*");
    await invalidateCacheKeys("ministries*");

    return NextResponse.json({
      success: true,
      rssStats,
      youtubeStats,
    });
  } catch (error: any) {
    console.error("Error in refresh-feeds CRON:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
