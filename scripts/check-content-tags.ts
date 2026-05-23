import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  console.log("Checking DB content and tags...");
  
  const { data: content, error } = await supabase
    .from("content")
    .select("id, title, content_type, topic_tags, description")
    .limit(10);
    
  if (error) {
    console.error("Error reading content:", error);
    return;
  }
  
  console.log("Total content count fetched:", content?.length);
  for (const item of content || []) {
    console.log(`- [${item.content_type}] ${item.title}`);
    console.log(`  Tags:`, item.topic_tags);
    console.log(`  Desc (first 100 char):`, item.description?.substring(0, 100));
    console.log();
  }

  // Count tags
  const { data: allContent, error: allErr } = await supabase
    .from("content")
    .select("topic_tags");
  if (!allErr && allContent) {
    const tagCounts: Record<string, number> = {};
    allContent.forEach(item => {
      if (item.topic_tags) {
        item.topic_tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    console.log("All tags in DB and their counts:", tagCounts);
  }
}

check();
