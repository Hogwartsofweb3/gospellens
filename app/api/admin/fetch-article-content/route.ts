export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minute max for Vercel

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";

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
        "User-Agent": "Mozilla/5.0 (compatible; GospelLensBot/1.0; +https://gospellens.site)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return { content: null, thumbnail: null };

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

    // Extract main article content
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
    return { content: null, thumbnail: null };
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const isAuthorized =
      authHeader === `Bearer ${process.env.CRON_SECRET}` ||
      authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` ||
      process.env.NODE_ENV === "development";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { ministry_slug, limit = 50, offset = 0 } = body;

    // Build query for un-enriched articles
    let query = supabase
      .from("content")
      .select("id, source_url, thumbnail_url, title")
      .eq("content_type", "article")
      .eq("content_fetched", false)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Optionally filter by ministry
    if (ministry_slug) {
      const { data: ministry } = await supabase
        .from("ministries")
        .select("id")
        .eq("slug", ministry_slug)
        .single();
      if (ministry) {
        query = query.eq("ministry_id", ministry.id);
      }
    }

    const { data: articles, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ success: true, processed: 0, enriched: 0, message: "Nothing to enrich" });
    }

    const stats = { processed: 0, enriched: 0, thumbnail_updated: 0, errors: 0 };

    for (const article of articles) {
      stats.processed++;
      await delay(600); // polite crawl delay

      const { content, thumbnail } = await fetchAndExtract(article.source_url);

      const updatePayload: Record<string, any> = {
        content_fetched: true, // mark as attempted even if content failed
      };

      if (content) {
        updatePayload.description = content;
        stats.enriched++;
      }

      // Update thumbnail only if we found a better one from OpenGraph
      if (thumbnail && thumbnail !== article.thumbnail_url) {
        updatePayload.thumbnail_url = thumbnail;
        stats.thumbnail_updated++;
      }

      const { error: updateError } = await supabase
        .from("content")
        .update(updatePayload)
        .eq("id", article.id);

      if (updateError) {
        console.error(`Failed to update article ${article.id}:`, updateError);
        stats.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      ...stats,
      has_more: articles.length === limit,
      next_offset: offset + limit,
    });
  } catch (error: any) {
    console.error("Error in fetch-article-content handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // GET: return stats on how many articles still need enrichment
  try {
    const authHeader = req.headers.get("authorization");
    const isAuthorized =
      authHeader === `Bearer ${process.env.CRON_SECRET}` ||
      authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` ||
      process.env.NODE_ENV === "development";

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count: total } = await supabase
      .from("content")
      .select("id", { count: "exact", head: true })
      .eq("content_type", "article");

    const { count: enriched } = await supabase
      .from("content")
      .select("id", { count: "exact", head: true })
      .eq("content_type", "article")
      .eq("content_fetched", true);

    return NextResponse.json({
      total_articles: total,
      enriched,
      pending: (total ?? 0) - (enriched ?? 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
