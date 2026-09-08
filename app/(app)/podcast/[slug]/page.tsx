"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, Share2, CheckCircle, UserPlus, Check,
  X, Link2, SkipBack, SkipForward, Play, Pause,
  Rewind, FastForward, Moon, Volume2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePlayerStore } from "@/lib/stores/playerStore";
import { ShareModal } from "@/components/ui/ShareModal";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  source_url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  duration_seconds: number | null;
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

function formatTime(secs: number) {
  if (isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_TIMERS = [
  { label: "Off", minutes: 0 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
];

export default function PodcastPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [episode, setEpisode] = useState<ContentItem | null>(null);
  const isYouTube = episode?.source_url ? (episode.source_url.includes("youtube.com") || episode.source_url.includes("youtu.be")) : false;
  const youtubeId = isYouTube && episode?.source_url ? extractYouTubeId(episode.source_url) : null;
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ContentItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Player store state
  const {
    currentTrack,
    isPlaying: storeIsPlaying,
    currentTime: storeCurrentTime,
    duration: storeDuration,
    volume,
    playbackRate,
    play: storePlay,
    pause: storePause,
    resume: storeResume,
    setCurrentTime: storeSetTime,
    setVolume,
    setPlaybackRate,
  } = usePlayerStore();

  const isThisTrack = currentTrack?.id === episode?.id;
  const isPlaying = isThisTrack && storeIsPlaying;
  const currentTime = isThisTrack ? storeCurrentTime : 0;
  const duration = isThisTrack ? storeDuration : (episode?.duration_seconds || 0);

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [sleepRemaining, setSleepRemaining] = useState(0);

  const progressRef = useRef<HTMLDivElement>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEpisode() {
      setLoading(true);
      const { data } = await supabase
        .from("content")
        .select("*, ministries(name, logo_url, slug, is_verified)")
        .eq("id", slug)
        .single();
      if (data) {
        setEpisode(data);
        const { data: rel } = await supabase
          .from("content")
          .select("*, ministries(name, logo_url, slug, is_verified)")
          .eq("ministry_id", data.ministry_id)
          .in("content_type", ["podcast", "audio"])
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

    fetchEpisode();
    checkBookmark();
  }, [slug]);

  const togglePlay = useCallback(() => {
    if (!episode) return;
    if (isThisTrack) {
      if (storeIsPlaying) {
        storePause();
      } else {
        storeResume();
      }
    } else {
      storePlay({
        id: episode.id,
        title: episode.title,
        ministryName: episode.ministries?.name || "",
        artworkUrl: episode.thumbnail_url,
        sourceUrl: episode.source_url,
        durationSeconds: episode.duration_seconds,
      });
    }
  }, [isThisTrack, storeIsPlaying, episode, storePlay, storePause, storeResume]);

  const skip = useCallback((seconds: number) => {
    if (!isThisTrack) return;
    storeSetTime(Math.max(0, Math.min(currentTime + seconds, duration)));
  }, [isThisTrack, currentTime, duration, storeSetTime]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !isThisTrack) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    storeSetTime(pct * duration);
  }, [isThisTrack, duration, storeSetTime]);

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  }, [setPlaybackRate]);

  const setSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepMinutes(minutes);
    setShowSleepMenu(false);
    if (minutes === 0) { setSleepRemaining(0); return; }
    let remaining = minutes * 60;
    setSleepRemaining(remaining);
    sleepTimerRef.current = setInterval(() => {
      remaining--;
      setSleepRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(sleepTimerRef.current!);
        storePause();
        setSleepMinutes(0);
        setSleepRemaining(0);
      }
    }, 1000);
  }, [storePause]);

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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary">Episode not found.</p>
        <Link href="/home" className="text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const ministry = episode.ministries;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-elevated px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white hover:text-primary transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 pt-8">
        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT COLUMN — Artwork + Info */}
          <div className="flex flex-col items-center lg:items-start lg:w-[380px] flex-shrink-0">
            {/* Artwork */}
            <div
              className="w-[280px] h-[280px] lg:w-[380px] lg:h-[380px] rounded-2xl overflow-hidden flex-shrink-0 relative"
              style={{ boxShadow: isPlaying ? "0 0 60px rgba(224, 64, 160, 0.4)" : "0 8px 40px rgba(0,0,0,0.5)" }}
            >
              {episode.thumbnail_url ? (
                <Image src={episode.thumbnail_url} alt={episode.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-elevated flex items-center justify-center text-6xl">🎧</div>
              )}
            </div>

            {/* Episode Info */}
            <div className="mt-6 text-center lg:text-left w-full">
              <h1 className="font-poppins font-bold text-[22px] text-white leading-snug mb-2">
                {episode.title}
              </h1>
              {ministry && (
                <Link href={`/ministry/${ministry.slug}`} className="text-primary text-base font-medium hover:underline flex items-center gap-1 justify-center lg:justify-start">
                  {ministry.name}
                  {ministry.is_verified && <CheckCircle size={14} />}
                </Link>
              )}
              <p className="text-text-secondary text-sm mt-1">{formatDate(episode.published_at)}</p>

              {/* Action icons */}
              <div className="flex items-center gap-4 mt-4 justify-center lg:justify-start">
                <button onClick={toggleBookmark}
                  className={`transition-colors ${isBookmarked ? "text-primary" : "text-text-secondary hover:text-white"}`}>
                  <Bookmark size={22} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setShowShare(true)} className="text-text-secondary hover:text-white transition-colors">
                  <Share2 size={22} />
                </button>
                <button
                  onClick={async () => {
                    await fetch("/api/follows", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ministry_id: episode.ministry_id }),
                    });
                    setIsFollowing((p) => !p);
                  }}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ml-2 ${
                    isFollowing ? "bg-primary border-primary text-white" : "border-primary text-primary hover:bg-primary/10"
                  }`}
                >
                  {isFollowing ? <><Check size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Player Controls */}
          <div className="flex-1">
            {/* Description */}
            {episode.description && (
              <div className="mb-6">
                <div
                  className="text-text-secondary text-sm leading-relaxed font-inter overflow-y-auto max-h-[180px] pr-2 custom-scrollbar"
                  dangerouslySetInnerHTML={{ __html: episode.description }}
                />
              </div>
            )}
            <div className="border-t border-elevated mb-6" />

            {isYouTube ? (
              <div className="w-full rounded-xl overflow-hidden bg-black mb-6" style={{ aspectRatio: "16/9" }}>
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&color=white`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={episode.title}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-text-secondary">
                    <p className="text-sm">Video cannot be embedded.</p>
                    <a href={episode.source_url} target="_blank" rel="noopener noreferrer"
                      className="text-secondary text-sm hover:underline">
                      Watch on YouTube →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div
                    ref={progressRef}
                    onClick={seek}
                    className="w-full h-1.5 bg-elevated rounded-full cursor-pointer relative group"
                  >
                    <div
                      className="h-full bg-primary rounded-full relative"
                      style={{ width: `${progressPct}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-secondary opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-text-secondary text-[13px] font-inter">{formatTime(currentTime)}</span>
                    <span className="text-text-secondary text-[13px] font-inter">{formatTime(duration || episode.duration_seconds || 0)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-6 mb-6">
                  <button onClick={() => skip(-15)} className="text-white/70 hover:text-white transition-colors">
                    <Rewind size={26} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    {isPlaying ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white ml-1" />}
                  </button>
                  <button onClick={() => skip(15)} className="text-white/70 hover:text-white transition-colors">
                    <FastForward size={26} />
                  </button>
                </div>

                {/* Secondary Controls */}
                <div className="flex items-center justify-between">
                  {/* Speed Selector */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowSpeedMenu((p) => !p); setShowSleepMenu(false); }}
                      className="px-3 py-1.5 rounded-full bg-surface border border-elevated text-white text-sm font-medium hover:border-primary transition-colors"
                    >
                      {playbackRate}x
                    </button>
                    <AnimatePresence>
                      {showSpeedMenu && (
                        <motion.div
                          className="absolute bottom-10 left-0 bg-surface border border-elevated rounded-xl overflow-hidden shadow-xl z-10 min-w-[100px]"
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        >
                          {PLAYBACK_SPEEDS.map((s) => (
                            <button key={s} onClick={() => changeSpeed(s)}
                              className={`w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-elevated ${playbackRate === s ? "text-primary font-semibold" : "text-white"}`}>
                              {s}x
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sleep Timer */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowSleepMenu((p) => !p); setShowSpeedMenu(false); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-elevated text-sm font-medium hover:border-primary transition-colors ${sleepMinutes > 0 ? "text-primary border-primary" : "text-white"}`}
                    >
                      <Moon size={14} />
                      {sleepRemaining > 0 ? formatTime(sleepRemaining) : "Sleep"}
                    </button>
                    <AnimatePresence>
                      {showSleepMenu && (
                        <motion.div
                          className="absolute bottom-10 right-0 bg-surface border border-elevated rounded-xl overflow-hidden shadow-xl z-10 min-w-[130px]"
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        >
                          {SLEEP_TIMERS.map((t) => (
                            <button key={t.minutes} onClick={() => setSleepTimer(t.minutes)}
                              className={`w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-elevated ${sleepMinutes === t.minutes ? "text-primary font-semibold" : "text-white"}`}>
                              {t.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Premium Volume Controller */}
                <div className="mt-8 flex items-center justify-center gap-3 bg-surface border border-elevated rounded-2xl p-4 max-w-sm mx-auto">
                  <Volume2 className="w-5 h-5 text-white/60" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer bg-elevated"
                  />
                  <span className="text-text-secondary text-xs font-inter w-8 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ask a Question Banner */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-sm mb-0.5">Have a question about this topic?</p>
            <p className="text-text-secondary text-xs">Ask our team anything about theology or the Christian faith.</p>
          </div>
          <Link
            href="/ask"
            className="flex-shrink-0 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-glow-pink whitespace-nowrap"
          >
            Ask a Question
          </Link>
        </div>

        {/* More Episodes */}
        {related.length > 0 && (
          <div className="mt-12">
            <div className="border-t border-elevated mb-6" />
            <h2 className="text-primary font-poppins font-semibold text-xl mb-4">More Episodes</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {related.map((item) => (
                <Link key={item.id} href={`/podcast/${item.id}`}
                  className={`flex-shrink-0 w-56 bg-surface rounded-xl overflow-hidden hover:bg-elevated transition-colors group border ${item.id === episode.id ? "border-primary" : "border-transparent"}`}>
                  {item.id === episode.id && <div className="w-1 h-full bg-primary absolute left-0 top-0 rounded-l-xl" />}
                  {item.thumbnail_url && (
                    <Image src={item.thumbnail_url} alt={item.title} width={224} height={126} className="object-cover w-full h-[126px]" />
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        title={episode.title}
        contentType="podcast"
      />
    </div>
  );
}
