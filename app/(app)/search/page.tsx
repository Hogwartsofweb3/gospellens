"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Mic, BookOpen, Heart, Music, Cross, Globe, Flame, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LandscapeCard, ContentItem } from "@/components/ui/ContentCard";
import { LandscapeCardSkeleton } from "@/components/ui/Skeletons";

const TRENDING_SEARCHES = [
  "John Piper", "Grace", "Holy Spirit", "Marriage", "Prayer",
  "Salvation", "Prophecy", "Faith", "Healing", "Sermon on the Mount",
];

const TOPICS = [
  { id: "Sermons",     label: "Sermons",     Icon: Mic,      color: "#E040A0" },
  { id: "Bible Study", label: "Bible Study", Icon: BookOpen, color: "#29B6F6" },
  { id: "Prayer",      label: "Prayer",      Icon: Heart,    color: "#F97316" },
  { id: "Worship",     label: "Worship",     Icon: Music,    color: "#A78BFA" },
  { id: "Theology",    label: "Theology",    Icon: Book,     color: "#34D399" },
  { id: "Evangelism",  label: "Evangelism",  Icon: Globe,    color: "#FBBF24" },
];

const RESULT_TABS = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "video", label: "Videos" },
  { id: "podcast", label: "Podcasts" },
  { id: "audio", label: "Audio" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }
    performSearch(debouncedQuery, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, activeTab]);

  const performSearch = async (q: string, tab: string) => {
    setLoading(true);
    try {
      // Use Supabase full-text search via a custom query param
      const params = new URLSearchParams({
        search: q,
        limit: "24",
        sort: "latest",
      });
      if (tab !== "all") params.set("type", tab);

      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      setResults(data.data || []);
      setTotalResults(data.metadata?.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const hasQuery = debouncedQuery.trim().length > 0;

  return (
    <div className="px-6 md:px-10 py-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sermons, ministries, articles..."
          className="w-full h-14 bg-surface border border-border rounded-lg pl-12 pr-12 text-white text-base placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-elevated transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!hasQuery ? (
          /* ─ Pre-search State ─ */
          <motion.div
            key="pre-search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-8"
          >
            {/* Trending Searches */}
            <section>
              <h2 className="text-white font-semibold text-base mb-3">Trending Searches</h2>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm hover:bg-secondary/20 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            {/* Browse Topics */}
            <section>
              <h2 className="text-white font-semibold text-base mb-3">Browse Topics</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setQuery(t.id)}
                    className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-surface border-l-[3px] hover:brightness-110 transition-all text-left"
                    style={{ borderColor: t.color }}
                  >
                    <t.Icon size={20} style={{ color: t.color }} />
                    <span className="text-white text-xs font-semibold text-center leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          /* ─ Results State ─ */
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-border pb-0">
              {RESULT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Result count */}
            {!loading && (
              <p className="text-text-secondary text-sm">
                {totalResults > 0
                  ? `${totalResults} results for "${debouncedQuery}"`
                  : `No results for "${debouncedQuery}"`}
              </p>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 9 }).map((_, i) => <LandscapeCardSkeleton key={i} fluid={true} />)
                : results.map((item) => <LandscapeCard key={item.id} item={item} fluid={true} />)}
            </div>

            {/* No results state */}
            {!loading && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-16 h-16 text-text-muted mb-4" />
                <p className="text-white font-semibold text-lg">No results for "{debouncedQuery}"</p>
                <p className="text-text-secondary text-sm mt-2 mb-6">
                  Try a different keyword or browse topics
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {TOPICS.map((t) => {
                    const TopicIcon = t.Icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setQuery(t.id)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm hover:bg-secondary/20 transition-colors"
                      >
                        <TopicIcon size={14} style={{ color: t.color }} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
