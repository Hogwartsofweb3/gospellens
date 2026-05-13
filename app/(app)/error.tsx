"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Gospel Lens App Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-16 h-16 rounded-full bg-surface border border-elevated flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-text-muted" />
      </div>
      <div className="text-center">
        <p className="text-white font-poppins font-semibold text-xl mb-2">Something went wrong</p>
        <p className="text-text-secondary text-sm max-w-xs">
          This page ran into an error. Please try again.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="px-5 py-2 rounded-full border border-elevated text-white text-sm font-medium hover:bg-surface transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
