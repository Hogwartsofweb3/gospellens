"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, ChevronDown, ChevronUp, Filter, SlidersHorizontal,
  Video, Mic, BookOpen, FileText, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LandscapeCard, ContentItem } from "@/components/ui/ContentCard";
import { LandscapeCardSkeleton } from "@/components/ui/Skeletons";

// ── Topics (17 Theological Topics) ──────────────────────────────────────────
const THEOLOGICAL_TOPICS = [
  { id: "Creation",                label: "Creation",                color: "#34D399" },
  { id: "The Fall",                label: "The Fall",                color: "#F87171" },
  { id: "Covenants",               label: "Covenants",               color: "#60A5FA" },
  { id: "Redemption",              label: "Redemption",              color: "#E040A0" },
  { id: "Christology",             label: "Christology",             color: "#FBBF24" },
  { id: "Kingdom",                 label: "Kingdom",                 color: "#A78BFA" },
  { id: "Faith & Grace",           label: "Faith & Grace",           color: "#38BDF8" },
  { id: "Prophecy",                label: "Prophecy",                color: "#818CF8" },
  { id: "Worship",                 label: "Worship",                 color: "#F472B6" },
  { id: "Holy Spirit",             label: "Holy Spirit",             color: "#67E8F9" },
  { id: "Judgment",                label: "Judgment",                color: "#FB923C" },
  { id: "Church",                  label: "Church",                  color: "#4ADE80" },
  { id: "Marriage and Family",     label: "Marriage & Family",       color: "#F9A8D4" },
  { id: "Spiritual Warfare",       label: "Spiritual Warfare",       color: "#C084FC" },
  { id: "Eternal Life",            label: "Eternal Life",            color: "#86EFAC" },
  { id: "Restoration",             label: "Restoration",             color: "#FCD34D" },
  { id: "Christian Lifestyle",     label: "Godly Living",            color: "#6EE7B7" },
];

const CONTENT_TYPES = [
  { id: "all",     label: "All",      Icon: LayoutGrid },
  { id: "video",   label: "Video",    Icon: Video },
  { id: "podcast", label: "Podcast",  Icon: Mic },
  { id: "audio",   label: "Audio",    Icon: Mic },
  { id: "article", label: "Article",  Icon: BookOpen },
];

const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, i) => new Date().getFullYear() - i
);

