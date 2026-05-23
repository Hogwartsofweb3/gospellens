import Link from "next/link";
import { GospelLensLogo } from "@/components/ui/Logo";

export const metadata = {
  title: "Cookie Policy — Gospel Lens",
  description: "How Gospel Lens uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm mb-12">
          ← Back to Gospel Lens
        </Link>

        <div className="mb-10">
          <GospelLensLogo size={36} />
        </div>

        <h1 className="font-poppins font-bold text-4xl text-white mb-4">Cookie Policy</h1>
        <p className="text-text-secondary text-sm mb-12">Last updated: May 2026</p>

        <div className="prose prose-invert max-w-none space-y-10 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-white font-poppins font-semibold text-xl mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you
              visit a website. They are widely used to make websites work more efficiently, as well as to provide
              information to the owners of the site.
            </p>
          </section>

          <section>
            <h2 className="text-white font-poppins font-semibold text-xl mb-4">2. How We Use Cookies</h2>
            <p>Gospel Lens uses cookies and similar tracking technologies for the following purposes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong className="text-white">Essential Cookies:</strong> These are required for the platform to function.
                They include session tokens used to keep you signed in securely via Supabase Authentication.
              </li>
              <li>
                <strong className="text-white">Preference Cookies:</strong> These remember your settings such as theme
                preference (dark/light mode), audio playback speed, and content filters.
              </li>
              <li>
                <strong className="text-white">Analytics Cookies:</strong> We may use anonymous analytics to understand
                how users navigate Gospel Lens so we can improve the experience. No personally identifiable
                information is collected or sold.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-poppins font-semibold text-xl mb-4">3. Third-Party Cookies</h2>
            <p>
              Some content on Gospel Lens is served from third-party platforms (such as YouTube embedded players).
              These third parties may set their own cookies on your device when you interact with their content.
              We do not control these cookies. Please refer to the respective privacy policies of those platforms:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline">Google / YouTube Privacy Policy</a>
              </li>
              <li>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-primary hover:underline">Supabase Privacy Policy</a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-poppins font-semibold text-xl mb-4">4. Managing Cookies</h2>
            <p>
              You can control and manage cookies in your browser settings. Please note that removing or blocking
              certain cookies may affect the functionality of Gospel Lens, including your ability to stay signed in.
            </p>
            <p className="mt-3">
              Most modern browsers allow you to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>View what cookies are stored on your device</li>
              <li>Delete cookies individually or all at once</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies (not recommended for Gospel Lens)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-poppins font-semibold text-xl mb-4">5. Your Consent</h2>
            <p>
              By using Gospel Lens, you consent to our use of cookies as described in this policy. We do not use
              cookies for advertising or tracking across websites. Your privacy matters to us.
            </p>
          </section>

          <section>
            <h2 className="text-white font-poppins font-semibold text-xl mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{" "}
              <a href="mailto:hello@gospellens.app" className="text-primary hover:underline">hello@gospellens.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
