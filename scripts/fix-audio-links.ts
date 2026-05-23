import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser({
  customFields: {
    item: [
      ["enclosure", "enclosure"],
    ],
  },
});

async function fixAudioLinks() {
  console.log("Starting audio links backfill...");

  // Fetch all ministries with RSS feeds
  const { data: ministries, error } = await supabase
    .from("ministries")
    .select("*")
    .not("rss_feed_urls", "is", null);

  if (error || !ministries) {
    console.error("Failed to fetch ministries:", error);
    return;
  }

  let totalUpdated = 0;

  for (const ministry of ministries) {
    if (!ministry.rss_feed_urls || ministry.rss_feed_urls.length === 0) continue;

    for (const feedUrl of ministry.rss_feed_urls) {
      try {
        console.log(`Parsing feed for ${ministry.name}: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);

        for (const item of feed.items) {
          if (!item.title || !item.enclosure?.url) continue;

          // Find if there is a content row with matching title and ministry_id
          const { data: contentItems, error: findError } = await supabase
            .from("content")
            .select("id, title, source_url, content_type")
            .eq("ministry_id", ministry.id)
            .eq("title", item.title);

          if (findError) {
            console.error(`Error finding item: ${item.title}`, findError);
            continue;
          }

          if (contentItems && contentItems.length > 0) {
            for (const contentRow of contentItems) {
              // Only update if it's podcast/audio and currently has the webpage URL
              if (
                (contentRow.content_type === "podcast" || contentRow.content_type === "audio") &&
                contentRow.source_url !== item.enclosure.url
              ) {
                console.log(`Updating [${contentRow.content_type}] "${contentRow.title}":`);
                console.log(`  Old: ${contentRow.source_url}`);
                console.log(`  New: ${item.enclosure.url}`);

                const { error: updateError } = await supabase
                  .from("content")
                  .update({ source_url: item.enclosure.url })
                  .eq("id", contentRow.id);

                if (updateError) {
                  console.error(`Failed to update ${contentRow.id}:`, updateError.message);
                } else {
                  totalUpdated++;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(`Error processing feed ${feedUrl}:`, err);
      }
    }
  }

  console.log(`Audio links backfill completed. Total updated rows: ${totalUpdated}`);
}

fixAudioLinks();
