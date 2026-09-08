const https = require('https');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase credentials in env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Setup Redis for cache invalidation
const redisUrl = process.env.UPSTASH_REDIS_URL || "";
const redisToken = process.env.UPSTASH_REDIS_TOKEN || "";
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Auto-tagging helper
function autoTagContent(title, description, baseTags) {
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

async function run() {
  try {
    console.log("Checking database connection...");
    
    // Look up Monergism ministry ID
    const { data: ministry, error: minError } = await supabase
      .from('ministries')
      .select('id, name, logo_url, topic_tags')
      .eq('slug', 'monergism')
      .single();
      
    if (minError || !ministry) {
      console.error("Error finding Monergism ministry:", minError);
      process.exit(1);
    }
    
    console.log(`Found Ministry: ${ministry.name} (ID: ${ministry.id})`);
    
    const pagesToScrape = 55; // 55 pages * 10 articles/page = 550 articles
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Date counter to generate sequential chronological dates
    // Start from current time and go backward by 6 hours per article
    let dateCounter = 0;
    
    for (let page = 0; page < pagesToScrape; page++) {
      console.log(`\n--- Fetching Page ${page + 1}/${pagesToScrape} (?page=${page}) ---`);
      
      let html = '';
      try {
        html = await fetchUrl(`https://www.monergism.com/blog?page=${page}`);
      } catch (fetchErr) {
        console.error(`Failed to fetch page ${page}:`, fetchErr);
        errorCount++;
        await sleep(1000);
        continue;
      }
      
      const articleRegex = /<article[^>]*class="[^"]*node-teaser[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
      const titleRegex = /<h2 class="node-title"><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/i;
      const imgRegex = /<img[^>]*src="([^"]+)"/i;
      
      let match;
      const pagePayloads = [];
      
      while ((match = articleRegex.exec(html))) {
        const articleContent = match[1];
        const titleMatch = titleRegex.exec(articleContent);
        if (!titleMatch) continue;
        
        const path = titleMatch[1];
        const title = titleMatch[2]
          .replace(/&amp;/g, '&')
          .replace(/&#039;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
          
        const url = path.startsWith('http') ? path : `https://www.monergism.com${path}`;
        
        const imgMatch = imgRegex.exec(articleContent);
        let thumbnailUrl = null;
        if (imgMatch) {
          const imgSrc = imgMatch[1];
          thumbnailUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.monergism.com${imgSrc}`;
        } else {
          thumbnailUrl = ministry.logo_url;
        }
        
        // Extract body content inside field-item
        let rawBody = '';
        const bodyIdx = articleContent.indexOf('<div class="field-item even">');
        if (bodyIdx !== -1) {
          const bodyContent = articleContent.substring(bodyIdx + '<div class="field-item even">'.length);
          const endIdx = bodyContent.indexOf('</div>');
          rawBody = bodyContent.substring(0, endIdx);
        } else {
          rawBody = articleContent;
        }
        
        // Sanitize body HTML
        const cleanDescription = sanitizeHtml(rawBody, { 
          allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'p', 'br', 'ul', 'li', 'ol' ]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            'img': ['src', 'alt', 'width', 'height']
          }
        });
        
        const topicTags = autoTagContent(title, cleanDescription, ministry.topic_tags || []);
        
        // Subtract 6 hours per article to lay them out sequentially back in time
        const publishedAt = new Date(Date.now() - dateCounter * 6 * 3600000).toISOString();
        dateCounter++;
        
        pagePayloads.push({
          ministry_id: ministry.id,
          title,
          description: cleanDescription,
          content_type: 'article',
          source_url: url,
          thumbnail_url: thumbnailUrl,
          published_at: publishedAt,
          topic_tags: topicTags,
          duration_seconds: null
        });
      }
      
      if (pagePayloads.length === 0) {
        console.log("No articles found on this page. Stopping.");
        break;
      }
      
      console.log(`Upserting ${pagePayloads.length} articles to Supabase...`);
      
      const { error: upsertError } = await supabase
        .from('content')
        .upsert(pagePayloads, { onConflict: 'source_url', ignoreDuplicates: false });
        
      if (upsertError) {
        console.error("Upsert failed:", upsertError);
        errorCount += pagePayloads.length;
      } else {
        insertedCount += pagePayloads.length;
        console.log(`Successfully upserted page ${page + 1}. Total upserted so far: ${insertedCount}`);
      }
      
      // Polite delay between pages
      await sleep(500);
    }
    
    console.log("\nScraping complete!");
    console.log(`Total successfully upserted: ${insertedCount}`);
    console.log(`Total errors/failed: ${errorCount}`);
    
    // Invalidate Redis cache keys
    if (redis) {
      console.log("Invalidating Redis cache...");
      let cursor = 0;
      let deletedKeys = 0;
      do {
        const result = await redis.scan(cursor, { match: 'content:*', count: 100 });
        cursor = Number(result[0]);
        const keys = result[1];
        if (keys.length > 0) {
          await redis.del(...keys);
          deletedKeys += keys.length;
        }
      } while (cursor !== 0);
      
      cursor = 0;
      do {
        const result = await redis.scan(cursor, { match: 'ministries*', count: 100 });
        cursor = Number(result[0]);
        const keys = result[1];
        if (keys.length > 0) {
          await redis.del(...keys);
          deletedKeys += keys.length;
        }
      } while (cursor !== 0);
      
      console.log(`Redis cache cleared! Deleted ${deletedKeys} cache keys.`);
    }
    
  } catch (err) {
    console.error("Fatal error:", err);
  }
}

run();
