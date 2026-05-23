import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Custom keywords for each of the 12 filters
const FILTER_TAGS = [
  {
    tag: "Sermons",
    keywords: ["sermon", "preach", "preaching", "expository", "homily", "pastor", "pulpit", "message", "preached"]
  },
  {
    tag: "Bible Study",
    keywords: ["bible", "scripture", "gospel", "passage", "chapter", "verse", "study", "read", "reading", "testament", "epistle", "hermeneutics", "exegesis", "commentary"]
  },
  {
    tag: "Prayer",
    keywords: ["prayer", "pray", "praying", "intercede", "intercession", "supplication", "petition", "devotion", "kneel"]
  },
  {
    tag: "Worship",
    keywords: ["worship", "praise", "song", "hymn", "music", "sing", "singing", "choir", "melody", "psalms", "psalm"]
  },
  {
    tag: "Theology",
    keywords: ["theology", "doctrine", "dogma", "calvinis", "arminia", "reformed", "covenant", "grace", "faith", "righteousness", "justification", "sanctification", "providence", "sovereignty", "atonement", "christology", "eschatology", "trinity", "heresy"]
  },
  {
    tag: "Evangelism",
    keywords: ["evangel", "evangelism", "mission", "missionary", "missions", "witness", "witnessing", "outreach", "share faith", "great commission", "apologetics", "defend", "convert"]
  },
  {
    tag: "Family & Marriage",
    keywords: ["family", "marriage", "husband", "wife", "parent", "parenting", "child", "children", "home", "wed", "wedding", "divorce", "spouses", "mother", "father"]
  },
  {
    tag: "Youth & Teens",
    keywords: ["youth", "teen", "teens", "teenager", "teenagers", "young", "student", "students", "school", "college", "kids"]
  },
  {
    tag: "Prophecy",
    keywords: ["prophecy", "prophetic", "prophet", "prophets", "revelation", "vision", "foretell", "predict", "apocalypse", "apocalyptic", "future", "dreams", "dream"]
  },
  {
    tag: "Healing & Miracles",
    keywords: ["heal", "healing", "healed", "miracle", "miracles", "cure", "sickness", "disease", "illness", "supernatural", "divine health", "blind", "lame", "sick"]
  },
  {
    tag: "Leadership",
    keywords: ["leader", "leadership", "lead", "pastor", "pastors", "elder", "elders", "deacon", "deacons", "church government", "shepherd", "oversee", "steward", "authority", "govern"]
  },
  {
    tag: "Devotionals",
    keywords: ["devotional", "devotion", "devotions", "quiet time", "meditate", "meditation", "daily bread", "morning", "evening", "reflection", "reflections", "daily"]
  }
];

async function backfillTags() {
  console.log("Starting topic tags backfill...");
  
  // Fetch content in batches of 100 to handle large databases efficiently
  let page = 0;
  const limit = 100;
  let hasMore = true;
  let totalProcessed = 0;
  let totalUpdated = 0;

  while (hasMore) {
    const from = page * limit;
    const to = from + limit - 1;

    console.log(`Fetching page ${page + 1} (range: ${from}-${to})...`);
    
    const { data: contentItems, error } = await supabase
      .from("content")
      .select("id, title, description, topic_tags")
      .range(from, to);

    if (error) {
      console.error("Failed to fetch content page:", error.message);
      break;
    }

    if (!contentItems || contentItems.length === 0) {
      hasMore = false;
      break;
    }

    console.log(`Processing ${contentItems.length} content items...`);
    
    for (const item of contentItems) {
      const textToAnalyze = `${item.title || ""} ${item.description || ""}`.toLowerCase();
      const newTags = new Set<string>(item.topic_tags || []);
      
      // Analyze text against each filter
      for (const filter of FILTER_TAGS) {
        for (const keyword of filter.keywords) {
          // Use word boundary check or exact matching to avoid false positives on substrings where possible,
          // but basic includes works well for broad evangelical topics.
          if (textToAnalyze.includes(keyword.toLowerCase())) {
            newTags.add(filter.tag);
            break; // Stop checking keywords for this tag once matched
          }
        }
      }

      // Convert Set back to Array
      const finalTags = Array.from(newTags);

      // Check if tags actually changed to avoid redundant updates
      const originalTags = item.topic_tags || [];
      const tagsChanged = 
        finalTags.length !== originalTags.length || 
        !finalTags.every(t => originalTags.includes(t));

      if (tagsChanged) {
        const { error: updateError } = await supabase
          .from("content")
          .update({ topic_tags: finalTags })
          .eq("id", item.id);

        if (updateError) {
          console.error(`Failed to update tags for content ID ${item.id}:`, updateError.message);
        } else {
          totalUpdated++;
        }
      }
      totalProcessed++;
    }

    page++;
    if (contentItems.length < limit) {
      hasMore = false;
    }
  }

  console.log(`Backfill complete! Processed: ${totalProcessed}, Updated: ${totalUpdated} content items.`);
}

backfillTags();
