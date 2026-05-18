"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, User, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GospelLensLogo } from "@/components/ui/Logo";
import { NotificationsDropdown } from "@/components/ui/NotificationsDropdown";

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/bookmarks", label: "Bookmarks" },
];

export function AppNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center px-6 md:px-10"
        style={{
          height: 64,
          backgroundColor: "#0F0F0F",
          borderBottom: "1px solid #2A2A2A",
        }}
      >
        {/* Logo */}
        <Link href="/home" className="flex-shrink-0">
          <GospelLensLogo size={34} />
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-8 ml-12">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium transition-colors group"
                style={{ color: isActive ? "#E040A0" : "#FFFFFF" }}
              >
                {link.label}
                {/* Animated underline */}
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Bookmarks — desktop shortcut */}
          <Link
            href="/bookmarks"
            className="hidden md:flex p-2 rounded-full text-text-secondary hover:text-white hover:bg-elevated transition-colors"
            aria-label="Bookmarks"
          >
            <Bookmark className="w-5 h-5" />
          </Link>

          {/* Avatar */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            <User className="w-4 h-4 text-primary" />
          </Link>

          {/* Hamburger — mobile */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-elevated transition-colors"
            onClick={() => setMobileOpen((p) => !p)}
          >
            {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-30 bg-surface border-b border-border flex flex-col py-4 px-6 gap-1 md:hidden"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 text-base font-medium rounded-md px-3 transition-colors ${
                    isActive ? "text-primary bg-primary/10" : "text-white hover:bg-elevated"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