const TRENDING_SEARCHES = [
  "John Piper", "Grace", "Holy Spirit", "Marriage", "Prayer",
  "Salvation", "Prophecy", "Faith", "Healing", "Sermon on the Mount",
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Collapsible Filter Section ───────────────────────────────────────────────
function FilterSection({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-white font-semibold text-sm mb-3 hover:text-primary transition-colors"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Ministry interface ────────────────────────────────────────────────────────
interface Ministry { id: string; name: string; slug: string; }

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedMinistry, setSelectedMinistry] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [ministrySearch, setMinistrySearch] = useState("");
  const [topicSearch, setTopicSearch] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 350);

  // Load ministries for filter
  useEffect(() => {
    fetch("/api/ministries")
      .then((r) => r.json())
      .then((d) => setMinistries(d.data || []))
      .catch(() => {});
  }, []);

  // Auto-focus
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Search whenever any filter changes
  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, activeType, selectedTopics, selectedMinistry, selectedYear]);

  const performSearch = useCallback(async () => {
    const hasFilters = activeType !== "all" || selectedTopics.length > 0 || selectedMinistry || selectedYear;
    if (!debouncedQuery.trim() && !hasFilters) {
      setResults([]);
      setTotalResults(0);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "24", sort: "latest" });
      if (debouncedQuery.trim()) params.set("search", debouncedQuery.trim());
      if (activeType !== "all") params.set("type", activeType);
      if (selectedTopics.length > 0) params.set("topic", selectedTopics[0]);
      if (selectedMinistry) params.set("ministry_slug", selectedMinistry);
      if (selectedYear) params.set("year", selectedYear);

      const res = await fetch(`/api/content?${params}`);
      const data = await res.json();
      setResults(data.data || []);
      setTotalResults(data.metadata?.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeType, selectedTopics, selectedMinistry, selectedYear]);

  const clearAll = () => {
    setQuery("");
    setActiveType("all");
    setSelectedTopics([]);
    setSelectedMinistry("");
    setSelectedYear("");
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const hasQuery = debouncedQuery.trim().length > 0;
  const hasFilters = activeType !== "all" || selectedTopics.length > 0 || selectedMinistry || selectedYear;
  const activeFilterCount = (activeType !== "all" ? 1 : 0) + selectedTopics.length + (selectedMinistry ? 1 : 0) + (selectedYear ? 1 : 0);

  const filteredMinistries = ministries.filter((m) =>
    m.name.toLowerCase().includes(ministrySearch.toLowerCase())
  );
  const filteredTopics = THEOLOGICAL_TOPICS.filter((t) =>
    t.label.toLowerCase().includes(topicSearch.toLowerCase())
  );

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col gap-0">
      {/* Type */}
      <FilterSection title="Type" defaultOpen={true}>
        <div className="flex flex-col gap-1">
          {CONTENT_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                activeType === t.id
                  ? "bg-primary/15 text-primary font-medium border border-primary/30"
                  : "text-text-secondary hover:text-white hover:bg-elevated"
              }`}
            >
              <t.Icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Topics */}
      <FilterSection title="Topics" defaultOpen={true}>
        <input
          type="text"
          placeholder="Search topics..."
          value={topicSearch}
          onChange={(e) => setTopicSearch(e.target.value)}
          className="w-full px-3 py-1.5 mb-2 bg-elevated border border-border rounded-md text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
        />
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {filteredTopics.map((t) => {
            const checked = selectedTopics.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  checked
                    ? "bg-primary/15 text-primary font-medium border border-primary/30"
                    : "text-text-secondary hover:text-white hover:bg-elevated"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                {t.label}
                {checked && <span className="ml-auto text-primary text-xs">✓</span>}
              </button>
            );
          })}
        </div>
        {selectedTopics.length > 0 && (
          <button
            onClick={() => setSelectedTopics([])}
            className="mt-2 text-xs text-text-muted hover:text-primary transition-colors"
          >
            Clear topics
          </button>
        )}
      </FilterSection>

      {/* Ministry */}
      <FilterSection title="Ministry / Speaker" defaultOpen={false}>
        <input
          type="text"
          placeholder="Search ministries..."
          value={ministrySearch}
          onChange={(e) => setMinistrySearch(e.target.value)}
          className="w-full px-3 py-1.5 mb-2 bg-elevated border border-border rounded-md text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
        />
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {filteredMinistries.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMinistry(selectedMinistry === m.slug ? "" : m.slug)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                selectedMinistry === m.slug
                  ? "bg-primary/15 text-primary font-medium border border-primary/30"
                  : "text-text-secondary hover:text-white hover:bg-elevated"
              }`}
            >
              <span className="truncate">{m.name}</span>
              {selectedMinistry === m.slug && <span className="ml-auto text-primary text-xs flex-shrink-0">✓</span>}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Year */}
      <FilterSection title="Year" defaultOpen={false}>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary"
        >
          <option value="">Any year</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </FilterSection>

      {/* Clear All */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-2 w-full py-2 rounded-lg border border-border text-text-secondary hover:text-white hover:border-primary/50 text-sm transition-all"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* ── Search Bar + Mobile Filter Toggle ─── */}
      <div className="px-4 md:px-8 pt-8 pb-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sermons, topics, ministries..."
              className="w-full h-13 bg-surface border border-border rounded-xl pl-12 pr-12 text-white text-base placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all py-3.5"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-elevated transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            )}
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              activeFilterCount > 0
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-text-secondary hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active filter chips */}
        {(selectedTopics.length > 0 || selectedMinistry || selectedYear) && (
          <div className="max-w-6xl mx-auto mt-3 flex flex-wrap gap-2">
            {selectedTopics.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-medium"
              >
                {t}
                <button onClick={() => toggleTopic(t)}><X size={10} /></button>
              </span>
            ))}
            {selectedMinistry && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-medium">
                {ministries.find((m) => m.slug === selectedMinistry)?.name}
                <button onClick={() => setSelectedMinistry("")}><X size={10} /></button>
              </span>
            )}
            {selectedYear && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-elevated border border-border rounded-full text-text-secondary text-xs font-medium">
                {selectedYear}
                <button onClick={() => setSelectedYear("")}><X size={10} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Main Layout ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex gap-8">

        {/* ── Desktop Sidebar ───────────────────────────── */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center gap-2 mb-5">
              <Filter size={15} className="text-primary" />
              <span className="text-white font-semibold text-sm">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-auto bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* ── Mobile Sidebar Drawer ─────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface border-r border-border overflow-y-auto p-6 md:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter size={15} className="text-primary" />
                    <span className="text-white font-semibold">Filters</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-text-secondary hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Results Area ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!hasQuery && !hasFilters ? (
              /* ─ Pre-search State ─ */
              <motion.div key="pre-search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
                {/* Trending */}
                <section>
                  <h2 className="text-white font-semibold text-base mb-3">Trending Searches</h2>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button key={term} onClick={() => setQuery(term)}
                        className="px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm hover:bg-secondary/20 transition-colors">
                        {term}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Topic Browse */}
                <section>
                  <h2 className="text-white font-semibold text-base mb-4">Browse by Topic</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEOLOGICAL_TOPICS.map((t) => (
                      <button key={t.id} onClick={() => toggleTopic(t.id)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-surface border hover:border-primary/40 transition-all text-left"
                        style={{ borderColor: selectedTopics.includes(t.id) ? t.color : "#2A2A2A" }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="text-white text-xs font-semibold leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              /* ─ Results State ─ */
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                {/* Result summary */}
                {!loading && (
                  <p className="text-text-secondary text-sm">
                    {totalResults > 0
                      ? `${totalResults.toLocaleString()} result${totalResults !== 1 ? "s" : ""}${hasQuery ? ` for "${debouncedQuery}"` : ""}`
                      : hasQuery ? `No results for "${debouncedQuery}"` : "No content found for selected filters"}
                  </p>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {loading
                    ? Array.from({ length: 9 }).map((_, i) => <LandscapeCardSkeleton key={i} fluid />)
                    : results.map((item) => <LandscapeCard key={item.id} item={item} fluid />)}
                </div>

                {/* Empty state */}
                {!loading && results.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search className="w-14 h-14 text-text-muted mb-4" />
                    <p className="text-white font-semibold text-lg mb-2">Nothing found</p>
                    <p className="text-text-secondary text-sm mb-6">Try different keywords or adjust your filters</p>
                    <button onClick={clearAll} className="px-6 py-2 rounded-full border border-primary text-primary text-sm hover:bg-primary/10 transition-colors">
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
