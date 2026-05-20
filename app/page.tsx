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
    desc: "Full-length sermon videos and teaching series from Grace to You, Apologia Studios, and other leading ministries.",
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
  { title: "Why Does God Allow Evil?", ministry: "Apologia", type: "VIDEO", gradient: "from-rose-900/40 to-transparent" },
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
  { name: "Desiring God", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://desiringgod.org&size=128", color: "#E040A0" },
  { name: "The Gospel Coalition", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://thegospelcoalition.org&size=128", color: "#29B6F6" },
  { name: "Ligonier", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://ligonier.org&size=128", color: "#A78BFA" },
  { name: "Grace to You", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gty.org&size=128", color: "#34D399" },
  { name: "Bible Project", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://bibleproject.com&size=128", color: "#38BDF8" },
  { name: "Apologia Studios", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://apologiastudios.com&size=128", color: "#818CF8" },
  { name: "Gospel in Life", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://gospelinlife.com&size=128", color: "#FBBF24" },
  { name: "Monergism", logoUrl: "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://monergism.com&size=128", color: "#F472B6" },
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
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-surface border border-border group-hover:shadow-glow-pink group-hover:border-primary/50 transition-all p-1"
              >
                <img src={m.logoUrl} alt={m.name} className="w-full h-full object-contain rounded-full" onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=242424&color=fff`;
                }} />
              </div>
              <span className="text-text-secondary text-xs text-center max-w-[80px] font-medium leading-tight">{m.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing removed for 100% free model ─────────────────────────────────────
import { Footer } from "@/components/layout/Footer";

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
