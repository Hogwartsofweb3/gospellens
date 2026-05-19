export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ministry_id } = await req.json();

  if (!ministry_id) return NextResponse.json({ error: "ministry_id required" }, { status: 400 });

  // Toggle logic
  const { data: existing } = await supabase
    .from("user_follows")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("ministry_id", ministry_id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("user_id", user.id)
      .eq("ministry_id", ministry_id);
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    
    // Decrement follower count
    await supabase.rpc('decrement_follower_count', { min_id: ministry_id }).then();
    
    return NextResponse.json({ status: "unfollowed" });
  } else {
    const { error } = await supabase
      .from("user_follows")
      .insert({ user_id: user.id, ministry_id });
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Increment follower count
    await supabase.rpc('increment_follower_count', { min_id: ministry_id }).then();
    
    return NextResponse.json({ status: "followed" });
  }
}
