"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Play, Clock, Headphones } from "lucide-react";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export interface ContentItem {
  id: string;
  title: string;
  description?: string | null;
  content_type: "article" | "video" | "podcast" | "audio";
  source_url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  published_at?: string;
  topic_tags?: string[];
  view_count?: number;
  ministries?: {
    name: string;
    slug: string;
    logo_url?: string | null;
    is_verified?: boolean;
  } | null;
}

// Map content type → internal route
function getContentUrl(item: ContentItem): string {
  switch (item.content_type) {
    case "article":
      return `/article/${item.id}`;
    case "video":
      return `/video/${item.id}`;
    case "podcast":
    case "audio":
      return `/podcast/${item.id}`;
    default:
      return item.source_url;
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function estimateReadTime(description?: string | null): string {
  if (!description) return "5 min read";
  const words = description.split(" ").length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  article: { label: "ARTICLE", color: "bg-secondary/20 text-secondary" },
  video: { label: "VIDEO", color: "bg-secondary/20 text-secondary" },
  podcast: { label: "PODCAST", color: "bg-primary/20 text-primary" },
  audio: { label: "AUDIO", color: "bg-primary/20 text-primary" },
};

// ─── Landscape Card (280×160) ──────────────────────────────────────────────
export function LandscapeCard({
  item,
  showProgress,
  progress = 0,
}: {
  item: ContentItem;
  showProgress?: boolean;
  progress?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const badge = TYPE_BADGE[item.content_type] || TYPE_BADGE.article;
  const isPodcastOrAudio = item.content_type === "podcast" || item.content_type === "audio";
  const contentUrl = getContentUrl(item);

  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (isBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("content_id", item.id);
        setIsBookmarked(false);
        toast.success("Removed from bookmarks");
      } else {
        await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, content_id: item.id });
        setIsBookmarked(true);
        toast.success("Bookmarked ✓");
      }
    },
    [isBookmarked, item.id, toast]
  );

  return (
    <Link
      href={contentUrl}
      className="relative flex-shrink-0 rounded-md overflow-hidden cursor-pointer group"
      style={{ width: 280, height: 160 }}
      onMouseEnter={() => {
        setHovered(true);
        router.prefetch(contentUrl);
      }}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${item.title} — ${item.content_type}`}
    >
      {/* Thumbnail */}
      <div className="absolute inset-0 bg-elevated">
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.title}
            fill
            sizes="280px"
            className={`object-cover transition-transform duration-300 ${hovered ? "scale-105" : "scale-100"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-elevated">
            {isPodcastOrAudio ? (
              <Headphones className="text-primary w-12 h-12 opacity-40" aria-hidden="true" />
            ) : (
              <Play className="text-primary w-12 h-12 opacity-40" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 overlay-bottom" aria-hidden="true" />

      {/* Hover pink glow border */}
      <div
        className={`absolute inset-0 border-2 rounded-md transition-all duration-200 ${
          hovered ? "border-primary shadow-glow-pink" : "border-transparent"
        }`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.label}
          </span>
          {/* Bookmark icon on hover */}
          <button
            className={`p-1 rounded-full bg-black/50 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}
            onClick={handleBookmark}
            aria-label={isBookmarked ? `Remove "${item.title}" from bookmarks` : `Bookmark "${item.title}"`}
            aria-pressed={isBookmarked}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${isBookmarked ? "text-primary fill-primary" : "text-primary"}`}
            />
          </button>
        </div>

        {/* Bottom */}
        <div>
          <p className="text-white font-semibold text-sm line-clamp-2 leading-snug">{item.title}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-text-secondary text-xs line-clamp-1">
              {item.ministries?.name || ""}
            </span>
            {item.content_type === "article" ? (
              <span className="text-[10px] text-text-muted bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                {estimateReadTime(item.description)}
              </span>
            ) : item.duration_seconds ? (
              <span className="text-[10px] text-white bg-black/60 px-2 py-0.5 rounded-full">
                {formatDuration(item.duration_seconds)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </Link>
  );
}

// ─── Square Card (160×160) for Podcasts ───────────────────────────────────
export function SquareCard({ item }: { item: ContentItem }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const contentUrl = getContentUrl(item);

  return (
    <div
      className="relative flex-shrink-0 flex flex-col gap-2"
      style={{ width: 160 }}
      onMouseEnter={() => {
        setHovered(true);
        router.prefetch(contentUrl);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={contentUrl}
        className="relative rounded-md overflow-hidden"
        style={{ width: 160, height: 160 }}
        aria-label={`${item.title} — ${item.content_type}`}
      >
        <div className="absolute inset-0 bg-elevated">
          {item.thumbnail_url ? (
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              fill
              sizes="160px"
              className={`object-cover transition-transform duration-300 ${hovered ? "scale-105" : "scale-100"}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface to-elevated">
              <Headphones className="text-primary w-10 h-10 opacity-40" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-glow-pink">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Border on hover */}
        <div
          className={`absolute inset-0 border-2 rounded-md transition-all duration-200 ${
            hovered ? "border-primary" : "border-transparent"
          }`}
          aria-hidden="true"
        />
      </Link>

      <div>
        <p className="text-white text-[13px] font-medium line-clamp-2 leading-snug">{item.title}</p>
        {item.duration_seconds && (
          <p className="text-text-secondary text-[11px] mt-0.5">{formatDuration(item.duration_seconds)}</p>
        )}
      </div>
    </div>
  );
}

// ─── Wide Ministry Card (full row) ────────────────────────────────────────
export function MinistryWideCard({
  ministry,
}: {
  ministry: { name: string; slug: string; description?: string | null; logo_url?: string | null; banner_url?: string | null };
}) {
  return (
    <Link
      href={`/ministry/${ministry.slug}`}
      className="relative w-full rounded-lg overflow-hidden flex-shrink-0 group"
      style={{ height: 200 }}
      aria-label={`Explore ${ministry.name} ministry`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-surface to-elevated" aria-hidden="true" />
      {ministry.banner_url && (
        <Image
          src={ministry.banner_url}
          alt={`${ministry.name} banner`}
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 overlay-left" aria-hidden="true" />
      <div className="relative z-10 p-8 flex flex-col justify-center h-full max-w-xl">
        {ministry.logo_url && (
          <Image
            src={ministry.logo_url}
            alt={`${ministry.name} logo`}
            width={48}
            height={48}
            className="rounded mb-3 object-contain bg-white/10"
          />
        )}
        <h3 className="text-white font-poppins font-bold text-xl">{ministry.name}</h3>
        {ministry.description && (
          <p className="text-text-secondary text-sm line-clamp-2 mt-1">{ministry.description}</p>
        )}
        <span className="mt-3 inline-flex items-center text-primary text-sm font-medium group-hover:underline">
          Explore Ministry →
        </span>
      </div>
    </Link>
  );
}
