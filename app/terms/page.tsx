import Link from "next/link";
import { GospelLensLogo } from "@/components/ui/Logo";

function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/"><GospelLensLogo size={32} /></Link>
        <Link href="/signup" className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-pill hover:bg-primary/90 transition-colors">
          Get Started
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-poppins font-bold text-white text-4xl mb-2">{title}</h1>
        <p className="text-text-secondary text-sm mb-12">Last updated: {lastUpdated}</p>
        <div className="text-text-secondary leading-relaxed space-y-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-text-muted text-xs">© {new Date().getFullYear()} Gospel Lens · <Link href="/privacy-policy" className="hover:text-primary">Privacy</Link> · <Link href="/terms" className="hover:text-primary">Terms</Link></p>
      </footer>
    </div>
  );
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="May 2025">
      <section>
        <h2 className="text-white text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p>By accessing or using Gospel Lens ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">2. Description of Service</h2>
        <p>Gospel Lens is a Christian content aggregation platform that curates and delivers articles, videos, podcasts, and audio content from trusted Christian ministries. We do not create the underlying ministry content — we aggregate and present it for easier discovery and consumption by believers worldwide.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">3. User Accounts</h2>
        <p><strong className="text-white">3.1 Registration:</strong> To access certain features, you must create an account. You must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <p className="mt-3"><strong className="text-white">3.2 Account Security:</strong> You are responsible for all activities that occur under your account. Notify us immediately at info.gospellens@gmail.com of any unauthorised use of your account.</p>
        <p className="mt-3"><strong className="text-white">3.3 Age Requirement:</strong> You must be at least 13 years old to create an account. If you are under 18, you confirm you have parental consent to use the Service.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">4. Subscription and Payments</h2>
        <p><strong className="text-white">4.1 Free Tier:</strong> Gospel Lens offers a free tier with limited access to content and features.</p>
        <p className="mt-3"><strong className="text-white">4.2 Premium Subscription:</strong> Premium access is available on a monthly ($6.99/month) or annual ($59.99/year) basis. All payments are processed securely through Stripe.</p>
        <p className="mt-3"><strong className="text-white">4.3 Free Trial:</strong> New Premium subscribers receive a 7-day free trial. If you do not cancel before the trial ends, you will be charged the applicable subscription fee.</p>
        <p className="mt-3"><strong className="text-white">4.4 Cancellation and Refunds:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partially used subscription periods, except where required by applicable law.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Use the Service for any unlawful purpose</li>
          <li>Scrape, crawl, or copy content from the Service in bulk</li>
          <li>Attempt to gain unauthorised access to any part of the Service</li>
          <li>Use the Service to harass, abuse, or harm others</li>
          <li>Upload or share content that is illegal, defamatory, or infringes third-party rights</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">6. Content and Intellectual Property</h2>
        <p><strong className="text-white">6.1 Ministry Content:</strong> All Christian ministry content displayed on Gospel Lens remains the intellectual property of the respective ministries and publishers. Gospel Lens aggregates this content under fair use, RSS feed agreements, and/or YouTube API terms.</p>
        <p className="mt-3"><strong className="text-white">6.2 Gospel Lens Content:</strong> Our platform design, original content, and trademarks are owned by Gospel Lens. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
        <p className="mt-3"><strong className="text-white">6.3 User Content:</strong> By submitting any content (e.g., comments or feedback), you grant Gospel Lens a non-exclusive, royalty-free licence to use that content in connection with the Service.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">7. Third-Party Services</h2>
        <p>The Service may contain links to third-party websites or services. Gospel Lens is not responsible for the content, privacy policies, or practices of any third-party services. We encourage you to review the terms and privacy policies of any third-party services you visit.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">8. Disclaimers</h2>
        <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, express or implied. Gospel Lens does not warrant that the Service will be uninterrupted, error-free, or free of harmful components. We do not endorse, guarantee, or take responsibility for the theological accuracy of third-party ministry content.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Gospel Lens and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, profits, or goodwill.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">10. Termination</h2>
        <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, without prior notice. You may delete your account at any time via your profile settings. Upon termination, your right to use the Service ceases immediately.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">11. Governing Law</h2>
        <p>These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">12. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or a notice on the platform. Your continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">13. Contact</h2>
        <p>For questions about these Terms:</p>
        <ul className="list-none space-y-1">
          <li>Email: <a href="mailto:info.gospellens@gmail.com" className="text-primary hover:underline">info.gospellens@gmail.com</a></li>
          <li>Website: <a href="https://gospellens.com" className="text-primary hover:underline">gospellens.com</a></li>
        </ul>
      </section>
    </LegalLayout>
  );
}
