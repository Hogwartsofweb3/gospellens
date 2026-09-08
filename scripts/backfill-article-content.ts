/**
 * Backfill Script: Fetch full article content + thumbnails for all existing articles
 * 
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/backfill-article-content.ts
 *   npx ts-node --project tsconfig.json scripts/backfill-article-content.ts --ministry monergism
 *   npx ts-node --project tsconfig.json scripts/backfill-article-content.ts --limit 100
 */

import { createClient } from "@supabase/supabase-js";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ARTICLE_ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  "img", "h1", "h2", "h3", "h4", "h5", "figure", "figcaption", "picture", "source",
]);
const ARTICLE_ALLOWED_ATTRS = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "alt", "width", "height", "loading"],
  a: ["href", "title", "target", "rel"],
  "*": ["class"],
};

async function fetchAndExtract(url: string): Promise<{
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

    if (!res.ok) {
      console.warn(`  HTTP ${res.status} for ${url}`);
      return { content: null, thumbnail: null };
    }

    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;

    // Extract OpenGraph / Twitter thumbnail
    let thumbnail: string | null = null;
    const ogImage =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") ||
      doc.querySelector('meta[property="og:image:secure_url"]')?.getAttribute("content");
    if (ogImage && ogImage.startsWith("http")) {
      thumbnail = ogImage;
    }

    // Extract main article body
    const reader = new Readability(doc, { charThreshold: 200 });
    const article = reader.parse();

    if (!article?.content || article.content.length < 200) {
      return { content: null, thumbnail };
    }

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
      console.warn(`  Error: ${err.message}`);
    }
    return { content: null, thumbnail: null };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const ministryArg = args[args.indexOf("--ministry") + 1] || null;
  const limitArg = parseInt(args[args.indexOf("--limit") + 1] || "500", 10);
  const batchSize = 20;

  console.log(`\n🔍 Gospel Lens - Article Content Backfill`);
  console.log(`   Ministry: ${ministryArg || "ALL"}`);
  console.log(`   Max articles: ${limitArg}`);
  console.log(`   Batch size: ${batchSize}\n`);

  // Get ministry ID if filtering
  let ministryId: string | null = null;
  if (ministryArg) {
    const { data } = await supabase
      .from("ministries")
      .select("id, name")
      .eq("slug", ministryArg)
      .single();
    if (!data) {
      console.error(`❌ Ministry "${ministryArg}" not found`);
      process.exit(1);
    }
    ministryId = data.id;
    console.log(`✅ Ministry found: ${data.name} (${data.id})`);
  }

  const stats = { processed: 0, enriched: 0, thumbnail_updated: 0, errors: 0, skipped: 0 };
  let offset = 0;
  let hasMore = true;

  while (hasMore && stats.processed < limitArg) {
    const batchLimit = Math.min(batchSize, limitArg - stats.processed);

    let query = supabase
      .from("content")
      .select("id, source_url, thumbnail_url, title, ministry_id")
      .eq("content_type", "article")
      .eq("content_fetched", false)
      .order("published_at", { ascending: false })
      .range(offset, offset + batchLimit - 1);

    if (ministryId) {
      query = query.eq("ministry_id", ministryId);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      break;
    }

    if (!articles || articles.length === 0) {
      console.log("✅ No more articles to process.");
      hasMore = false;
      break;
    }

    console.log(`📦 Processing batch ${Math.floor(offset / batchSize) + 1} (${articles.length} articles)...`);

    for (const article of articles) {
      stats.processed++;
      process.stdout.write(
        `  [${stats.processed}/${Math.min(limitArg, stats.processed + (articles.length - articles.indexOf(article)))}] ${article.title?.slice(0, 60)}...`
      );

      await delay(800); // polite delay between requests

      const { content, thumbnail } = await fetchAndExtract(article.source_url);
      const updatePayload: Record<string, any> = { content_fetched: true };

      if (content) {
        updatePayload.description = content;
        stats.enriched++;
        process.stdout.write(" ✓ content");
      } else {
        stats.skipped++;
        process.stdout.write(" ✗ no content");
      }

      if (thumbnail && thumbnail !== article.thumbnail_url) {
        updatePayload.thumbnail_url = thumbnail;
        stats.thumbnail_updated++;
        process.stdout.write(" + thumbnail");
      }

      console.log(""); // newline

      const { error: updateError } = await supabase
        .from("content")
        .update(updatePayload)
        .eq("id", article.id);

      if (updateError) {
        console.error(`  ❌ Update failed: ${updateError.message}`);
        stats.errors++;
      }
    }

    offset += batchLimit;
    hasMore = articles.length === batchLimit;

    // Small pause between batches
    if (hasMore && stats.processed < limitArg) {
      console.log(`  ⏳ Batch complete. Pausing 2s before next batch...\n`);
      await delay(2000);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Backfill complete!`);
  console.log(`   Processed:        ${stats.processed}`);
  console.log(`   Full content:     ${stats.enriched}`);
  console.log(`   Thumbnails fixed: ${stats.thumbnail_updated}`);
  console.log(`   No content found: ${stats.skipped}`);
  console.log(`   Errors:           ${stats.errors}`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch(console.error);
