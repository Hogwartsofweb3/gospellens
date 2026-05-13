"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, FileText, Video, Mic, Headphones, LayoutGrid, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BookmarkedItem {
  id: string;
  created_at: string;
  content: {
    id: string;
    title: string;
    description: string;
    content_type: string;
    source_url: string;
    thumbnail_url: string | null;
    published_at: string | null;
    ministry_id: string;
    ministries: {
      name: string;
      logo_url: string | null;
      slug: string;
    } | null;
  };
}

type Tab = "all" | "article" | "video" | "podcast" | "audio";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <LayoutGrid size={14} /> },
  { id: "article", label: "Articles", icon: <FileText size={14} /> },
  { id: "video", label: "Videos", icon: <Video size={14} /> },
  { id: "podcast", label: "Podcasts", icon: <Mic size={14} /> },
  { id: "audio", label: "Audio", icon: <Headphones size={14} /> },
];

const CONTENT_ROUTE: Record<string, string> = {
  article: "article", video: "video", podcast: "podcast", audio: "audio",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    async function fetchBookmarks() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("bookmarks")
        .select(`
          id,
          created_at,
          content:content_id (
            id, title, description, content_type,
            source_url, thumbnail_url, published_at, ministry_id,
            ministries (name, logo_url, slug)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setBookmarks((data as unknown as BookmarkedItem[]) || []);
      setLoading(false);
    }
    fetchBookmarks();
  }, []);

  const removeBookmark = useCallback(async (bookmarkId: string, contentId: string) => {
    setRemoving((prev) => new Set(prev).add(contentId));
    await supabase.from("bookmarks").delete().eq("id", bookmarkId);
    setTimeout(() => {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      setRemoving((prev) => { const s = new Set(prev); s.delete(contentId); return s; });
    }, 350);
  }, []);

  const filtered = bookmarks.filter((b) => {
    if (activeTab === "all") return true;
    return b.content?.content_type === activeTab;
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-[1100px] mx-auto px-4 pt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-[36px] text-white">Your Bookmarks</h1>
          <p className="text-text-secondary font-inter mt-1">Everything you've saved, in one place.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-elevated mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab.id ? "text-white" : "text-text-secondary hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="bookmark-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl skeleton" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <Bookmark size={80} className="text-elevated" strokeWidth={1} />
            <h2 className="font-poppins font-bold text-xl text-white">Nothing saved yet</h2>
            <p className="text-text-secondary text-sm text-center max-w-xs">
              Tap the bookmark icon on any content to save it here.
            </p>
            <Link
              href="/discover"
              className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Compass size={15} /> Explore Content
            </Link>
          </motion.div>
        )}

        {/* Content Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((bookmark) => {
                const item = bookmark.content;
                if (!item) return null;
                const isRemoving = removing.has(item.id);
                const route = CONTENT_ROUTE[item.content_type] || "article";

                return (
                  <motion.div
                    key={bookmark.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.9 : 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface rounded-xl overflow-hidden group relative border border-transparent hover:border-elevated transition-colors"
                  >
                    {/* Thumbnail */}
                    <Link href={`/${route}/${item.id}`}>
                      <div className="relative h-44 bg-elevated overflow-hidden">
                        {item.thumbnail_url ? (
                          <Image
                            src={item.thumbnail_url}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-elevated">
                            {item.content_type === "video" ? "🎬" : item.content_type === "podcast" ? "🎧" : "📖"}
                          </div>
                        )}
                        {/* Type badge */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 text-[10px] font-semibold tracking-widest bg-black/60 text-white rounded-full uppercase">
                            {item.content_type}
                          </span>
                        </div>
                        {/* Dark overlay on hover */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-3 pr-10">
                      <Link href={`/${route}/${item.id}`}>
                        <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {item.title}
                        </p>
                      </Link>
                      {item.ministries && (
                        <Link href={`/ministry/${item.ministries.slug}`} className="flex items-center gap-1.5 mt-1.5">
                          {item.ministries.logo_url && (
                            <Image src={item.ministries.logo_url} alt={item.ministries.name} width={14} height={14} className="rounded-full" />
                          )}
                          <span className="text-text-secondary text-xs hover:text-secondary transition-colors">{item.ministries.name}</span>
                        </Link>
                      )}
                      <p className="text-text-secondary text-xs mt-1">{formatDate(item.published_at)}</p>
                    </div>

                    {/* Remove Bookmark Button */}
                    <button
                      onClick={() => removeBookmark(bookmark.id, item.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-primary hover:bg-primary hover:text-white transition-colors z-10"
                      title="Remove bookmark"
                    >
                      <Bookmark size={14} fill="currentColor" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
