import Parser from "rss-parser";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@supabase/supabase-js";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

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
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

// Helper: polite delay between HTTP requests
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  return parts[0] || null;
}

// Sanitize allowed HTML tags for article body
const ARTICLE_ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  "img", "h1", "h2", "h3", "h4", "h5", "figure", "figcaption", "picture", "source",
]);
const ARTICLE_ALLOWED_ATTRS = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "alt", "width", "height", "loading"],
  a: ["href", "title", "target", "rel"],
  "*": ["class"],
};

/**
 * Fetch the full article HTML from a URL using @mozilla/readability.
 * Returns { content, thumbnail } where content is clean sanitized HTML
 * and thumbnail is the OpenGraph image URL (or null).
 */
async function fetchFullArticleContent(url: string, fallbackThumbnail: string | null): Promise<{
  content: string | null;
  thumbnail: string | null;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return { content: null, thumbnail: fallbackThumbnail };

    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    // Extract OpenGraph / Twitter thumbnail
    let thumbnail: string | null = fallbackThumbnail;
    const ogImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ||
      doc.querySelector('meta[property="og:image:secure_url"]')?.getAttribute("content");
    if (ogImage && ogImage.startsWith("http")) {
      thumbnail = ogImage;
    }

    // Extract main article content using Readability
    const reader = new Readability(doc, {
      charThreshold: 200, // minimum character count to consider it readable
    });
    const article = reader.parse();

    if (!article || !article.content || article.content.length < 200) {
      return { content: null, thumbnail };
    }

    // Sanitize the extracted HTML
    const cleanContent = sanitizeHtml(article.content, {
      allowedTags: ARTICLE_ALLOWED_TAGS,
      allowedAttributes: ARTICLE_ALLOWED_ATTRS,
      allowedSchemes: ["http", "https", "mailto", "data"],
      transformTags: {
        a: sanitizeHtml.simpleTransform("a", {
          target: "_blank",
          rel: "noopener noreferrer",
        }),
      },
    });

    return { content: cleanContent || null, thumbnail };
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.warn(`[fetch-content] Failed for ${url}: ${err.message}`);
    }
    return { content: null, thumbnail: fallbackThumbnail };
  }
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

  const stats = { fetched: 0, inserted: 0, skipped: 0, errors: 0, enriched: 0 };

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

          // Get RSS-provided content (often only a summary/excerpt)
          const rawRssContent = (item as any)["content:encoded"] || item.content || item.contentSnippet || "";
          const rssContent = rawRssContent
            ? sanitizeHtml(rawRssContent, {
                allowedTags: ARTICLE_ALLOWED_TAGS,
                allowedAttributes: ARTICLE_ALLOWED_ATTRS,
              })
            : null;

          // Get RSS-provided thumbnail
          const rssThumbnail =
            (item as any).itunesImage?.href ||
            (item as any).mediaContent?.["$"]?.url ||
            (item as any).mediaThumbnail?.["$"]?.url ||
            null;

          const durationSeconds = parseDuration(item.itunesDuration as string);
          const articleUrl = item.link!;

          // For articles: always try to fetch full content + real thumbnail from the source page
          let fullContent: string | null = null;
          let finalThumbnail: string | null = rssThumbnail || ministry.logo_url || null;

          if (contentType === "article") {
            await delay(800); // polite crawl delay
            const fetched = await fetchFullArticleContent(articleUrl, finalThumbnail);
            if (fetched.content) {
              fullContent = fetched.content;
              stats.enriched++;
            }
            if (fetched.thumbnail) {
              finalThumbnail = fetched.thumbnail;
            }
          }

          // Use full content if available, fallback to RSS content
          const finalContent = fullContent || rssContent;

          const payload = {
            ministry_id: ministry.id,
            title: item.title,
            description: finalContent,
            content_type: contentType,
            source_url:
              (contentType === "podcast" || contentType === "audio") && item.enclosure?.url
                ? item.enclosure.url
                : articleUrl,
            thumbnail_url: finalThumbnail,
            duration_seconds: durationSeconds,
            published_at:
              item.isoDate || item.pubDate
                ? new Date(item.isoDate || item.pubDate!).toISOString()
                : new Date().toISOString(),
            topic_tags: topicTags,
            content_fetched: contentType === "article" && !!fullContent,
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
            ingestion_error_count: 0,
          })
          .eq("id", ministry.id);
      } catch (err) {
        console.error(`Error processing feed ${feedUrl} for ${ministry.name}:`, err);
        stats.errors++;
        await supabase.rpc("increment_ingestion_error", { min_id: ministry.id });
      }
    }
  }

  console.log("RSS Ingestion complete:", stats);
  return stats;
}
