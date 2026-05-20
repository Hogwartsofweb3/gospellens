import Link from "next/link";
import { GospelLensLogo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="pt-20 pb-10 px-6 md:px-12 bg-[#121212] border-t border-border mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <GospelLensLogo size={36} />
            <p className="text-text-secondary text-sm mt-5 max-w-sm leading-relaxed">
              Every trusted Christian voice. One place. We curate the best sermons, articles, and podcasts from faithful ministries around the globe.
            </p>
            <p className="text-primary text-sm mt-3 italic font-medium">In God's Light, We See Light</p>
          </div>

          {/* Links Columns */}
          <div>
            <p className="text-white text-sm font-semibold mb-5 uppercase tracking-wider">Content</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/home" className="text-text-secondary hover:text-white transition-colors text-sm">Sermons & Videos</Link></li>
              <li><Link href="/home" className="text-text-secondary hover:text-white transition-colors text-sm">Podcasts & Audio</Link></li>
              <li><Link href="/home" className="text-text-secondary hover:text-white transition-colors text-sm">Articles & Text</Link></li>
              <li><Link href="/search" className="text-text-secondary hover:text-white transition-colors text-sm">Browse by Topic</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-white text-sm font-semibold mb-5 uppercase tracking-wider">Product</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/signin" className="text-text-secondary hover:text-white transition-colors text-sm">Sign In</Link></li>
              <li><Link href="/signup" className="text-text-secondary hover:text-white transition-colors text-sm">Create Account</Link></li>
              <li><a href="mailto:hello@gospellens.app" className="text-text-secondary hover:text-white transition-colors text-sm">Contact Us</a></li>
              <li><a href="mailto:hello@gospellens.app" className="text-text-secondary hover:text-white transition-colors text-sm">Suggest a Ministry</a></li>
            </ul>
          </div>

          <div>
            <p className="text-white text-sm font-semibold mb-5 uppercase tracking-wider">Legal</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><span className="text-text-muted text-sm cursor-not-allowed">Cookie Policy</span></li>
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
              className="w-10 h-10 rounded-full bg-elevated border border-border flex items-center justify-center text-text-secondary hover:text-white hover:border-primary/50 transition-all group" aria-label="X (Twitter)">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
