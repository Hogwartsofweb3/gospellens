import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCachedData, setCachedData } from "@/lib/redis/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const cacheKey = `ministry:${slug}`;
    const cachedResult = await getCachedData(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    const { data, error } = await supabase
      .from("ministries")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") return NextResponse.json({ error: "Not found" }, { status: 404 });
      throw error;
    }

    // Cache ministry for 60 mins
    await setCachedData(cacheKey, { data }, 3600);

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error(`Error fetching ministry ${params.slug}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
