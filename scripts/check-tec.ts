import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log("Checking TEC content...");
  
  // Find ministry first
  const { data: ministry } = await supabase
    .from("ministries")
    .select("id, name, slug")
    .eq("slug", "this-excellent-church")
    .single();
    
  if (!ministry) {
    console.error("Ministry not found");
    return;
  }
  
  console.log(`Ministry: ${ministry.name} (${ministry.id})`);
  
  const { data: content, error } = await supabase
    .from("content")
    .select("id, title, source_url, content_type")
    .eq("ministry_id", ministry.id)
    .limit(10);
    
  if (error) {
    console.error(error);
    return;
  }
  
  for (const item of content || []) {
    console.log(`- [${item.content_type}] ${item.title}`);
    console.log(`  Source URL: ${item.source_url}`);
  }
}

check();
