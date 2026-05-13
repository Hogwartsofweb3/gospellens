"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  ctaLabel,
  ctaHref,
  onCta,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center border border-elevated">
        <Icon className="w-10 h-10 text-text-muted" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-white font-poppins font-bold text-xl mb-2">{title}</p>
        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">{message}</p>
      </div>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button
          onClick={onCta}
          className="mt-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
