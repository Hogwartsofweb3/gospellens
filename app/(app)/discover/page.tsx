"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { LandscapeCard, ContentItem } from "@/components/ui/ContentCard";
import { LandscapeCardSkeleton, TopicTileSkeleton, MinistryCardSkeleton } from "@/components/ui/Skeletons";

const TOPICS = [
  { id: "Sermons", label: "Sermons", icon: "https://img.icons8.com/fluency/96/microphone.png", color: "#E040A0" },
  { id: "Bible Study", label: "Bible Study", icon: "https://img.icons8.com/fluency/96/bible.png", color: "#29B6F6" },
  { id: "Prayer", label: "Prayer", icon: "https://img.icons8.com/fluency/96/praying-hands.png", color: "#A78BFA" },
  { id: "Worship", label: "Worship", icon: "https://img.icons8.com/fluency/96/musical-notes.png", color: "#34D399" },
  { id: "Theology", label: "Theology", icon: "https://img.icons8.com/fluency/96/latin-cross.png", color: "#F59E0B" },
  { id: "Evangelism", label: "Evangelism", icon: "https://img.icons8.com/fluency/96/globe.png", color: "#F97316" },
  { id: "Family & Marriage", label: "Family & Marriage", icon: "https://img.icons8.com/fluency/96/family.png", color: "#EC4899" },
  { id: "Youth & Teens", label: "Youth & Teens", icon: "https://img.icons8.com/fluency/96/lightning-bolt.png", color: "#38BDF8" },
  { id: "Prophecy", label: "Prophecy", icon: "https://img.icons8.com/fluency/96/crystal-ball.png", color: "#818CF8" },
  { id: "Healing & Miracles", label: "Healing & Miracles", icon: "https://img.icons8.com/fluency/96/sparkles.png", color: "#4ADE80" },
  { id: "Leadership", label: "Leadership", icon: "https://img.icons8.com/fluency/96/crown.png", color: "#FBBF24" },
  { id: "Devotionals", label: "Devotionals", icon: "https://img.icons8.com/fluency/96/notebook.png", color: "#FB7185" },
];

const CONTENT_TYPES = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "video", label: "Videos" },
  { id: "podcast", label: "Podcasts" },
  { id: "audio", label: "Audio" },
];

interface Ministry {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  follower_count?: number;
  topic_tags?: string[];
  is_verified?: boolean;
}

