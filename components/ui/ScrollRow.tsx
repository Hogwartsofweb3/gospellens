"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollRowProps {
  title: string;
  seeAllHref?: string;
  children: React.ReactNode;
}

export function ScrollRow({ title, seeAllHref, children }: ScrollRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  // Drag to scroll
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    startX = e.pageX - (rowRef.current?.offsetLeft || 0);
    scrollLeft = rowRef.current?.scrollLeft || 0;
  };
  const onMouseLeaveRow = () => { isDown = false; };
  const onMouseUp = () => { isDown = false; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - (rowRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    rowRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-6 md:px-10">
        <h2 className="text-white font-semibold text-lg">{title}</h2>
        {seeAllHref && (
          <a href={seeAllHref} className="text-primary text-sm hover:underline transition-colors">
            See All →
          </a>
        )}
      </div>

      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 w-10 h-16 flex items-center justify-center bg-black/70 hover:bg-black/90 rounded-r-md transition-all duration-200 ${
          isHovered && canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ marginTop: 16 }}
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 w-10 h-16 flex items-center justify-center bg-black/70 hover:bg-black/90 rounded-l-md transition-all duration-200 ${
          isHovered && canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ marginTop: 16 }}
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Scroll Container */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-6 md:px-10 scroll-smooth-x cursor-grab active:cursor-grabbing"
        onScroll={checkScroll}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeaveRow}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {children}
      </div>
    </section>
  );
}
