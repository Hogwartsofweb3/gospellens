import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log("Checking audio URLs in DB...");
  const { data, error } = await supabase
    .from("content")
    .select("id, title, source_url, content_type")
    .in("content_type", ["podcast", "audio"])
    .limit(10);

  if (error) {
    console.error(error);
    return;
  }

  for (const item of data || []) {
    console.log(`- [${item.content_type}] ${item.title}`);
    console.log(`  Source URL: ${item.source_url}`);
  }
}

check();
