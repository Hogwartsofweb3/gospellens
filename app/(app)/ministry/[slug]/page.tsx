"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, ExternalLink, Share2,
  Check, UserPlus, FileText, Video, Mic, LayoutGrid,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LandscapeCard, ContentItem } from "@/components/ui/ContentCard";
import { LandscapeCardSkeleton } from "@/components/ui/Skeletons";

interface Ministry {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  description: string | null;
  is_verified: boolean;
  is_featured: boolean;
  category: string | null;
  follower_count: number;
  content_count: number;
  topic_tags: string[];
}

type Tab = "all" | "article" | "video" | "podcast";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <LayoutGrid size={15} /> },
  { id: "article", label: "Articles", icon: <FileText size={15} /> },
  { id: "video", label: "Videos", icon: <Video size={15} /> },
  { id: "podcast", label: "Podcasts", icon: <Mic size={15} /> },
];

const CONTENT_ROUTE: Record<string, string> = {
  article: "article",
  video: "video",
  podcast: "podcast",
  audio: "audio",
};

export default function MinistryProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isFollowing, setIsFollowing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ articles: 0, videos: 0, podcasts: 0 });
  const supabase = createClient();

  // Fetch ministry details
  useEffect(() => {
    async function fetchMinistry() {
      setLoading(true);
      const { data } = await supabase
        .from("ministries")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setMinistry(data);

        // Fetch content counts
        const [art, vid, pod] = await Promise.all([
          supabase.from("content").select("id", { count: "exact", head: true })
            .eq("ministry_id", data.id).eq("content_type", "article"),
          supabase.from("content").select("id", { count: "exact", head: true })
            .eq("ministry_id", data.id).eq("content_type", "video"),
          supabase.from("content").select("id", { count: "exact", head: true })
            .eq("ministry_id", data.id).in("content_type", ["podcast", "audio"]),
        ]);
        setStats({
          articles: art.count || 0,
          videos: vid.count || 0,
          podcasts: pod.count || 0,
        });

        // Check follow status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: follow } = await supabase.from("user_follows")
            .select("user_id").eq("user_id", user.id).eq("ministry_id", data.id).single();
          setIsFollowing(!!follow);
        }
      }
      setLoading(false);
    }
    fetchMinistry();
  }, [slug]);

  // Fetch content for active tab
  useEffect(() => {
    if (!ministry) return;
    setContent([]);
    setPage(1);
    setHasMore(true);
    fetchContent(ministry.id, activeTab, 1, true);
  }, [ministry?.id, activeTab]);

  const fetchContent = useCallback(async (
    ministryId: string,
    tab: Tab,
    pageNum: number,
    reset = false
  ) => {
    setContentLoading(true);
    let query = supabase
      .from("content")
      .select("*, ministries(name, logo_url, slug, is_verified)")
      .eq("ministry_id", ministryId)
      .order("published_at", { ascending: false })
      .range((pageNum - 1) * 18, pageNum * 18 - 1);

    if (tab === "podcast") {
      query = query.in("content_type", ["podcast", "audio"]);
    } else if (tab !== "all") {
      query = query.eq("content_type", tab);
    }

    const { data } = await query;
    const items = (data || []) as ContentItem[];
    setContent((prev) => reset ? items : [...prev, ...items]);
    setHasMore(items.length === 18);
    setPage(pageNum);
    setContentLoading(false);
  }, [supabase]);

  const loadMore = () => {
    if (!ministry || !hasMore || contentLoading) return;
    fetchContent(ministry.id, activeTab, page + 1);
  };

  const toggleFollow = async () => {
    if (!ministry) return;
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ministry_id: ministry.id }),
    });
    if (res.ok) setIsFollowing((p) => !p);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!ministry) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Ministry not found.</p>
        <Link href="/discover" className="text-primary hover:underline">← Back to Discover</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white bg-black/40 backdrop-blur px-3 py-2 rounded-full text-sm hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="relative h-[300px] w-full overflow-hidden">
        {/* Banner */}
        {ministry.banner_url ? (
          <Image src={ministry.banner_url} alt={ministry.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a0a2e] via-[#0d1a3a] to-background" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Ministry Info */}
      <div className="max-w-[800px] mx-auto px-4 -mt-16 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-[100px] h-[100px] rounded-full border-[3px] border-white overflow-hidden bg-elevated shadow-2xl mb-4">
            {ministry.logo_url ? (
              <Image src={ministry.logo_url} alt={ministry.name} width={100} height={100} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-poppins font-bold text-3xl">
                {ministry.name[0]}
              </div>
            )}
          </div>

          {/* Name + Verified */}
          <h1 className="font-poppins font-bold text-[32px] text-white text-center">
            {ministry.name}
          </h1>
          {ministry.is_verified && (
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-semibold">
              <CheckCircle size={12} /> Verified
            </span>
          )}

          {/* Bio */}
          {ministry.description && (
            <p className="text-text-secondary text-sm text-center max-w-[580px] mt-3 leading-relaxed font-inter">
              {ministry.description}
            </p>
          )}

          {/* Website */}
          {ministry.website && (
            <a
              href={ministry.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-secondary text-sm hover:underline mt-2"
            >
              <ExternalLink size={13} />
              {ministry.website.replace(/^https?:\/\//, "")}
            </a>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-3 mt-5 text-sm">
            <div className="text-center">
              <p className="text-white font-semibold">{stats.articles}</p>
              <p className="text-text-secondary text-xs">Articles</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="text-center">
              <p className="text-white font-semibold">{stats.videos}</p>
              <p className="text-text-secondary text-xs">Videos</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="text-center">
              <p className="text-white font-semibold">{stats.podcasts}</p>
              <p className="text-text-secondary text-xs">Podcasts</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <div className="text-center">
              <p className="text-white font-semibold">{ministry.follower_count.toLocaleString()}</p>
              <p className="text-text-secondary text-xs">Followers</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={toggleFollow}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                isFollowing
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "border border-primary text-primary hover:bg-primary/10"
              }`}
            >
              {isFollowing
                ? <><Check size={16} /> Following</>
                : <><UserPlus size={16} /> Follow</>}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-elevated text-text-secondary hover:text-white hover:border-white/30 transition-colors text-sm"
            >
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-elevated flex gap-1 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? "text-white" : "text-text-secondary hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="ministry-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.map((item) => (
            <Link
              key={item.id}
              href={`/${CONTENT_ROUTE[item.content_type] || "article"}/${item.id}`}
              className="block"
            >
              <LandscapeCard item={item} />
            </Link>
          ))}
          {contentLoading && Array.from({ length: 6 }).map((_, i) => (
            <LandscapeCardSkeleton key={i} />
          ))}
        </div>

        {/* Load More */}
        {hasMore && !contentLoading && content.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 rounded-full border border-elevated text-text-secondary hover:text-white hover:border-white/30 transition-colors text-sm"
            >
              Load more
            </button>
          </div>
        )}

        {!contentLoading && content.length === 0 && (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3">📭</p>
            <p>No {activeTab === "all" ? "content" : activeTab + "s"} yet from {ministry.name}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
