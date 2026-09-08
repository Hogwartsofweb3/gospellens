"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bookmark, Share2, CheckCircle, ExternalLink,
  UserPlus, Check, X, Link2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { ArticlePageSkeleton } from "@/components/ui/PageSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  source_url: string;
  thumbnail_url: string | null;
  published_at: string | null;
  topic_tags: string[];
  ministry_id: string;
  content_fetched: boolean;
  ministries: {
    name: string;
    logo_url: string | null;
    slug: string;
    is_verified: boolean;
  } | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function estimateReadTime(text: string) {
  const words = text.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function ArticleReaderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const toast = useToast();

  const [article, setArticle] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ContentItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [showShare, setShowShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      // fetch by id (slug = id for now)
      const { data } = await supabase
        .from("content")
        .select("*, ministries(name, logo_url, slug, is_verified)")
        .eq("id", slug)
        .single();
      if (data) {
        setArticle(data);
        // fetch related from same ministry
        const { data: rel } = await supabase
          .from("content")
          .select("*, ministries(name, logo_url, slug, is_verified)")
          .eq("ministry_id", data.ministry_id)
          .eq("content_type", "article")
          .neq("id", data.id)
          .limit(6);
        setRelated(rel || []);

        // increment view count
        await supabase.rpc("increment_view_count", { content_id: data.id });
      }
      setLoading(false);
    }

    async function checkBookmark() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", slug)
        .single();
      setIsBookmarked(!!data);
    }

    fetchArticle();
    checkBookmark();
  }, [slug]);

  const toggleBookmark = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (isBookmarked) {
      await supabase.from("bookmarks").delete()
        .eq("user_id", user.id).eq("content_id", slug);
      setIsBookmarked(false);
      toast.success("Removed from bookmarks");
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, content_id: slug });
      setIsBookmarked(true);
      toast.success("Bookmarked ✓");
    }
  }, [isBookmarked, slug, toast]);

  const toggleFollow = useCallback(async () => {
    if (!article?.ministries) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ministry_id: article.ministry_id }),
    });
    if (res.ok) {
      const wasFollowing = isFollowing;
      setIsFollowing((p) => !p);
      toast.success(wasFollowing ? `Unfollowed ${article.ministries?.name}` : `Now following ${article.ministries?.name}`);
    }
  }, [article, isFollowing, toast]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (loading) return <ArticlePageSkeleton />;

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorState message="Article not found." onRetry={() => router.refresh()} />
      </div>
    );
  }

  const ministry = article.ministries;
  const hasFullContent = !!(article.description && article.description.length > 300);
  const readTime = estimateReadTime(article.description || "");

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-elevated px-4 py-3 flex items-center justify-between max-w-[760px] mx-auto w-full">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex items-center gap-1.5 text-white hover:text-primary transition-colors"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span className="text-sm font-inter">Back</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            aria-pressed={isBookmarked}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? "text-primary" : "text-text-secondary hover:text-white"}`}
          >
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <button
            onClick={() => setShowShare(true)}
            aria-label="Share article"
            className="p-2 rounded-full text-text-secondary hover:text-white transition-colors"
          >
            <Share2 size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[760px] mx-auto px-6 pt-8">
        {/* Ministry Row */}
        {ministry && (
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/ministry/${ministry.slug}`}>
              <div className="w-10 h-10 rounded-full bg-elevated overflow-hidden border border-white/10 flex-shrink-0">
                {ministry.logo_url ? (
                  <Image src={ministry.logo_url} alt={ministry.name} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {ministry.name[0]}
                  </div>
                )}
              </div>
            </Link>
            <Link href={`/ministry/${ministry.slug}`} className="text-secondary hover:underline text-sm font-medium flex items-center gap-1">
              {ministry.name}
              {ministry.is_verified && <CheckCircle size={14} className="text-secondary" />}
            </Link>
            <button
              onClick={toggleFollow}
              className={`ml-auto text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                isFollowing
                  ? "bg-primary border-primary text-white"
                  : "border-primary text-primary hover:bg-primary/10"
              }`}
            >
              {isFollowing ? <span className="flex items-center gap-1"><Check size={12} /> Following</span> : <span className="flex items-center gap-1"><UserPlus size={12} /> Follow</span>}
            </button>
          </div>
        )}

        {/* Article Header */}
        <div className="mb-2">
          <span className="inline-block px-2.5 py-1 text-[11px] font-semibold tracking-widest text-secondary bg-secondary/10 rounded-full mb-4">
            ARTICLE
          </span>
        </div>
        <h1 className="font-poppins font-bold text-[36px] leading-tight text-white mb-4">
          {article.title}
        </h1>
        <div className="flex items-center gap-2 text-text-secondary text-sm font-inter mb-6">
          <span>{ministry?.name}</span>
          <span>·</span>
          <span>{formatDate(article.published_at)}</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>

        {/* Hero Image */}
        {article.thumbnail_url && (
          <div className="w-full h-[400px] rounded-[10px] overflow-hidden mb-8">
            <Image
              src={article.thumbnail_url}
              alt={article.title}
              width={760}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Article Body */}
        {hasFullContent ? (
          <div
            className="article-body"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        ) : (
          <div className="article-body-empty">
            <div className="empty-content-card">
              <div className="empty-icon">📖</div>
              <p className="empty-title">Full article content is being loaded</p>
              <p className="empty-subtitle">
                We are enriching this article for in-app reading. In the meantime, you can read it at the original source.
              </p>
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="empty-link"
              >
                <ExternalLink size={15} />
                Open at {ministry?.name}
              </a>
            </div>
          </div>
        )}

        {/* Original Source Link (always shown at bottom) */}
        <div className="mt-10 pt-6 border-t border-elevated flex items-center justify-between">
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-secondary transition-colors text-sm"
          >
            <ExternalLink size={14} />
            Original article at {ministry?.name}
          </a>
          {article.topic_tags && article.topic_tags.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {article.topic_tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-elevated text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ask a Question Banner */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 px-5 py-5 flex items-center justify-between gap-4">
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

        {/* More from Ministry */}
        {related.length > 0 && (
          <div className="mt-10">
            <div className="border-t border-elevated mb-6" />
            <h2 className="text-primary font-poppins font-semibold text-xl mb-4">
              More from {ministry?.name}
            </h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/article/${item.id}`}
                  className="flex-shrink-0 w-56 bg-surface rounded-xl overflow-hidden hover:bg-elevated transition-colors group"
                >
                  {item.thumbnail_url && (
                    <Image src={item.thumbnail_url} alt={item.title} width={224} height={126} className="object-cover w-full h-[126px]" />
                  )}
                  <div className="p-3">
                    <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-text-secondary text-xs mt-1">{formatDate(item.published_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Font Size Control */}
      <div className="fixed bottom-24 right-6 z-50 flex items-center gap-1 bg-surface border border-elevated rounded-full px-3 py-2 shadow-xl">
        <button
          onClick={() => setFontSize((s) => Math.max(13, s - 2))}
          className="text-white/70 hover:text-white text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-elevated transition-colors"
        >
          A−
        </button>
        <div className="w-px h-4 bg-elevated" />
        <button
          onClick={() => setFontSize(17)}
          className="text-white/70 hover:text-white text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full hover:bg-elevated transition-colors"
        >
          A
        </button>
        <div className="w-px h-4 bg-elevated" />
        <button
          onClick={() => setFontSize((s) => Math.min(24, s + 2))}
          className="text-white/70 hover:text-white font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-elevated transition-colors"
          style={{ fontSize: "18px" }}
        >
          A+
        </button>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShare(false)}
          >
            <motion.div
              className="bg-surface border border-elevated rounded-2xl p-6 w-full max-w-sm"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-poppins font-semibold">Share Article</h3>
                <button onClick={() => setShowShare(false)} className="text-text-secondary hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2">{article.title}</p>
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-elevated hover:bg-primary/20 border border-elevated hover:border-primary transition-colors text-white text-sm"
              >
                {linkCopied ? <><Check size={16} className="text-primary" /> Copied!</> : <><Link2 size={16} /> Copy Link</>}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .article-body {
          font-family: var(--font-lora), Georgia, serif;
          color: #E0E0E0;
          line-height: 1.9;
        }
        .article-body h1, .article-body h2, .article-body h3, .article-body h4, .article-body h5 {
          font-family: var(--font-poppins), sans-serif;
          color: white;
          font-weight: 700;
          margin: 1.8em 0 0.6em;
          line-height: 1.3;
        }
        .article-body h1 { font-size: 1.6em; }
        .article-body h2 { font-size: 1.35em; }
        .article-body h3 { font-size: 1.15em; }
        .article-body p { margin-bottom: 1.3em; }
        .article-body a { color: #29B6F6; text-decoration: underline; word-break: break-word; }
        .article-body blockquote {
          border-left: 3px solid #E040A0;
          padding: 0.8em 1.2em;
          margin: 1.5em 0;
          background: rgba(224,64,160,0.06);
          border-radius: 0 8px 8px 0;
          color: #B0BEC5;
          font-style: italic;
        }
        .article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
          margin: 1.5em auto;
          display: block;
        }
        .article-body ul, .article-body ol { padding-left: 1.6em; margin-bottom: 1.3em; }
        .article-body li { margin-bottom: 0.5em; }
        .article-body strong, .article-body b { color: white; font-weight: 600; }
        .article-body em { font-style: italic; color: #CFD8DC; }
        .article-body pre, .article-body code {
          background: rgba(255,255,255,0.06);
          border-radius: 6px;
          padding: 0.2em 0.5em;
          font-family: monospace;
          font-size: 0.9em;
        }
        .article-body figure { margin: 1.5em 0; text-align: center; }
        .article-body figcaption { font-size: 0.85em; color: #78909C; margin-top: 0.4em; }
        .article-body table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.95em; }
        .article-body th { background: rgba(255,255,255,0.08); color: white; padding: 0.6em 1em; text-align: left; }
        .article-body td { padding: 0.6em 1em; border-bottom: 1px solid rgba(255,255,255,0.08); }
        /* Empty state */
        .article-body-empty { padding: 2em 0; }
        .empty-content-card {
          background: rgba(255,255,255,0.04);
          border: 1px dashed rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 2.5em 2em;
          text-align: center;
        }
        .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .empty-title { color: white; font-family: var(--font-poppins); font-size: 1.1rem; font-weight: 600; margin-bottom: 0.6em; }
        .empty-subtitle { color: #78909C; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5em; }
        .empty-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
          background: rgba(41,182,246,0.1);
          border: 1px solid rgba(41,182,246,0.3);
          color: #29B6F6;
          padding: 0.6em 1.4em;
          border-radius: 999px;
          font-size: 0.9rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .empty-link:hover { background: rgba(41,182,246,0.2); }
      `}</style>
    </div>
  );
}
