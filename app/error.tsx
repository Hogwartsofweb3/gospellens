"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Gospel Lens Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-20 h-20 rounded-full bg-surface border border-elevated flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-text-muted" />
      </div>
      <div className="text-center">
        <h1 className="text-white font-poppins font-bold text-2xl mb-2">Something went wrong</h1>
        <p className="text-text-secondary text-sm max-w-xs">
          An unexpected error occurred. Please try again or go back to the home page.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Try again
        </button>
        <Link
          href="/home"
          className="px-6 py-2.5 rounded-full border border-elevated text-white text-sm font-medium hover:bg-surface transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
