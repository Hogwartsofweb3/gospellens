"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border border-elevated">
        <AlertCircle className="w-8 h-8 text-text-muted" />
      </div>
      <div>
        <p className="text-white font-poppins font-semibold text-lg mb-1">Oops!</p>
        <p className="text-text-secondary text-sm max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          Try again
        </button>
      )}
    </div>
  );
}
