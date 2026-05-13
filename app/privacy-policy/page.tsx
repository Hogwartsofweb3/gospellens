import Link from "next/link";
import { GospelLensLogo } from "@/components/ui/Logo";

function LegalLayout({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple nav */}
      <header className="border-b border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <Link href="/"><GospelLensLogo size={32} /></Link>
        <Link href="/signup" className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-pill hover:bg-primary/90 transition-colors">
          Get Started
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-poppins font-bold text-white text-4xl mb-2">{title}</h1>
        <p className="text-text-secondary text-sm mb-12">Last updated: {lastUpdated}</p>
        <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed space-y-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-text-muted text-xs">© {new Date().getFullYear()} Gospel Lens · <Link href="/privacy-policy" className="hover:text-primary">Privacy</Link> · <Link href="/terms" className="hover:text-primary">Terms</Link></p>
      </footer>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="May 2025">
      <section>
        <h2 className="text-white text-xl font-semibold mb-2">1. Introduction</h2>
        <p>Gospel Lens ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, available at gospellens.com and through our mobile applications.</p>
        <p>By using Gospel Lens, you agree to the collection and use of information in accordance with this policy. This policy is compliant with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable data protection laws.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">2. Information We Collect</h2>
        <p><strong className="text-white">2.1 Information You Provide:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Account registration data: name, email address, password</li>
          <li>Profile information: preferred topics, ministry preferences</li>
          <li>Payment information: processed securely via Stripe — we do not store card details</li>
          <li>Communications: messages, support requests, feedback</li>
        </ul>
        <p className="mt-4"><strong className="text-white">2.2 Automatically Collected Information:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Usage data: pages visited, content played, search queries, bookmarks</li>
          <li>Device information: browser type, operating system, IP address</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To provide, operate, and maintain our platform</li>
          <li>To personalise your content feed based on your preferences</li>
          <li>To process transactions and manage subscriptions</li>
          <li>To send service-related notifications and updates</li>
          <li>To improve our platform and develop new features</li>
          <li>To detect and prevent fraud or abuse</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">4. Legal Basis for Processing (GDPR)</h2>
        <p>For users in the European Economic Area, we process your data under the following legal bases:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-white">Contract performance:</strong> to provide you with the service</li>
          <li><strong className="text-white">Legitimate interests:</strong> to improve our services and detect fraud</li>
          <li><strong className="text-white">Consent:</strong> for marketing communications (you may withdraw at any time)</li>
          <li><strong className="text-white">Legal obligation:</strong> to comply with applicable laws</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">5. Sharing Your Information</h2>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-white">Service providers:</strong> Supabase (database), Stripe (payments), Upstash (caching), Vercel (hosting) — each bound by data processing agreements</li>
          <li><strong className="text-white">Analytics providers:</strong> anonymised usage data only</li>
          <li><strong className="text-white">Legal authorities:</strong> when required by applicable law</li>
        </ul>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">6. Data Retention</h2>
        <p>We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us at privacy@gospellens.com. Upon deletion, personal data is removed within 30 days, except where retention is required by law.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">7. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data ("right to be forgotten")</li>
          <li>Object to or restrict processing</li>
          <li>Data portability</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
        <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:privacy@gospellens.com" className="text-primary hover:underline">privacy@gospellens.com</a>.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">8. Cookies</h2>
        <p>We use cookies to maintain authentication sessions, remember your preferences, and analyse usage. You can disable cookies in your browser settings, but this may affect functionality. Essential cookies necessary for the service to function cannot be disabled.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">9. Children's Privacy</h2>
        <p>Gospel Lens is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us at privacy@gospellens.com and we will delete it promptly.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Your continued use of Gospel Lens after such changes constitutes acceptance of the updated policy.</p>
      </section>

      <section>
        <h2 className="text-white text-xl font-semibold mb-2">11. Contact Us</h2>
        <p>For privacy-related questions or requests:</p>
        <ul className="list-none space-y-1">
          <li>Email: <a href="mailto:privacy@gospellens.com" className="text-primary hover:underline">privacy@gospellens.com</a></li>
          <li>Website: <a href="https://gospellens.com" className="text-primary hover:underline">gospellens.com</a></li>
        </ul>
      </section>
    </LegalLayout>
  );
}
