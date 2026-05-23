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

const MINISTRIES_LOGOS_MAPPING = [
  { slug: "desiring-god", logo_url: "https://www.desiringgod.org/apple-touch-icon.png" },
  { slug: "the-gospel-coalition", logo_url: "https://www.thegospelcoalition.org/apple-touch-icon.png" },
  { slug: "ligonier-ministries", logo_url: "https://www.ligonier.org/apple-touch-icon.png" },
  { slug: "monergism", logo_url: "https://www.monergism.com/favicon.ico" },
  { slug: "grace-to-you", logo_url: "https://www.gty.org/apple-touch-icon.png" },
  { slug: "gospel-in-life", logo_url: "https://gospelinlife.com/apple-touch-icon.png" },
  { slug: "gospel-lens-substack", logo_url: "/logo.png" },
  { slug: "this-excellent-church", logo_url: "https://img.icons8.com/fluency/96/church.png" },
  { slug: "judah-olorunmaiye", logo_url: "https://img.icons8.com/fluency/96/preach.png" },
  { slug: "bible-project", logo_url: "https://bibleproject.com/apple-touch-icon.png" },
  { slug: "apologia-studios", logo_url: "https://img.icons8.com/fluency/96/video.png" },
  { slug: "wes-huff", logo_url: "https://img.icons8.com/fluency/96/user.png" },
  { slug: "gavin-ortlund", logo_url: "https://img.icons8.com/fluency/96/user.png" },
  { slug: "sovereign-grace-baptist-lagos", logo_url: "https://img.icons8.com/fluency/96/church.png" },
  { slug: "sovereign-grace-community-abuja", logo_url: "https://img.icons8.com/fluency/96/church.png" },
];

async function updateLogos() {
  console.log("Starting ministries logos update...");
  
  for (const item of MINISTRIES_LOGOS_MAPPING) {
    console.log(`Updating logo for slug: ${item.slug} -> ${item.logo_url}`);
    
    const { data, error } = await supabase
      .from("ministries")
      .update({ logo_url: item.logo_url })
      .eq("slug", item.slug)
      .select();
      
    if (error) {
      console.error(`Failed to update ${item.slug}:`, error.message);
    } else {
      console.log(`Successfully updated ${item.slug}. Rows affected:`, data?.length);
    }
  }

  // Also verify that the featured field is set to true for Lagos and Abuja
  console.log("Ensuring Sovereign Grace Lagos & Abuja are featured...");
  await supabase.from("ministries").update({ is_featured: true }).eq("slug", "sovereign-grace-baptist-lagos");
  await supabase.from("ministries").update({ is_featured: true }).eq("slug", "sovereign-grace-community-abuja");
  
  console.log("Ministries logos and featured status successfully updated!");
}

updateLogos();
