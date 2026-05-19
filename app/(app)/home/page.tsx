"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollRow } from "@/components/ui/ScrollRow";
import { LandscapeCard, SquareCard, MinistryWideCard, ContentItem, getContentUrl } from "@/components/ui/ContentCard";
import { LandscapeCardSkeleton, SquareCardSkeleton, HeroSkeleton } from "@/components/ui/Skeletons";

// ── Hero Banner ───────────────────────────────────────────────────────────
function HeroBanner({ item }: { item: ContentItem | null }) {
  if (!item) return <HeroSkeleton />;

  const typeLabel = item.content_type.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full overflow-hidden"
      style={{ height: 520 }}
    >
      {/* Blurred background thumbnail */}
      <div className="absolute inset-0">
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            className="object-cover"
            style={{ filter: "blur(24px)", transform: "scale(1.1)" }}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface to-background" />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 overlay-bottom" />
        <div className="absolute inset-0 overlay-left" />
        {/* Pink right fade */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, transparent 40%, rgba(224,64,160,0.08) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-8 md:px-16 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Type badge */}
          <span className="inline-block bg-secondary/20 text-secondary text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wider">
            {typeLabel}
          </span>

          {/* Ministry row */}
          {item.ministries && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-text-secondary text-sm">{item.ministries.name}</span>
              {item.ministries.is_verified && (
                <span className="text-primary text-xs">✓</span>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="font-poppins font-bold text-3xl md:text-4xl text-white leading-tight line-clamp-2 mb-3">
            {item.title}
          </h1>

          {/* Description */}
          {item.description && (
            <p className="text-text-secondary text-sm line-clamp-2 mb-6 max-w-lg">
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={getContentUrl(item)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary rounded-pill text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-glow-pink"
            >
              <Play className="w-4 h-4 fill-white" />
              {item.content_type === "article" ? "Read Now" : "Play Now"}
            </Link>
            <button className="flex items-center gap-2 px-6 py-2.5 border border-white/40 rounded-pill text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              <Bookmark className="w-4 h-4" />
              Bookmark
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Home Page ────────────────────────────────────────────────────────
export default function HomePage() {
  const [heroItem, setHeroItem] = useState<ContentItem | null>(null);
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
  const [videos, setVideos] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingRes, articlesRes, podcastsRes, videosRes] = await Promise.all([
          fetch("/api/content/trending"),
          fetch("/api/content?type=article&sort=latest&limit=12"),
          fetch("/api/content?type=podcast&sort=latest&limit=12"),
          fetch("/api/content?type=video&sort=latest&limit=12"),
        ]);

        const trendingData = await trendingRes.json();
        const articlesData = await articlesRes.json();
        const podcastsData = await podcastsRes.json();
        const videosData = await videosRes.json();

        const trendingItems: ContentItem[] = trendingData.data || [];
        const articleItems: ContentItem[] = articlesData.data || [];
        const podcastItems: ContentItem[] = podcastsData.data || [];
        const videoItems: ContentItem[] = videosData.data || [];

        // Pick hero item: highest view count video from the current week that HAS a thumbnail
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let bestHero = trendingItems.find(
          (item) => item.content_type === "video" && item.thumbnail_url && new Date(item.published_at || 0) >= oneWeekAgo
        );

        // Fallback: highest view count video of all time that HAS a thumbnail
        if (!bestHero) {
          bestHero = trendingItems.find((item) => item.content_type === "video" && item.thumbnail_url);
        }
        
        // Final fallback: any trending item
        if (!bestHero && trendingItems.length > 0) {
          bestHero = trendingItems[0];
        }

        setTrending(trendingItems);
        setArticles(articleItems);
        setPodcasts(podcastItems);
        setVideos(videoItems);

        if (bestHero) {
          setHeroItem(bestHero);
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const SKELETON_COUNT = 8;

  return (
    <div className="flex flex-col gap-10 pb-8">
      {/* Hero */}
      <HeroBanner item={heroItem} />

      {/* Row 2: Trending */}
      <ScrollRow title="Trending This Week 🔥" seeAllHref="/discover?sort=trending">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <LandscapeCardSkeleton key={i} />)
          : trending.map((item) => <LandscapeCard key={item.id} item={item} />)}
      </ScrollRow>

      {/* Row 3: Latest Articles */}
      <ScrollRow title="Latest Articles ✍️" seeAllHref="/discover?type=article">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <LandscapeCardSkeleton key={i} />)
          : articles.map((item) => <LandscapeCard key={item.id} item={item} />)}
      </ScrollRow>

      {/* Row 4: Podcast Episodes */}
      <ScrollRow title="New Podcast Episodes 🎙" seeAllHref="/discover?type=podcast">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SquareCardSkeleton key={i} />)
          : podcasts.map((item) => <SquareCard key={item.id} item={item} />)}
      </ScrollRow>

      {/* Row 5: Videos */}
      <ScrollRow title="Sermons & Videos 🎬" seeAllHref="/discover?type=video">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <LandscapeCardSkeleton key={i} />)
          : videos.map((item) => <LandscapeCard key={item.id} item={item} />)}
      </ScrollRow>
    </div>
  );
}
