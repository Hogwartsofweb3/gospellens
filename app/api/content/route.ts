import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCachedData, setCachedData } from "@/lib/redis/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const topic = searchParams.get("topic") || "all";
    const ministryId = searchParams.get("ministry_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sort = searchParams.get("sort") || "latest";
    
    const offset = (page - 1) * limit;

    const search = searchParams.get("search");

    // Cache logic — don't cache search queries
    const cacheKey = !search
      ? `content:${type}:${topic}:${ministryId || "all"}:${sort}:${page}:${limit}`
      : null;

    if (cacheKey) {
      const cachedResult = await getCachedData(cacheKey);
      if (cachedResult) {
        return NextResponse.json(cachedResult);
      }
    }

    let query = supabase
      .from("content")
      .select("*, ministries(name, logo_url, slug, is_verified)", { count: "exact" });

    // Full-text search
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Apply Filters
    if (type !== "all") {
      query = query.eq("content_type", type);
    }
    
    if (topic !== "all") {
      query = query.contains("topic_tags", [topic]);
    }

    if (ministryId) {
      query = query.eq("ministry_id", ministryId);
    }

    // Apply Sorting
    if (sort === "trending") {
      query = query.order("view_count", { ascending: false }).order("published_at", { ascending: false });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

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

    // Cache result for 30 minutes (non-search only)
    if (cacheKey) {
      await setCachedData(cacheKey, result, 1800);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching content:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
