export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCachedData, setCachedData } from "@/lib/redis/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    const { slug } = params;

    // Fetch ministry ID first
    const ministryCacheKey = `ministry:${slug}`;
    let ministryData = await getCachedData<any>(ministryCacheKey);
    
    if (!ministryData) {
      const { data, error } = await supabase.from("ministries").select("id").eq("slug", slug).single();
      if (error) {
        if (error.code === "PGRST116") return NextResponse.json({ error: "Ministry not found" }, { status: 404 });
        throw error;
      }
      ministryData = { data };
      await setCachedData(ministryCacheKey, ministryData, 3600);
    }

    const ministryId = ministryData.data.id;
    const contentCacheKey = `content:ministry:${ministryId}:${type}:${page}:${limit}`;
    const cachedContent = await getCachedData(contentCacheKey);

    if (cachedContent) {
      return NextResponse.json(cachedContent);
    }

    let query = supabase
      .from("content")
      .select("*, ministries(name, logo_url, slug, is_verified)", { count: "exact" })
      .eq("ministry_id", ministryId);

    if (type !== "all") {
      query = query.eq("content_type", type);
    }

    query = query.order("published_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    const result = {
      data,
      metadata: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    };

    // Cache for 30 minutes
    await setCachedData(contentCacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error fetching content for ministry ${params.slug}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
