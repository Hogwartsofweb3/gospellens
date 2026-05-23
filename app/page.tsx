"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Mic, BookOpen, Video, Lock } from "lucide-react";
import { GospelLensLogo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { Footer } from "@/components/layout/Footer";

// ── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    setVisible(v > 60);
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -10 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12"
      style={{
        height: 64,
        backgroundColor: "rgba(15,15,15,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2A2A2A",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <GospelLensLogo size={34} />
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/signin"
          className="px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-primary text-primary text-xs md:text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-3 py-1.5 md:px-5 md:py-2 rounded-full bg-primary text-white text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors shadow-glow-pink"
        >
          Get Started Free
        </Link>
      </div>
    </motion.header>
  );
}

// ── Animation variants ────────────────────────────────────────────────────
const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.13, duration: 0.65, ease: "easeOut" as const },
  }),
};

// ── Hero ──────────────────────────────────────────────────────────────────
function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Animated wisps */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-wisp-1 absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #E040A0 0%, transparent 70%)", top: "20%", left: "10%" }}
        />
        <div
          className="animate-wisp-2 absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #29B6F6 0%, transparent 70%)", bottom: "15%", right: "10%" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate="visible" className="mb-6">
          <Image src="/logo.png" alt="Gospel Lens" width={80} height={80} className="mx-auto rounded-xl" />
        </motion.div>

        {/* Tagline ABOVE headline (Item 9) */}
        <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
          <span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            In God's Light, We See Light
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          custom={2} variants={fadeUpVariants} initial="hidden" animate="visible"
          className="font-poppins font-bold text-white leading-tight mb-2"
          style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
        >
          Every Trusted Christian Voice.
        </motion.h1>

        <motion.h2
          custom={3} variants={fadeUpVariants} initial="hidden" animate="visible"
          className="font-poppins font-bold text-primary leading-tight mb-4"
          style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
        >
          One Place.
        </motion.h2>

        <motion.p
          custom={4} variants={fadeUpVariants} initial="hidden" animate="visible"
          className="text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontSize: 18 }}
        >
          Articles, videos, podcasts and audio from your favourite ministries —
          curated, organised, and delivered in one powerful platform.
        </motion.p>

        <motion.div
          custom={5} variants={fadeUpVariants} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push("/signup")}
            className="px-8 py-3.5 bg-primary text-white font-semibold rounded-pill text-base hover:bg-primary/90 transition-all shadow-glow-pink-lg"
          >
            Start Free
          </button>
          <a
            href="#features"
            className="px-8 py-3.5 border border-white/30 text-white font-semibold rounded-pill text-base hover:bg-white/5 transition-colors"
          >
            See What's Inside ↓
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// ── Features (with auth-gated links — Item 18) ────────────────────────────
const FEATURES = [
  {
    Icon: Mic,
    emoji: "🎙",
    title: "Podcasts & Audio",
    desc: "Thousands of sermon audio and podcast episodes from trusted ministries, playable in one unified audio player. No more app switching.",
    href: "/discover?type=podcast",
  },
  {
    Icon: BookOpen,
    emoji: "📖",
    title: "Articles & Devotionals",
    desc: "Daily articles, devotionals, and theology from Desiring God, TGC, Ligonier, and more — all in one clean reading experience.",
    href: "/discover?type=article",
  },
  {
    Icon: Video,
    emoji: "🎬",
    title: "Sermons & Videos",
    desc: "Full-length sermon videos and teaching series from Grace to You, Apologia Studios, and other leading ministries.",
    href: "/discover?type=video",
  },
];

function FeaturesSection() {
  const router = useRouter();

  const handleFeatureClick = async (href: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push(href);
    } else {
      router.push("/signup");
    }
  };

  return (
    <section id="features" className="py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-poppins font-bold text-white text-center text-4xl mb-4">
          Everything you need.
        </h2>
        <p className="text-center text-primary font-poppins font-bold text-4xl mb-16">
          Nothing you don't.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.button
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleFeatureClick(f.href)}
              className="group p-8 rounded-lg border border-border hover:border-primary/60 hover:shadow-glow-pink transition-all text-left w-full cursor-pointer"
              style={{ backgroundColor: "#1A1A1A" }}
            >
              <span className="text-4xl block mb-4">{f.emoji}</span>
              <h3 className="text-white font-poppins font-semibold text-xl mb-3">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              <p className="text-primary text-xs mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Explore → <span className="text-text-muted">(sign in required)</span>
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Live Content Preview with Blur Gate (Items 7, 8) ─────────────────────
interface PreviewItem {
  id: string;
  title: string;
  content_type: string;
  thumbnail_url: string | null;
  ministries: { name: string } | null;
}

