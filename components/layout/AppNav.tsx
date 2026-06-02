"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, Bookmark, Library, User, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GospelLensLogo } from "@/components/ui/Logo";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";

const NAV_LINKS = [
  { href: "/home",      label: "Home",      Icon: Home },
  { href: "/search",    label: "Search",    Icon: Search },
  { href: "/discover",  label: "Resources", Icon: Library },
  { href: "/bookmarks", label: "Bookmarks", Icon: Bookmark },
];

export function AppNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      {/* ── Desktop / Tablet Header ─────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-4 md:px-10 bg-background border-b border-border"
        style={{
          height: 64,
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex-shrink-0 mr-8">
          <GospelLensLogo size={34} />
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-elevated"
                }`}
              >
                <link.Icon size={16} />
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Avatar */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            <User className="w-4 h-4 text-primary" />
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-elevated transition-colors ml-1"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen
              ? <X className="w-5 h-5 text-text-primary" />
              : <Menu className="w-5 h-5 text-text-primary" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Dropdown Menu ────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed top-16 left-0 right-0 z-40 bg-surface border-b border-border shadow-xl md:hidden"
            >
              <div className="flex flex-col py-2 px-3">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 py-3.5 px-4 rounded-xl text-base font-medium transition-colors ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-text-primary hover:bg-elevated"
                      }`}
                    >
                      <link.Icon size={20} />
                      {link.label}
                    </Link>
                  );
                })}
                {/* Divider */}
                <div className="border-t border-border my-2 mx-2" />
                <Link
                  href="/profile"
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-base font-medium text-text-primary hover:bg-elevated transition-colors"
                >
                  <User size={20} />
                  My Profile
                </Link>
                <Link
                  href="/bookmarks"
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-base font-medium text-text-primary hover:bg-elevated transition-colors"
                >
                  <Bookmark size={20} />
                  My Bookmarks
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Tab Bar ───────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around bg-surface border-t border-border"
        style={{ height: 60, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-primary" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <link.Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
