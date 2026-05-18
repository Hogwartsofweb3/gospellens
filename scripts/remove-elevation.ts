import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function removeElevation() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("Removing Elevation Church from the database...");
  
  // Since we use ON DELETE CASCADE on the content table, 
  // deleting the ministry will also delete all its videos/content.
  const { error } = await supabase
    .from("ministries")
    .delete()
    .eq("slug", "elevation-church"); // Or by name if slug differs

  const { error: err2 } = await supabase
    .from("ministries")
    .delete()
    .ilike("name", "%Elevation%");

  if (error || err2) {
    console.error("Error removing:", error || err2);
  } else {
    console.log("Successfully removed Elevation Church and all its content!");
  }
}

removeElevation();
