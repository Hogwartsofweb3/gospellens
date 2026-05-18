import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MINISTRIES_SEED = [
  // ==========================================
  // ARTICLE / TEXT SOURCES
  // ==========================================
  {
    name: "Desiring God",
    slug: "desiring-god",
    website: "https://www.desiringgod.org",
    rss_feed_urls: ["https://rss.desiringgod.org"],
    youtube_channel_id: "UCnrFlpro0xfYjz6s5Xa8WWw",
    category: "Reformed Theology",
    description: "Desiring God exists to spread a passion for the supremacy of God in all things for the joy of all peoples through Jesus Christ. Founded by John Piper.",
    is_verified: true,
    topic_tags: ["Bible Study", "Sermons", "Devotionals", "Prayer", "Worship"]
  },
  {
    name: "The Gospel Coalition",
    slug: "the-gospel-coalition",
    website: "https://www.thegospelcoalition.org",
    rss_feed_urls: ["https://www.thegospelcoalition.org/feed/"],
    youtube_channel_id: "UCQMwm-DeHyFK5VPp6KySR5Q",
    category: "Reformed Evangelical",
    description: "The Gospel Coalition is a fellowship of evangelical churches deeply committed to renewing our faith in the gospel of Christ.",
    is_verified: true,
    topic_tags: ["Bible Study", "Theology", "Evangelism", "Leadership", "Family & Marriage"]
  },
  {
    name: "Ligonier Ministries",
    slug: "ligonier-ministries",
    website: "https://learn.ligonier.org",
    rss_feed_urls: [],
    youtube_channel_id: "UCut8939DdQsJI3Gw1ziAc4w",
    category: "Reformed Theology",
    description: "Founded by R.C. Sproul, Ligonier Ministries exists to proclaim the holiness of God to a generation seeking spiritual renewal.",
    is_verified: true,
    topic_tags: ["Theology", "Bible Study", "Devotionals", "Healing & Miracles", "Leadership"]
  },
  {
    name: "Monergism",
    slug: "monergism",
    website: "https://www.monergism.com",
    rss_feed_urls: ["https://www.monergism.com/blog/feed"],
    category: "Reformed Theology",
    description: "Monergism is a comprehensive resource for Reformed and evangelical theology, featuring sermons, articles, and books from trusted Christian scholars.",
    is_verified: true,
    topic_tags: ["Theology", "Bible Study", "Sermons", "Evangelism"]
  },
  {
    name: "New Advent",
    slug: "new-advent",
    website: "https://www.newadvent.org",
    rss_feed_urls: [],
    category: "Church History & Patristics",
    description: "New Advent provides access to the writings of the Early Church Fathers and the Summa Theologica of St. Thomas Aquinas.",
    is_verified: true,
    topic_tags: ["Church History", "Theology", "Bible Study", "Leadership"]
  },
  {
    name: "Grace to You",
    slug: "grace-to-you",
    website: "https://www.gty.org",
    rss_feed_urls: [],
    youtube_channel_id: "UCneKpMu9SFGlt2usTdAI75A",
    category: "Expository Preaching",
    description: "Grace to You is the media ministry of John MacArthur, featuring thousands of sermons and Bible teaching resources.",
    is_verified: true,
    topic_tags: ["Sermons", "Bible Study", "Theology", "Prayer", "Family & Marriage"]
  },
  {
    name: "Gospel Lens",
    slug: "gospel-lens-substack",
    website: "https://gospellens.substack.com",
    rss_feed_urls: ["https://gospellens.substack.com/feed"],
    category: "Gospel Lens Original",
    description: "Original articles, reflections, and devotionals published directly by the Gospel Lens team.",
    is_verified: true,
    is_featured: true,
    topic_tags: ["Devotionals", "Worship", "Evangelism", "Prayer"]
  },
  
  // ==========================================
  // YOUTUBE VIDEO SOURCES 
  // (Note: Shared channels are mapped above)
  // ==========================================


  // ==========================================
  // PODCAST / AUDIO SOURCES (YouTube Channels)
  // ==========================================
  {
    name: "The Bible Project",
    slug: "bible-project",
    youtube_channel_id: "UCVfwlh9XpX2Y_tQfjeln9QA",
    category: "Bible Study",
    description: "The Bible Project creates free resources to help people experience the Bible as a unified story that leads to Jesus.",
    is_verified: true,
    display_as: "podcast",
    topic_tags: ["Bible Study", "Theology", "Worship", "Youth & Teens", "Evangelism"]
  },
  {
    name: "Apologia Studios",
    slug: "apologia-studios",
    youtube_channel_id: "UCK9RJwC7Er16-Y8dvIQ-3tw",
    category: "Apologetics",
    description: "Apologia Studios is a Reformed Baptist ministry dedicated to defending the Christian faith through apologetics and sound theology.",
    is_verified: true,
    display_as: "podcast",
    topic_tags: ["Theology", "Evangelism", "Bible Study", "Leadership"]
  },
  {
    name: "Wes Huff",
    slug: "wes-huff",
    youtube_channel_id: "UCJX2EazMKUqBQV048px2aoA",
    category: "Apologetics",
    description: "Wes Huff is a Christian apologist and speaker helping believers defend their faith with confidence and clarity.",
    is_verified: true,
    display_as: "podcast",
    topic_tags: ["Evangelism", "Theology", "Youth & Teens", "Leadership"]
  },
  {
    name: "Gavin Ortlund",
    slug: "gavin-ortlund",
    youtube_channel_id: "UCtWDnUokOD--s2aFxLT5uVA",
    category: "Theology",
    description: "Gavin Ortlund is a theologian, author, and pastor exploring Christian doctrine with depth, warmth, and accessibility.",
    is_verified: true,
    display_as: "podcast",
    topic_tags: ["Theology", "Bible Study", "Sermons", "Leadership", "Evangelism"]
  }
];

async function seedMinistries() {
  console.log("Starting ministry seed...");
  
  for (const ministry of MINISTRIES_SEED) {
    console.log(`Upserting: ${ministry.name}`);
    
    const { error } = await supabase
      .from("ministries")
      .upsert({
        name: ministry.name,
        slug: ministry.slug,
        website: ministry.website || null,
        rss_feed_urls: ministry.rss_feed_urls || null,
        youtube_channel_id: ministry.youtube_channel_id || null,
        category: ministry.category,
        description: ministry.description,
        is_verified: ministry.is_verified,
        is_featured: ministry.is_featured || false,
        display_as: ministry.display_as || null,
        topic_tags: ministry.topic_tags || [],
      }, { onConflict: "slug" });
      
    if (error) {
      console.error(`Failed to upsert ${ministry.name}:`, error.message);
    }
  }
  
  console.log("Ministry seed completed!");
}

seedMinistries();
