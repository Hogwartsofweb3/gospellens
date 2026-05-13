import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCachedData, setCachedData } from "@/lib/redis/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cacheKey = "content:trending:top20";
    const cachedResult = await getCachedData(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Top 20 items by view_count in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("content")
      .select("*, ministries(name, logo_url, slug, is_verified)")
      .gte("published_at", sevenDaysAgo.toISOString())
      .order("view_count", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const result = { data };

    // Cache trending for 15 mins (900 seconds)
    await setCachedData(cacheKey, result, 900);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching trending content:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
