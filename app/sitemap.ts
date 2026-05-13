import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gospellens.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Content pages
  const { data: content } = await supabase
    .from("content")
    .select("id, content_type, published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const contentRoutes: MetadataRoute.Sitemap = (content || []).map((item) => {
    const typeMap: Record<string, string> = {
      article: "article",
      video: "video",
      podcast: "podcast",
      audio: "podcast",
    };
    const segment = typeMap[item.content_type] || "article";
    return {
      url: `${BASE_URL}/${segment}/${item.id}`,
      lastModified: item.published_at ? new Date(item.published_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    };
  });

  // Ministry pages
  const { data: ministries } = await supabase
    .from("ministries")
    .select("slug");

  const ministryRoutes: MetadataRoute.Sitemap = (ministries || []).map((m) => ({
    url: `${BASE_URL}/ministry/${m.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...contentRoutes, ...ministryRoutes];
}
