"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, Share2, ChevronDown, ChevronUp,
  CheckCircle, UserPlus, Check, Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ShareModal } from "@/components/ui/ShareModal";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  source_url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
  ministry_id: string;
  ministries: {
    name: string;
    logo_url: string | null;
    slug: string;
    is_verified: boolean;
  } | null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function VideoPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [video, setVideo] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ContentItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true);
      const { data } = await supabase
        .from("content")
        .select("*, ministries(name, logo_url, slug, is_verified)")
        .eq("id", slug)
        .single();
      if (data) {
        setVideo(data);
        const { data: rel } = await supabase
          .from("content")
          .select("*, ministries(name, logo_url, slug, is_verified)")
          .eq("ministry_id", data.ministry_id)
          .eq("content_type", "video")
          .neq("id", data.id)
          .limit(8);
        setRelated(rel || []);
        await supabase.rpc("increment_view_count", { content_id: data.id });
      }
      setLoading(false);
    }

    async function checkBookmark() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("bookmarks").select("id")
        .eq("user_id", user.id).eq("content_id", slug).single();
      setIsBookmarked(!!data);
    }

    fetchVideo();
    checkBookmark();
  }, [slug]);

  const toggleBookmark = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (isBookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("content_id", slug);
      setIsBookmarked(false);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_id: slug });
      setIsBookmarked(true);
    }
  }, [isBookmarked, slug]);

  const toggleFollow = useCallback(async () => {
    if (!video?.ministry_id) return;
    await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ministry_id: video.ministry_id }),
    });
    setIsFollowing((p) => !p);
  }, [video]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Video not found.</p>
        <Link href="/home" className="text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const ministry = video.ministries;
  const youtubeId = video.source_url ? extractYouTubeId(video.source_url) : null;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-elevated px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white hover:text-primary transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="max-w-[900px] mx-auto px-4 pt-6">
        {/* Video Player */}
        <div className="w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&color=white`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={video.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-text-secondary">
              <p className="text-sm">Video cannot be embedded.</p>
              <a href={video.source_url} target="_blank" rel="noopener noreferrer"
                className="text-secondary text-sm hover:underline">
                Watch on YouTube →
              </a>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-5">
          <h1 className="font-poppins font-bold text-[28px] text-white leading-snug mb-3">
            {video.title}
          </h1>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {ministry && (
              <Link href={`/ministry/${ministry.slug}`} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-elevated overflow-hidden border border-white/10 flex-shrink-0">
                  {ministry.logo_url ? (
                    <Image src={ministry.logo_url} alt={ministry.name} width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{ministry.name[0]}</div>
                  )}
                </div>
                <span className="text-secondary text-sm font-medium flex items-center gap-1">
                  {ministry.name}
                  {ministry.is_verified && <CheckCircle size={12} className="text-secondary" />}
                </span>
              </Link>
            )}
            <span className="text-text-secondary text-sm">·</span>
            <span className="text-text-secondary text-sm">{formatDate(video.published_at)}</span>
            <span className="text-text-secondary text-sm">·</span>
            <span className="text-text-secondary text-sm flex items-center gap-1">
              <Eye size={13} /> {(video.view_count || 0).toLocaleString()} views
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              onClick={toggleFollow}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full border font-medium transition-colors ${
                isFollowing ? "bg-primary border-primary text-white" : "border-primary text-primary hover:bg-primary/10"
              }`}
            >
              {isFollowing ? <><Check size={14} /> Following</> : <><UserPlus size={14} /> Follow {ministry?.name}</>}
            </button>
            <button onClick={toggleBookmark}
              className={`p-2 rounded-full border transition-colors ${isBookmarked ? "border-primary text-primary" : "border-elevated text-text-secondary hover:text-white hover:border-white/30"}`}>
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button onClick={() => setShowShare(true)}
              className="p-2 rounded-full border border-elevated text-text-secondary hover:text-white hover:border-white/30 transition-colors">
              <Share2 size={18} />
            </button>
          </div>

          {/* Description */}
          {video.description && (
            <div className="bg-surface rounded-xl p-4 mb-6">
              <div
                className={`text-text-secondary text-sm leading-relaxed overflow-hidden transition-all ${descExpanded ? "" : "line-clamp-3"}`}
                dangerouslySetInnerHTML={{ __html: video.description }}
              />
              <button
                onClick={() => setDescExpanded((p) => !p)}
                className="flex items-center gap-1 text-secondary text-sm mt-2 hover:underline"
              >
                {descExpanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show more</>}
              </button>
            </div>
          )}

          {/* Related Videos */}
          {related.length > 0 && (
            <div>
              <div className="border-t border-elevated mb-5" />
              <h2 className="text-primary font-poppins font-semibold text-xl mb-4">
                More from {ministry?.name}
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {related.map((item) => (
                  <Link key={item.id} href={`/video/${item.id}`}
                    className="flex-shrink-0 w-64 bg-surface rounded-xl overflow-hidden hover:bg-elevated transition-colors group">
                    {item.thumbnail_url && (
                      <div className="relative">
                        <Image src={item.thumbnail_url} alt={item.title} width={256} height={144} className="object-cover w-full h-[144px]" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-text-secondary text-xs mt-1">{formatDate(item.published_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={video.title}
        contentType={video.content_type}
      />
    </div>
  );
}
