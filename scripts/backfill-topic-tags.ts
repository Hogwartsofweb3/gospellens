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

// Comprehensive list matching BOTH Discover Page filters and Search Page theological topics
const FILTER_TAGS = [
  // ── Discover Page Filters ──────────────────────────────────────────────────
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
  },

  // ── Search Page Theological Topics ──────────────────────────────────────────
  {
    tag: "Creation",
    keywords: ["creation", "created", "genesis", "in the beginning", "eden", "adam", "eve", "maker", "cosmology"]
  },
  {
    tag: "The Fall",
    keywords: ["the fall", "sin", "temptation", "serpent", "fallen", "transgression", "depravity", "original sin", "rebellion", "wicked", "iniquity"]
  },
  {
    tag: "Covenants",
    keywords: ["covenant", "covenants", "abrahamic", "mosaic", "davidic", "new covenant", "testament"]
  },
  {
    tag: "Redemption",
    keywords: ["redemption", "redeem", "redeemer", "save", "salvation", "atonement", "blood of jesus", "cross", "rescue", "ransom"]
  },
  {
    tag: "Christology",
    keywords: ["christology", "jesus", "christ", "incarnation", "messiah", "son of god", "lord", "saviour", "divinity", "deity of christ"]
  },
  {
    tag: "Kingdom",
    keywords: ["kingdom", "kingdom of god", "kingdom of heaven", "reign", "king", "millennium", "sovereignty"]
  },
  {
    tag: "Faith & Grace",
    keywords: ["faith", "grace", "mercy", "trust", "believe", "unmerited favor", "favor", "saving faith"]
  },
  {
    tag: "Holy Spirit",
    keywords: ["holy spirit", "spirit", "comforter", "pentecost", "anointing", "ghost", "spiritual gifts"]
  },
  {
    tag: "Judgment",
    keywords: ["judgment", "judge", "wrath", "hell", "condemnation", "eternal punishment", "tribulation", "final judgment", "damnation"]
  },
  {
    tag: "Church",
    keywords: ["church", "body of christ", "congregation", "fellowship", "believers", "sacraments", "baptism", "communion", "local church"]
  },
  {
    tag: "Marriage and Family", // Matching the exact ID used in search page
    keywords: ["marriage", "family", "husband", "wife", "parent", "parenting", "child", "children", "home", "wedding", "spouses"]
  },
  {
    tag: "Spiritual Warfare",
    keywords: ["spiritual warfare", "demon", "demons", "devil", "satan", "warfare", "enemy", "armor of god", "exorcism", "spiritual battle"]
  },
  {
    tag: "Eternal Life",
    keywords: ["eternal life", "heaven", "paradise", "resurrection", "glorification", "immortality", "everlasting life"]
  },
  {
    tag: "Restoration",
    keywords: ["restoration", "restore", "renew", "renewal", "revival", "rebuild", "reconciliation"]
  },
  {
    tag: "Christian Lifestyle", // Matching the exact ID "Christian Lifestyle" used in search page
    keywords: ["godly living", "christian lifestyle", "holiness", "walk with god", "discipleship", "sanctification", "obedience", "fruit of the spirit", "morality", "ethics"]
  }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function updateWithRetry(id: string, tags: string[], attempt = 1): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("content")
      .update({ topic_tags: tags })
      .eq("id", id);
      
    if (error) throw error;
    return true;
  } catch (err: any) {
    if (attempt <= 3) {
      const delay = attempt * 500;
      console.warn(`[Retry ${attempt}] Failed to update content ID ${id}. Retrying in ${delay}ms... (Error: ${err.message || err})`);
      await sleep(delay);
      return updateWithRetry(id, tags, attempt + 1);
    }
    console.error(`[Error] Failed to update content ID ${id} after 3 attempts.`, err.message || err);
    return false;
  }
}

async function backfillTags() {
  console.log("Starting comprehensive topic tags backfill with Rate-Limit Resilience...");
  
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

    console.log(`Analyzing ${contentItems.length} content items...`);

    for (const item of contentItems) {
      const textToAnalyze = `${item.title || ""} ${item.description || ""}`.toLowerCase();
      const newTags = new Set<string>(item.topic_tags || []);
      
      // Analyze text against each filter
      for (const filter of FILTER_TAGS) {
        for (const keyword of filter.keywords) {
          if (textToAnalyze.includes(keyword.toLowerCase())) {
            newTags.add(filter.tag);
            break; 
          }
        }
      }

      const finalTags = Array.from(newTags);
      const originalTags = item.topic_tags || [];
      const tagsChanged = 
        finalTags.length !== originalTags.length || 
        !finalTags.every(t => originalTags.includes(t));

      if (tagsChanged) {
        // Safe sequential delay of 40ms to prevent network socket exhaust
        await sleep(40);
        const success = await updateWithRetry(item.id, finalTags);
        if (success) {
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
