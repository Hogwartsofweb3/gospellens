import * as dotenv from "dotenv";
import path from "path";

// Load env vars FIRST before any other imports
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function trigger() {
  console.log("Starting initial data ingestion...");
  
  try {
    // Dynamic import ensures env vars are loaded first
    const { runRssIngestion } = await import("../lib/ingestion/rss-ingester");
    const { runYouTubeIngestion } = await import("../lib/ingestion/youtube-ingester");

    const rssStats = await runRssIngestion();
    console.log("RSS Stats:", rssStats);
    
    const ytStats = await runYouTubeIngestion();
    console.log("YouTube Stats:", ytStats);
    
    console.log("Data ingestion successfully completed!");
  } catch (error) {
    console.error("Ingestion failed:", error);
  }
}

trigger();
