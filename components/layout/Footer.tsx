import Link from "next/link";
import { GospelLensLogo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="pt-20 pb-[160px] md:pb-10 px-6 md:px-12 bg-surface border-t border-border mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <GospelLensLogo size={36} />
            <p className="text-primary text-sm mt-3.5 italic font-semibold tracking-wide">In God's Light, We See Light</p>
            <p className="text-text-secondary text-sm mt-3.5 max-w-sm leading-relaxed">
              Every trusted Christian voice. One place. We curate the best sermons, articles, and podcasts from faithful ministries around the globe.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <p className="text-text-primary text-sm font-semibold mb-5 uppercase tracking-wider">Content</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/home" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Sermons & Videos</Link></li>
              <li><Link href="/home" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Podcasts & Audio</Link></li>
              <li><Link href="/home" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Articles & Text</Link></li>
              <li><Link href="/search" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Browse by Topic</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-text-primary text-sm font-semibold mb-5 uppercase tracking-wider">Product</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/signin" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Sign In</Link></li>
              <li><Link href="/signup" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Create Account</Link></li>
              <li><a href="mailto:info.gospellens@gmail.com" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Contact Us</a></li>
              <li><a href="mailto:info.gospellens@gmail.com" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Suggest a Ministry</a></li>
            </ul>
          </div>

          <div>
            <p className="text-text-primary text-sm font-semibold mb-5 uppercase tracking-wider">Legal</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-sm">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-text-muted">© {new Date().getFullYear()} Gospel Lens.</span>
            <span className="text-text-muted hidden md:inline">·</span>
            <span className="text-text-muted">All rights reserved.</span>
            <span className="text-text-muted hidden md:inline">·</span>
            <span className="text-text-muted">Built with ♥ for the body of Christ</span>
          </div>

          <div className="flex gap-4">
            {/* X / Twitter */}
            <a href="https://x.com/gospel_lenss" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/50 transition-all group" aria-label="X (Twitter)">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* Substack */}
            <a href="https://gospellens.substack.com?utm_source=navbar&utm_medium=web" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/50 transition-all group" aria-label="Substack">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>
            </a>
            {/* Email */}
            <a href="mailto:info.gospellens@gmail.com"
              className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/50 transition-all group" aria-label="Email">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
