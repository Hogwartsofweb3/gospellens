"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Check, Share2 } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentType?: string;
}

interface ShareOption {
  name: string;
  bg: string;
  getUrl?: (url: string, title: string) => string;
  onClick?: (url: string, setCopied: (v: boolean) => void) => void;
  icon: React.ReactNode;
}

const SOCIAL_OPTIONS: ShareOption[] = [
  {
    name: "WhatsApp",
    bg: "bg-[#25D366]",
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + " — " + url)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    bg: "bg-[#2AABEE]",
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    bg: "bg-black border border-white/20",
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    bg: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    onClick: (url, setCopied) => {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    },
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: "Threads",
    bg: "bg-[#101010] border border-white/10",
    getUrl: (url, title) =>
      `https://threads.net/intent/post?text=${encodeURIComponent(title + " — " + url)}`,
    icon: (
      <span className="text-sm font-bold text-white">@</span>
    ),
  },
  {
    name: "Gmail",
    bg: "bg-[#ea4335]",
    getUrl: (url, title) =>
      `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    bg: "bg-[#1877F2]",
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    bg: "bg-[#0077b5]",
    getUrl: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    bg: "bg-[#BD081C]",
    getUrl: (url, title) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.907 2.17-2.907 1.025 0 1.522.771 1.522 1.697 0 1.03-.656 2.571-.994 4.002-.283 1.194.599 2.169 1.775 2.169 2.13 0 3.769-2.247 3.769-5.493 0-2.872-2.062-4.881-5.012-4.881-3.414 0-5.419 2.561-5.419 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.164 0 7.397 2.967 7.397 6.93 0 4.136-2.607 7.464-6.22 7.464-1.215 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.367 11.988-11.987C24 5.368 18.633 0 12.017 0z" />
      </svg>
    ),
  },
  {
    name: "Reddit",
    bg: "bg-[#FF4500]",
    getUrl: (url, title) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.509 1.183-.84 2.815-1.388 4.616-1.467l.889-4.156a.222.222 0 0 1 .264-.17l3.056.643a1.244 1.244 0 0 1 1.196-.857zm-8.625 9.176c-.63 0-1.144.514-1.144 1.144s.514 1.144 1.144 1.144 .514-.514 1.144-1.144-.514-1.144-1.144-1.144zm7.25 0c-.63 0-1.144.514-1.144 1.144s.514 1.144 1.144 1.144 1.144-.514 1.144-1.144-.514-1.144-1.144-1.144zm-3.624 3.712c-1.524 0-2.525-.366-2.553-.377a.24.24 0 0 1-.137-.309.24.24 0 0 1 .309-.137c.05.016.907.34 2.381.34 1.474 0 2.33-.324 2.381-.34a.24.24 0 0 1 .309.137.24.24 0 0 1-.137.309c-.028.01-1.029.377-2.553.377z" />
      </svg>
    ),
  },
  {
    name: "Skype",
    bg: "bg-[#00AFF0]",
    getUrl: (url, title) =>
      `https://web.skype.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.275 14.86c0-.284-.025-.572-.072-.857.368-.69.578-1.464.578-2.28 0-2.735-2.22-4.954-4.956-4.954-.816 0-1.587.21-2.277.58-.285-.05-.573-.075-.857-.075-4.22 0-7.643 3.42-7.643 7.638 0 .285.025.573.072.858-.368.687-.577 1.463-.577 2.276 0 2.736 2.22 4.955 4.957 4.955.816 0 1.588-.21 2.278-.58.284.05.572.076.857.076 4.22 0 7.643-3.42 7.643-7.637zm-12.923-2.18c0-1.282.887-2.072 2.327-2.072.84 0 1.527.288 1.947.81.18.225.132.553-.105.717-.23.158-.553.11-.715-.11-.22-.272-.61-.417-1.127-.417-.692 0-1.345.33-1.345 1.1 0 .666.398 1.01 1.705 1.346 1.758.452 2.656 1.096 2.656 2.457 0 1.533-1.258 2.296-2.744 2.296-.99 0-1.782-.3-2.273-.865-.185-.213-.146-.543.087-.714.224-.165.55-.125.727.08.318.368.835.6 1.46.6.93 0 1.756-.37 1.756-1.365 0-.766-.544-1.077-1.76-1.378-1.597-.393-2.643-.997-2.643-2.484z" />
      </svg>
    ),
  },
  {
    name: "Viber",
    bg: "bg-[#7360F2]",
    getUrl: (url, title) =>
      `https://3g.viber.com/share?text=${encodeURIComponent(title + " — " + url)}`,
    icon: (
      <span className="text-xs font-extrabold text-white">V</span>
    ),
  },
  {
    name: "Tumblr",
    bg: "bg-[#35465C]",
    getUrl: (url, title) =>
      `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.536 21.688c-.015.066-.135.099-.197.099-.482 0-.715-.315-.715-.847v-7.234h2.51v-2.31h-2.51V6.924a.1.1 0 0 0-.1-.1h-2.607a.1.1 0 0 0-.1.1v4.475h-1.63c-.066 0-.1.033-.1.1v2.21c0 .066.033.1.1.1h1.63v7.914c0 2.456 1.83 3.287 3.818 3.287 1.545 0 2.624-.398 2.624-.398a.1.1 0 0 0 .05-.083v-2.634a.1.1 0 0 0-.083-.1z" />
      </svg>
    ),
  },
  {
    name: "Pocket",
    bg: "bg-[#EE4056]",
    getUrl: (url, title) =>
      `https://getpocket.com/save?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.627 0-12 5.373-12 12v3.743c0 4.549 3.708 8.257 8.257 8.257h7.486c4.549 0 8.257-3.708 8.257-8.257v-3.743c0-6.627-5.373-12-12-12zm6.273 10.428l-5.312 5.258c-.524.524-1.378.524-1.902 0l-5.312-5.258c-.544-.544-.544-1.42 0-1.964.534-.534 1.411-.534 1.945 0l4.385 4.341 4.385-4.341c.534-.534 1.411-.534 1.945 0 .544.544.544 1.42 0 1.964z" />
      </svg>
    ),
  },
  {
    name: "Email",
    bg: "bg-[#444444]",
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function ShareModal({ isOpen, onClose, title, contentType = "content" }: ShareModalProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [customMsg, setCustomMsg] = useState<string | null>(null);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url: currentUrl });
        onClose();
      } catch {
        // User cancelled, do nothing
      }
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setLinkCopied(true);
    setCustomMsg(null);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleCustomClick = (opt: ShareOption) => {
    if (opt.onClick) {
      opt.onClick(currentUrl, (copied) => {
        setLinkCopied(copied);
        setCustomMsg(`${opt.name} Link Copied!`);
        setTimeout(() => {
          setLinkCopied(false);
          setCustomMsg(null);
        }, 2500);
      });
    }
  };

  const supportsNativeShare =
    typeof navigator !== "undefined" && "share" in navigator;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-surface border border-elevated rounded-2xl p-6 w-full max-w-sm shadow-xl"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-poppins font-semibold text-base">
                Share {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-elevated text-text-secondary hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-text-secondary text-sm mb-4 line-clamp-2 leading-snug">{title}</p>

            {/* Native share button (shows on mobile/supported browsers) */}
            {supportsNativeShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/40 text-primary font-medium text-sm mb-4 hover:bg-primary/20 transition-colors"
              >
                <Share2 size={16} /> Share via App...
              </button>
            )}

            {/* Social share grid */}
            <div className="grid grid-cols-4 gap-2.5 mb-5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {SOCIAL_OPTIONS.map((opt) => {
                if (opt.getUrl) {
                  return (
                    <a
                      key={opt.name}
                      href={opt.getUrl(currentUrl, title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={opt.name}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl ${opt.bg} hover:opacity-85 transition-opacity cursor-pointer aspect-square`}
                    >
                      {opt.icon}
                      <span className="text-white text-[9px] font-medium leading-tight text-center truncate w-full">
                        {opt.name.split(" ")[0]}
                      </span>
                    </a>
                  );
                } else {
                  return (
                    <button
                      key={opt.name}
                      onClick={() => handleCustomClick(opt)}
                      title={opt.name}
                      className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl ${opt.bg} hover:opacity-85 transition-opacity cursor-pointer aspect-square w-full`}
                    >
                      {opt.icon}
                      <span className="text-white text-[9px] font-medium leading-tight text-center truncate w-full">
                        {opt.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                }
              })}
            </div>

            {/* Copy link */}
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-elevated hover:bg-primary/20 border border-elevated hover:border-primary transition-all text-white text-sm font-medium"
            >
              {linkCopied ? (
                <>
                  <Check size={16} className="text-primary" /> {customMsg || "Link Copied!"}
                </>
              ) : (
                <>
                  <Link2 size={16} /> Copy Link
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
