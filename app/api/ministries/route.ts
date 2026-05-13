import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCachedData, setCachedData } from "@/lib/redis/client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const cacheKey = "ministries:all";
    const cachedResult = await getCachedData(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    const { data, error } = await supabase
      .from("ministries")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;

    const result = { data };

    // Cache ministries for 60 mins
    await setCachedData(cacheKey, result, 3600);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching ministries:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
