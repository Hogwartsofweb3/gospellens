"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Check, Mic, BookOpen, Video, ExternalLink } from "lucide-react";
import { GospelLensLogo } from "@/components/ui/Logo";

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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12"
      style={{
        height: 64,
        backgroundColor: "rgba(15,15,15,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #2A2A2A",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <GospelLensLogo size={34} />
      <div className="flex items-center gap-3">
        <Link
          href="/signin"
          className="px-5 py-2 rounded-pill border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className="px-5 py-2 rounded-pill bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-glow-pink"
        >
          Get Started Free
        </Link>
      </div>
    </motion.header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────
const fadeUpVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.13, duration: 0.65, ease: "easeOut" as const },
  }),
};

function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Animated wisps */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="animate-wisp-1 absolute w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #E040A0 0%, transparent 70%)",
            top: "20%",
            left: "10%",
          }}
        />
        <div
          className="animate-wisp-2 absolute w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #29B6F6 0%, transparent 70%)",
            bottom: "15%",
            right: "10%",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <Image src="/logo.png" alt="Gospel Lens" width={80} height={80} className="mx-auto mb-2 rounded-xl" />
        </motion.div>

        <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
          <span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            In God's Light, We See Light
          </span>
        </motion.div>

        <motion.h1
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="font-poppins font-bold text-white leading-tight mb-2"
          style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
        >
          Every Trusted Christian Voice.
        </motion.h1>

        <motion.h2
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="font-poppins font-bold text-primary leading-tight mb-6"
          style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
        >
          One Place.
        </motion.h2>

        <motion.p
          custom={4}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontSize: 18 }}
        >
          Articles, videos, podcasts and audio from your favourite ministries —
          curated, organised, and delivered in one powerful platform.
        </motion.p>

        <motion.div
          custom={5}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
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

// ── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Mic,
    emoji: "🎙",
    title: "Podcasts & Audio",
    desc: "Thousands of sermon audio and podcast episodes from trusted ministries, playable in one unified audio player. No more app switching.",
  },
  {
    icon: BookOpen,
    emoji: "📖",
    title: "Articles & Devotionals",
    desc: "Daily articles, devotionals, and theology from Desiring God, TGC, Ligonier, and more — all in one clean reading experience.",
  },
  {
    icon: Video,
    emoji: "🎬",
    title: "Sermons & Videos",
    desc: "Full-length sermon videos and teaching series from Elevation Church, Grace to You, and other leading ministries.",
  },
];

function FeaturesSection() {
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
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group p-8 rounded-lg border border-border hover:border-primary/60 hover:shadow-glow-pink transition-all"
              style={{ backgroundColor: "#1A1A1A" }}
            >
              <span className="text-4xl block mb-4">{f.emoji}</span>
              <h3 className="text-white font-poppins font-semibold text-xl mb-3">{f.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Content Preview ───────────────────────────────────────────────────────
const PREVIEW_CARDS = [
  { title: "The Gospel and Your Suffering", ministry: "Desiring God", type: "PODCAST", gradient: "from-pink-900/40 to-transparent" },
  { title: "What Does Sola Scriptura Really Mean?", ministry: "Ligonier", type: "ARTICLE", gradient: "from-blue-900/40 to-transparent" },
  { title: "How to Pray with Power", ministry: "TGC", type: "VIDEO", gradient: "from-purple-900/40 to-transparent" },
  { title: "Grace Greater Than Our Sin", ministry: "Grace to You", type: "SERMON", gradient: "from-emerald-900/40 to-transparent" },
  { title: "The Holiness of God", ministry: "Ligonier", type: "PODCAST", gradient: "from-amber-900/40 to-transparent" },
  { title: "Why Worship Matters", ministry: "Elevation Church", type: "VIDEO", gradient: "from-rose-900/40 to-transparent" },
];

function ContentPreviewSection() {
  const router = useRouter();

  return (
    <section className="py-24 px-6 md:px-12 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-poppins font-bold text-white text-3xl mb-12 text-center"
        >
          A taste of what's inside
        </motion.h2>

        <div className="relative">
          {/* Cards row */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
            {PREVIEW_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative flex-shrink-0 rounded-lg overflow-hidden border border-border/50"
                style={{ width: 240, height: 160 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-60`} />
                <div className="absolute inset-0 overlay-bottom" />
                {/* Blur overlay */}
                <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span className="text-[10px] bg-secondary/30 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full w-fit font-bold">
                    {card.type}
                  </span>
                  <div>
                    <p className="text-white text-xs font-semibold line-clamp-2">{card.title}</p>
                    <p className="text-text-secondary text-[10px] mt-1">{card.ministry}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Overlay */}
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(to top, rgba(15,15,15,0.6) 0%, transparent 60%)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-black/70 backdrop-blur-sm border border-primary/30 rounded-xl p-6 text-center max-w-xs"
            >
              <p className="text-white font-semibold mb-1">Unlock All Content</p>
              <p className="text-text-secondary text-sm mb-4">Sign up free to access thousands of pieces of content from 50+ ministries.</p>
              <button
                onClick={() => router.push("/signup")}
                className="w-full py-2.5 bg-primary text-white font-semibold rounded-pill text-sm hover:bg-primary/90 transition-colors shadow-glow-pink"
              >
                Sign up free →
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Ministries ────────────────────────────────────────────────────────────
const MINISTRY_LOGOS = [
  { name: "Desiring God", initials: "DG", color: "#E040A0" },
  { name: "TGC", initials: "TGC", color: "#29B6F6" },
  { name: "Ligonier", initials: "LM", color: "#A78BFA" },
  { name: "Grace to You", initials: "GTY", color: "#34D399" },
  { name: "Elevation", initials: "EC", color: "#FB923C" },
  { name: "Bible Project", initials: "BP", color: "#38BDF8" },
  { name: "Apologia", initials: "AS", color: "#818CF8" },
  { name: "Wes Huff", initials: "WH", color: "#F472B6" },
  { name: "Gavin Ortlund", initials: "GO", color: "#FBBF24" },
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
              className="group flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs border border-border group-hover:shadow-glow-pink group-hover:border-primary/50 transition-all"
                style={{ backgroundColor: `${m.color}20` }}
              >
                <span style={{ color: m.color }}>{m.initials}</span>
              </div>
              <span className="text-text-secondary text-xs text-center max-w-[70px]">{m.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing removed for 100% free model ─────────────────────────────────────
// ── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-16 px-6 md:px-12 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <GospelLensLogo size={36} />
            <p className="text-text-secondary text-sm mt-4 leading-relaxed">
              Every trusted Christian voice. One place.
            </p>
            <p className="text-text-muted text-xs mt-2 italic">In God's Light, We See Light</p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              <p className="text-white text-sm font-semibold mb-1">Product</p>
              {[["Features", "#features"], ["Sign In", "/signin"], ["Get Started", "/signup"]].map(([l, h]) => (
                <Link key={l} href={h} className="text-text-secondary text-sm hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-white text-sm font-semibold mb-1">Legal</p>
              {[["Privacy Policy", "/privacy-policy"], ["Terms of Service", "/terms"]].map(([l, h]) => (
                <Link key={l} href={h} className="text-text-secondary text-sm hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-white text-sm font-semibold">Follow us</p>
            <div className="flex gap-3">
              {/* X / Twitter */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 transition-all" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 transition-all" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 transition-all" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-text-muted text-xs">© {new Date().getFullYear()} Gospel Lens. All rights reserved.</p>
          <p className="text-text-muted text-xs">Built with ♥ for the body of Christ</p>
        </div>
      </div>
    </footer>
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
