import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import sanitizeHtml from "sanitize-html";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Helper for auto-tagging (shared logic)
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

// Convert ISO 8601 duration (e.g. PT1H2M10S) to seconds
function parseIsoDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function runYouTubeIngestion() {
  console.log("Starting YouTube Ingestion...");

  if (!process.env.YOUTUBE_API_KEY) {
    console.error("Missing YOUTUBE_API_KEY");
    return;
  }

  // Fetch all ministries with YouTube channels configured
  const { data: ministries, error } = await supabase
    .from("ministries")
    .select("*")
    .not("youtube_channel_id", "is", null);

  if (error || !ministries) {
    console.error("Failed to fetch ministries:", error);
    return;
  }

  const stats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

  for (const ministry of ministries) {
    if (!ministry.youtube_channel_id) continue;

    try {
      console.log(`Fetching videos for ${ministry.name}...`);
      
      // 1. Get the Uploads Playlist ID for the channel
      const channelRes = await youtube.channels.list({
        part: ["contentDetails"],
        id: [ministry.youtube_channel_id],
      });

      const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        console.error(`Could not find uploads playlist for ${ministry.name}`);
        stats.errors++;
        continue;
      }

      // 2. Fetch latest 20 videos from the uploads playlist
      const playlistRes = await youtube.playlistItems.list({
        part: ["snippet"],
        playlistId: uploadsPlaylistId,
        maxResults: 20,
      });

      const videoItems = playlistRes.data.items || [];
      stats.fetched += videoItems.length;

      // Prepare list of video IDs to fetch duration in one call
      const videoIds = videoItems.map((item) => item.snippet?.resourceId?.videoId).filter(Boolean) as string[];
      
      let videoDurations: Record<string, number> = {};
      if (videoIds.length > 0) {
        const videosRes = await youtube.videos.list({
          part: ["contentDetails"],
          id: videoIds,
        });
        
        videosRes.data.items?.forEach((video) => {
          if (video.id && video.contentDetails?.duration) {
            videoDurations[video.id] = parseIsoDuration(video.contentDetails.duration);
          }
        });
      }

      // 3. Process and upsert each video
      for (const item of videoItems) {
        const snippet = item.snippet;
        const videoId = snippet?.resourceId?.videoId;
        
        if (!snippet || !videoId || !snippet.title) {
          stats.skipped++;
          continue;
        }

        const sourceUrl = `https://youtube.com/watch?v=${videoId}`;
        const contentType = ministry.display_as === "podcast" ? "podcast" : "video";
        
        const topicTags = autoTagContent(
          snippet.title, 
          snippet.description || "", 
          ministry.topic_tags || []
        );

        const cleanDescription = snippet.description 
          ? sanitizeHtml(snippet.description, { allowedTags: [], allowedAttributes: {} }) 
          : null;

        const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || null;

        const payload = {
          ministry_id: ministry.id,
          title: snippet.title,
          description: cleanDescription,
          content_type: contentType,
          source_url: sourceUrl,
          thumbnail_url: thumbnail,
          duration_seconds: videoDurations[videoId] || null,
          published_at: snippet.publishedAt || new Date().toISOString(),
          topic_tags: topicTags,
        };

        // Upsert using source_url constraint to avoid duplicates
        const { error: upsertError } = await supabase
          .from("content")
          .upsert(payload, { onConflict: "source_url", ignoreDuplicates: false });

        if (upsertError) {
          console.error(`Failed to upsert YouTube video: ${snippet.title}`, upsertError);
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
          ingestion_error_count: 0 // reset on success
        })
        .eq("id", ministry.id);

    } catch (err) {
      console.error(`Error processing YouTube channel for ${ministry.name}:`, err);
      stats.errors++;
      await supabase.rpc('increment_ingestion_error', { min_id: ministry.id });
    }
  }

  console.log("YouTube Ingestion complete:", stats);
  return stats;
}