const TYPE_COLORS: Record<string, string> = {
  video: "#E040A0",
  podcast: "#A78BFA",
  audio: "#29B6F6",
  article: "#34D399",
};

function ContentPreviewSection() {
  const router = useRouter();
  const [items, setItems] = useState<PreviewItem[]>([]);

  useEffect(() => {
    fetch("/api/content?limit=9&sort=trending")
      .then((r) => r.json())
      .then((d) => setItems(d.data || []))
      .catch(() => {});
  }, []);

  const handleCardClick = async (item: PreviewItem, isBlurred: boolean) => {
    if (!isBlurred) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Navigate to the appropriate content page
      const typeMap: Record<string, string> = {
        video: "video",
        podcast: "podcast",
        audio: "audio",
        article: "article",
      };
      router.push(`/${typeMap[item.content_type] || "video"}/${item.id}`);
    } else {
      router.push("/signup");
    }
  };

  // Fallback placeholder cards
  const PLACEHOLDERS = [
    { title: "The Gospel and Your Suffering", ministry: "Desiring God", type: "podcast", gradient: "from-pink-900/50" },
    { title: "What Does Sola Scriptura Really Mean?", ministry: "Ligonier", type: "article", gradient: "from-blue-900/50" },
    { title: "How to Pray with Power", ministry: "TGC", type: "video", gradient: "from-purple-900/50" },
    { title: "Grace Greater Than Our Sin", ministry: "Grace to You", type: "podcast", gradient: "from-emerald-900/50" },
    { title: "The Holiness of God", ministry: "Ligonier", type: "article", gradient: "from-amber-900/50" },
    { title: "Why Does God Allow Evil?", ministry: "Apologia", type: "video", gradient: "from-rose-900/50" },
    { title: "Knowing God Personally", ministry: "Desiring God", type: "podcast", gradient: "from-cyan-900/50" },
    { title: "The Atonement Explained", ministry: "Gospel in Life", type: "video", gradient: "from-violet-900/50" },
    { title: "Living by the Spirit", ministry: "TGC", type: "article", gradient: "from-teal-900/50" },
  ];

  const displayItems = items.length >= 6 ? items : null;

  return (
    <section className="py-24 px-6 md:px-12 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-poppins font-bold text-white text-3xl mb-3">
            A taste of what's inside
          </h2>
          <p className="text-text-secondary text-sm">
            Thousands of pieces of content from 50+ ministries, curated for you.
          </p>
        </motion.div>

        {/* 3-column grid. First 3 fully visible, next 6 progressively blurred */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(displayItems || PLACEHOLDERS).map((item, i) => {
              const isBlurred = i >= 3;
              const type = displayItems
                ? (item as PreviewItem).content_type
                : (item as typeof PLACEHOLDERS[0]).type;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="relative rounded-xl overflow-hidden border border-border/50 cursor-pointer group"
                  style={{ aspectRatio: "16/9" }}
                  onClick={() => handleCardClick(item as PreviewItem, isBlurred)}
                >
                  {/* Background */}
                  {displayItems && (item as PreviewItem).thumbnail_url ? (
                    <Image
                      src={(item as PreviewItem).thumbnail_url!}
                      alt={(item as PreviewItem).title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        displayItems ? "from-surface to-elevated" : (item as typeof PLACEHOLDERS[0]).gradient + " to-transparent"
                      }`}
                      style={{ backgroundColor: "#1A1A1A" }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="absolute inset-0 overlay-bottom" />

                  {/* Blur for gated items */}
                  {isBlurred && (
                    <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                    {/* Type badge */}
                    <span
                      className="text-[10px] px-2.5 py-0.5 rounded-full w-fit font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${TYPE_COLORS[type] || "#E040A0"}20`,
                        color: TYPE_COLORS[type] || "#E040A0",
                        border: `1px solid ${TYPE_COLORS[type] || "#E040A0"}40`,
                      }}
                    >
                      {type}
                    </span>

                    {/* Title */}
                    <div>
                      <p className="text-white text-sm font-semibold line-clamp-2 leading-snug mb-1">
                        {displayItems ? (item as PreviewItem).title : (item as typeof PLACEHOLDERS[0]).title}
                      </p>
                      <p className="text-text-secondary text-xs">
                        {displayItems
                          ? (item as PreviewItem).ministries?.name
                          : (item as typeof PLACEHOLDERS[0]).ministry}
                      </p>
                    </div>
                  </div>

                  {/* Lock icon on blurred cards */}
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Lock size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Progressive bottom fade + CTA */}
          <div
            className="absolute bottom-0 left-0 right-0 h-64 flex flex-col items-center justify-end pb-8"
            style={{ background: "linear-gradient(to top, rgba(15,15,15,0.97) 0%, rgba(15,15,15,0.7) 50%, transparent 100%)", pointerEvents: "none" }}
          />
          <div className="relative mt-[-80px] flex flex-col items-center z-20 pb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-black/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-7 text-center max-w-sm shadow-glow-pink"
            >
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">🔓 Unlock All Content</p>
              <p className="text-white font-semibold text-lg mb-1">Join Gospel Lens Free</p>
              <p className="text-text-secondary text-sm mb-5">
                Access thousands of sermons, articles, and podcasts from 50+ faithful ministries — 100% free.
              </p>
              <button
                onClick={() => router.push("/signup")}
                className="w-full py-3 bg-primary text-white font-bold rounded-pill text-sm hover:bg-primary/90 transition-colors shadow-glow-pink"
              >
                Sign up free →
              </button>
              <p className="text-text-muted text-xs mt-3">Already have an account? <Link href="/signin" className="text-secondary hover:underline">Sign in</Link></p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Ministries ────────────────────────────────────────────────────────────
const MINISTRY_LOGOS = [
  { name: "Desiring God",       logoUrl: "https://www.desiringgod.org/apple-touch-icon.png",         color: "#E040A0" },
  { name: "The Gospel Coalition", logoUrl: "https://www.thegospelcoalition.org/apple-touch-icon.png", color: "#29B6F6" },
  { name: "Ligonier Ministries", logoUrl: "https://www.ligonier.org/apple-touch-icon.png",             color: "#A78BFA" },
  { name: "Grace to You",       logoUrl: "https://www.gty.org/apple-touch-icon.png",                 color: "#34D399" },
  { name: "Bible Project",      logoUrl: "https://bibleproject.com/apple-touch-icon.png",         color: "#38BDF8" },
  { name: "Apologia Studios",   logoUrl: "https://img.icons8.com/fluency/96/video.png",     color: "#818CF8" },
  { name: "Gospel in Life",     logoUrl: "https://gospelinlife.com/apple-touch-icon.png",         color: "#FBBF24" },
  { name: "Monergism",          logoUrl: "https://www.monergism.com/favicon.ico",             color: "#F472B6" },
  { name: "Sovereign Grace Lagos", logoUrl: "https://img.icons8.com/fluency/96/church.png", color: "#3B82F6" },
  { name: "Sovereign Grace Abuja", logoUrl: "https://img.icons8.com/fluency/96/church.png", color: "#10B981" }
];

function MinistriesSection() {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-poppins font-bold text-white text-3xl mb-3"
        >
          Trusted by believers following 50+ ministries
        </motion.h2>
        <p className="text-text-secondary mb-12">All in one place, for the first time.</p>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 justify-center flex-wrap">
          {MINISTRY_LOGOS.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group flex flex-col items-center gap-3 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-surface border border-border group-hover:shadow-glow-pink group-hover:border-primary/50 transition-all p-1">
                <img
                  src={m.logoUrl}
                  alt={m.name}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=242424&color=fff`;
                  }}
                />
              </div>
              <span className="text-text-secondary text-xs text-center max-w-[80px] font-medium leading-tight">{m.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ContentPreviewSection />
      <MinistriesSection />
      <Footer />
    </div>
  );
}
