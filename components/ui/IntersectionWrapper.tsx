"use client";

import { useRef, useEffect, useState } from "react";

interface IntersectionWrapperProps {
  children: React.ReactNode;
  /** Height to reserve before content enters viewport — prevents layout shift */
  placeholderHeight?: number;
  /** Margin before the element enters viewport to start loading */
  rootMargin?: string;
  className?: string;
}

/**
 * Only renders children when they are near the viewport.
 * Uses IntersectionObserver for zero-dependency virtual rendering.
 * Once rendered, stays rendered (no unmount on scroll out).
 */
export function IntersectionWrapper({
  children,
  placeholderHeight,
  rootMargin = "200px",
  className,
}: IntersectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // once visible, always visible
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        children
      ) : (
        <div
          style={placeholderHeight ? { height: placeholderHeight } : undefined}
          className="w-full"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
