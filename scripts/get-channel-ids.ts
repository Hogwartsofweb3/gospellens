import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const KEY = process.env.YOUTUBE_API_KEY!;

async function getChannelId(handle: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${handle}&key=${KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const item = data.items?.[0];
  if (item) {
    console.log(`@${handle} => ${item.id} (${item.snippet?.title})`);
  } else {
    console.log(`@${handle} => NOT FOUND`, JSON.stringify(data));
  }
}

async function run() {
  await getChannelId("JudahOlorunmaiye");
  await getChannelId("GospelinLife");
}

run();
