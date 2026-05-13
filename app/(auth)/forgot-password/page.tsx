"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-surface border border-border p-8 rounded-lg shadow-card text-text-primary">
      <Link
        href="/signin"
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Sign In
      </Link>

      <div className="flex flex-col items-center mb-8 text-center">
        <Globe className="w-8 h-8 text-primary mb-2" />
        <h1 className="text-2xl font-poppins font-bold text-white mb-1">
          Reset password
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your email to receive a reset link
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center p-6 bg-elevated rounded-lg text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success mb-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">Check your email</h3>
          <p className="text-sm text-text-secondary">
            We sent a password reset link to <br />
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-md">
              {error}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
