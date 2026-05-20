"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 6) score += 25;
    if (pwd.match(/[A-Z]/)) score += 25;
    if (pwd.match(/[0-9]/)) score += 25;
    if (pwd.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="w-full max-w-md bg-surface border border-border p-8 rounded-lg shadow-card text-text-primary my-8">
      {/* Email confirmation screen */}
      {emailSent ? (
        <div className="flex flex-col items-center text-center py-6 px-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6 shadow-glow-pink"
          >
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </motion.div>
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-poppins font-bold text-white mb-3"
          >
            Check your inbox
          </motion.h2>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-text-secondary text-sm leading-relaxed mb-1">
              We've sent a verification link to
            </p>
            <p className="text-primary font-semibold text-base mb-6 px-4 py-2 bg-primary/5 rounded-lg border border-primary/10 inline-block">{email}</p>
            
            <div className="bg-surface border border-elevated p-4 rounded-xl text-left mb-8 shadow-sm">
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                <strong className="text-white">Next steps:</strong>
              </p>
              <ol className="text-sm text-text-muted space-y-2 list-decimal list-inside">
                <li>Open your email client</li>
                <li>Click the verification link</li>
                <li>Return here to sign in</li>
              </ol>
              <div className="mt-4 pt-3 border-t border-border flex items-start gap-2">
                <svg className="w-4 h-4 text-secondary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-text-muted leading-tight">
                  <strong className="text-text-secondary">Note for Admins:</strong> The visual styling of this email is controlled in your Supabase Dashboard (Authentication → Email Templates), not in the application code.
                </p>
              </div>
            </div>

            <Link
              href="/signin"
              className="w-full inline-block py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all text-center text-sm shadow-md"
            >
              Return to Sign In
            </Link>
            <p className="text-text-muted text-xs mt-5">
              Didn't receive it?{" "}
              <button onClick={() => setEmailSent(false)} className="text-secondary hover:text-white transition-colors underline underline-offset-2">
                Try a different email
              </button>
            </p>
          </motion.div>
        </div>
      ) : (
        <>
        <div className="flex flex-col items-center mb-8 text-center">
        <Globe className="w-8 h-8 text-primary mb-2" />
        <h1 className="text-2xl font-poppins font-bold text-white mb-1">
          Create your account
        </h1>
        <p className="text-sm text-text-secondary">
          Join thousands growing in faith daily
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="px-4 py-2 bg-elevated border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 bg-elevated border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-elevated border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="mt-1 flex flex-col gap-1">
              <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${
                    strength <= 25 ? 'bg-error w-1/4' :
                    strength <= 50 ? 'bg-orange-500 w-2/4' :
                    strength <= 75 ? 'bg-yellow-500 w-3/4' :
                    'bg-success w-full'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-2 bg-elevated border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || password !== confirmPassword || password.length < 6}
          className="mt-2 w-full py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-sm text-text-muted">or continue with</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleOAuthSignIn("google")}
          className="flex items-center justify-center gap-3 w-full py-2.5 bg-elevated border border-border rounded-md hover:bg-elevated/80 transition-colors text-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
        <button
          onClick={() => handleOAuthSignIn("apple")}
          className="flex items-center justify-center gap-3 w-full py-2.5 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M16.36 10.59c-.06-2.58 2.09-3.84 2.19-3.9-1.21-1.78-3.08-2.01-3.76-2.04-1.6-.16-3.13.94-3.94.94-.82 0-2.08-.91-3.41-.89-1.74.02-3.35 1.01-4.24 2.58-1.83 3.17-.47 7.84 1.3 10.42.87 1.25 1.89 2.65 3.23 2.6 1.29-.05 1.78-.83 3.35-.83 1.55 0 2.02.83 3.37.8 1.37-.02 2.25-1.28 3.11-2.54.99-1.46 1.4-2.88 1.43-2.95-.03-.02-2.73-1.04-2.63-4.19zM14.99 4.31c.71-.85 1.18-2.03 1.05-3.21-1.01.04-2.24.67-2.97 1.54-.65.77-1.22 1.98-1.07 3.13 1.13.09 2.28-.61 2.99-1.46z"
            />
          </svg>
          Apple
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="text-secondary hover:text-secondary/80 font-medium transition-colors"
        >
          Sign In
        </Link>
      </div>
        </>
      )}
    </div>
  );
}
