"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="w-full max-w-md bg-surface border border-border p-8 rounded-lg shadow-card text-text-primary">
      <div className="flex flex-col items-center mb-8 text-center">
        <Globe className="w-8 h-8 text-primary mb-2" />
        <h1 className="text-2xl font-poppins font-bold text-white mb-1">
          Update password
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-md">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">
            New Password
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
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">
            Confirm New Password
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