export default function DiscoverPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("all");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingMinistries, setLoadingMinistries] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load ministries once
  useEffect(() => {
    fetch("/api/ministries")
      .then((r) => r.json())
      .then((d) => {
        setMinistries(d.data || []);
        setLoadingMinistries(false);
      })
      .catch(() => setLoadingMinistries(false));
  }, []);

  // Load content when filters change
  useEffect(() => {
    setPage(1);
    setContent([]);
    loadContent(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, activeType]);

  const loadContent = async (p: number, reset = false) => {
    setLoadingContent(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: "18",
        sort: "latest",
      });
      if (activeType !== "all") params.set("type", activeType);
      if (selectedTopic) params.set("topic", selectedTopic);

      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      const items: ContentItem[] = data.data || [];

      setContent((prev) => (reset ? items : [...prev, ...items]));
      setHasMore(items.length === 18);
    } catch {
      // silent
    } finally {
      setLoadingContent(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadContent(next);
  };

  return (
    <div className="px-6 md:px-10 py-8 flex flex-col gap-10">
      {/* Page Header */}
      <div>
        <h1 className="font-poppins font-bold text-4xl text-white">Discover</h1>
        <p className="text-text-secondary mt-1">Browse by topic, ministry, or content type.</p>
      </div>

      {/* Topic Grid */}
      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Browse by Topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOPICS.map((topic) => {
            const isActive = selectedTopic === topic.id;
            return (
              <motion.button
                key={topic.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTopic(isActive ? null : topic.id)}
                className={`relative rounded-lg p-4 flex flex-col items-start gap-2 text-left transition-all border overflow-hidden ${
                  isActive
                    ? "border-primary shadow-glow-pink"
                    : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: "#1A1A1A" }}
              >
                {/* Tinted bg accent */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{ background: `radial-gradient(circle at top right, ${topic.color}, transparent 70%)` }}
                />
                <div className="relative w-9 h-9 z-10 flex items-center justify-center mb-1">
                  {topic.icon.startsWith("http") ? (
                    <img src={topic.icon} alt={topic.label} className="w-9 h-9 object-contain" />
                  ) : (
                    <span className="text-3xl">{topic.icon}</span>
                  )}
                </div>
                <span className="font-poppins font-semibold text-white text-sm relative z-10">
                  {topic.label}
                </span>
                {isActive && (
                  <span className="text-[10px] text-primary font-medium relative z-10">Selected ✓</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Content Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {CONTENT_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveType(t.id)}
            className={`px-5 py-2 rounded-pill text-sm font-medium transition-all ${
              activeType === t.id
                ? "bg-primary text-white shadow-glow-pink"
                : "bg-elevated text-text-secondary hover:text-white hover:bg-elevated/80"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Featured Ministries */}
      <section>
        <h2 className="text-white font-semibold text-lg mb-4">Featured Ministries</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {loadingMinistries
            ? Array.from({ length: 5 }).map((_, i) => <MinistryCardSkeleton key={i} />)
            : ministries.slice(0, 10).map((ministry) => (
                <MinistryCard key={ministry.id} ministry={ministry} />
              ))}
        </div>
      </section>

      {/* Content Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">
            {selectedTopic ? `${selectedTopic}` : "All Content"}
          </h2>
          <span className="text-text-secondary text-sm">{content.length} items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loadingContent && content.length === 0
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="skeleton rounded-md" style={{ height: 160 }} />
              ))
            : content.map((item) => (
                <LandscapeCard key={item.id} item={item} fluid={true} />
              ))}
        </div>

        {/* Empty state */}
        {!loadingContent && content.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-text-secondary">No content found for these filters.</p>
            <button
              onClick={() => { setSelectedTopic(null); setActiveType("all"); }}
              className="mt-4 text-primary text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Load More */}
        {hasMore && content.length > 0 && !loadingContent && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-8 py-3 border border-border text-white rounded-pill text-sm hover:border-primary hover:text-primary transition-all"
            >
              Load More
            </button>
          </div>
        )}
        {loadingContent && content.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </section>
    </div>
  );
}

// ── Ministry Card ──────────────────────────────────────────────────────────
function MinistryCard({ ministry }: { ministry: Ministry }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ministry_id: ministry.id }),
      });
      if (res.ok) setFollowing((f) => !f);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex-shrink-0 rounded-lg p-5 flex flex-col items-center text-center gap-3 border border-border hover:border-primary/30 transition-colors"
      style={{ width: 200, backgroundColor: "#1A1A1A" }}
    >
      {/* Logo */}
      <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center overflow-hidden">
        {ministry.logo_url ? (
          <Image src={ministry.logo_url} alt={ministry.name} width={64} height={64} className="object-contain" />
        ) : (
          <span className="text-2xl font-bold text-primary">{ministry.name[0]}</span>
        )}
      </div>

      <div>
        <p className="text-white font-semibold text-sm">{ministry.name}</p>
        {ministry.description && (
          <p className="text-text-secondary text-xs line-clamp-2 mt-1">{ministry.description}</p>
        )}
        {ministry.follower_count !== undefined && (
          <p className="text-text-muted text-xs mt-1">{ministry.follower_count.toLocaleString()} followers</p>
        )}
      </div>

      <button
        onClick={toggleFollow}
        disabled={loading}
        className={`w-full py-1.5 rounded-pill text-xs font-semibold border transition-all ${
          following
            ? "bg-primary border-primary text-white"
            : "border-primary text-primary hover:bg-primary/10"
        }`}
      >
        {loading ? "..." : following ? "Following ✓" : "Follow"}
      </button>
    </div>
  );
}
