import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@supabase/supabase-js";

// We use service role key for ingestion so it can bypass RLS for inserting
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const parser = new Parser({
  customFields: {
    item: [
      ["enclosure", "enclosure"],
      ["itunes:duration", "itunesDuration"],
      ["itunes:image", "itunesImage"],
      ["itunes:episode", "itunesEpisode"],
    ],
  },
});

// Helper for auto-tagging
function autoTagContent(title: string, description: string, baseTags: string[]): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const tags = new Set(baseTags);

  if (text.includes("sermon") || text.includes("preaching")) tags.add("Sermons");
  if (text.includes("prayer") || text.includes("intercession")) tags.add("Prayer");
  if (text.match(/family|marriage|parenting/)) tags.add("Family & Marriage");
  if (text.match(/youth|teen|young/)) tags.add("Youth & Teens");
  if (text.match(/bible|scripture|gospel/)) tags.add("Bible Study");
  if (text.match(/worship|praise|hymn/)) tags.add("Worship");
  if (text.match(/heal|miracle/)) tags.add("Healing & Miracles");
  if (text.match(/prophecy|prophetic/)) tags.add("Prophecy");
  if (text.match(/evangel|mission/)) tags.add("Evangelism");
  if (text.match(/leader|pastor|church/)) tags.add("Leadership");
  if (text.match(/women|sister|mother/)) tags.add("Women of Faith");

  return Array.from(tags);
}

// Convert "HH:MM:SS" or "MM:SS" to total seconds
function parseDuration(duration: string | undefined): number | null {
  if (!duration) return null;
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || null; // Return as-is if it's already in seconds format
}

export async function runRssIngestion() {
  console.log("Starting RSS Ingestion...");

  // Fetch all ministries with RSS feeds configured
  const { data: ministries, error } = await supabase
    .from("ministries")
    .select("*")
    .not("rss_feed_urls", "is", null);

  if (error || !ministries) {
    console.error("Failed to fetch ministries:", error);
    return;
  }

  const stats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

  for (const ministry of ministries) {
    if (!ministry.rss_feed_urls || ministry.rss_feed_urls.length === 0) continue;

    for (const feedUrl of ministry.rss_feed_urls) {
      try {
        console.log(`Fetching feed for ${ministry.name}: ${feedUrl}`);
        const feed = await parser.parseURL(feedUrl);
        stats.fetched += feed.items.length;

        for (const item of feed.items) {
          if (!item.title || !item.link) {
            stats.skipped++;
            continue;
          }

          // Determine content type
          let contentType = "article";
          if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith("audio")) {
            contentType = ministry.display_as === "podcast" ? "podcast" : "audio";
          }
          
          // Ligonier / New Advent specific feed-level tagging
          let feedSpecificTags: string[] = [];
          if (ministry.slug === "ligonier-ministries" && feedUrl.includes("r1ABLRDvACcJDKzb")) feedSpecificTags.push("Articles");
          if (ministry.slug === "ligonier-ministries" && feedUrl.includes("wJUVnz85sjSeAYuw")) feedSpecificTags.push("Q&A");
          if (ministry.slug === "new-advent" && feedUrl.includes("G9D8sZVL8eWQ0Mru")) feedSpecificTags.push("Church Fathers");
          if (ministry.slug === "new-advent" && feedUrl.includes("igOzEk5SPtCfnFBO")) feedSpecificTags.push("Summa Theologica");

          // Merge base tags with auto-tagged keywords
          const combinedBaseTags = [...(ministry.topic_tags || []), ...feedSpecificTags];
          const topicTags = autoTagContent(item.title, item.contentSnippet || "", combinedBaseTags);

          // Preserve safe HTML for in-app reading
          const rawContent = (item as any)["content:encoded"] || item.content || item.contentSnippet || "";
          const cleanDescription = rawContent 
            ? sanitizeHtml(rawContent, { 
                allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2' ]),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  'img': ['src', 'alt', 'width', 'height']
                }
              }) 
            : null;

          const durationSeconds = parseDuration(item.itunesDuration as string);
          
          const payload = {
            ministry_id: ministry.id,
            title: item.title,
            description: cleanDescription,
            content_type: contentType,
            source_url: item.link,
            thumbnail_url: (item as any).itunesImage?.href || ministry.logo_url || null,
            duration_seconds: durationSeconds,
            published_at: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!).toISOString() : new Date().toISOString(),
            topic_tags: topicTags,
          };

          // Upsert using source_url constraint to avoid duplicates
          const { error: upsertError } = await supabase
            .from("content")
            .upsert(payload, { onConflict: "source_url", ignoreDuplicates: false });

          if (upsertError) {
            console.error(`Failed to upsert item: ${item.title}`, upsertError);
            stats.errors++;
          } else {
            stats.inserted++;
          }
        }

        // Update tracking metrics
        await supabase
          .from("ministries")
          .update({ 
            last_ingested_at: new Date().toISOString(),
            ingestion_error_count: 0 // reset on success
          })
          .eq("id", ministry.id);

      } catch (err) {
        console.error(`Error processing feed ${feedUrl} for ${ministry.name}:`, err);
        stats.errors++;
        await supabase.rpc('increment_ingestion_error', { min_id: ministry.id });
      }
    }
  }

  console.log("RSS Ingestion complete:", stats);
  return stats;
}
