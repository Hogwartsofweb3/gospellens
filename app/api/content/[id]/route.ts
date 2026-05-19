export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Fetch the content
    const { data, error } = await supabase
      .from("content")
      .select("*, ministries(*)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return NextResponse.json({ error: "Not found" }, { status: 404 });
      throw error;
    }

    // Increment view count in background (non-blocking)
    supabase.rpc('increment_view_count', { content_id: id }).then();

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error(`Error fetching content ${params.id}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
