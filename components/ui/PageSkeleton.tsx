// ─── Page-level Skeleton Components ──────────────────────────────────────────
// Used as loading fallbacks for all major pages.

/** Reusable shimmer block */
function Shimmer({ className }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className ?? ""}`} aria-hidden="true" />;
}

// ─── Article Reader Skeleton ───────────────────────────────────────────────
export function ArticlePageSkeleton() {
  return (
    <div className="max-w-[760px] mx-auto px-6 pt-8 pb-32 animate-pulse" aria-label="Loading article…">
      {/* Ministry row */}
      <div className="flex items-center gap-3 mb-6">
        <Shimmer className="w-10 h-10 rounded-full" />
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-7 w-20 rounded-full ml-auto" />
      </div>
      {/* Badge */}
      <Shimmer className="h-5 w-20 rounded-full mb-4" />
      {/* Title */}
      <Shimmer className="h-10 w-full mb-2" />
      <Shimmer className="h-10 w-3/4 mb-4" />
      {/* Meta */}
      <div className="flex gap-3 mb-6">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-16" />
      </div>
      {/* Hero image */}
      <Shimmer className="w-full h-[400px] mb-8" />
      {/* Body */}
      {[...Array(6)].map((_, i) => (
        <Shimmer key={i} className={`h-4 mb-3 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

// ─── Video Player Skeleton ────────────────────────────────────────────────
export function VideoPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-32" aria-label="Loading video…">
      <Shimmer className="w-full aspect-video mb-6" />
      <Shimmer className="h-8 w-3/4 mb-3" />
      <div className="flex gap-3 mb-6">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <Shimmer className="w-10 h-10 rounded-full" />
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-8 w-24 rounded-full ml-auto" />
      </div>
      <Shimmer className="h-24 w-full" />
    </div>
  );
}

// ─── Podcast Player Skeleton ───────────────────────────────────────────────
export function PodcastPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-8" aria-label="Loading podcast…">
      <div>
        <Shimmer className="w-full aspect-square rounded-2xl mb-6" />
        <Shimmer className="h-8 w-3/4 mb-3" />
        <div className="flex gap-3 mb-4">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-3 w-24" />
        </div>
        <Shimmer className="h-14 w-full rounded-2xl" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

// ─── Ministry Profile Skeleton ─────────────────────────────────────────────
export function MinistryPageSkeleton() {
  return (
    <div aria-label="Loading ministry…">
      <Shimmer className="w-full h-64 rounded-none" />
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-end gap-4 -mt-10 mb-6">
          <Shimmer className="w-20 h-20 rounded-xl border-4 border-background" />
          <div className="flex-1">
            <Shimmer className="h-7 w-48 mb-2" />
            <Shimmer className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <Shimmer key={i} className="h-16 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Shimmer key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page Skeleton ─────────────────────────────────────────────────
export function ProfilePageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-32 grid grid-cols-1 lg:grid-cols-4 gap-6" aria-label="Loading profile…">
      <div className="lg:col-span-1 space-y-3">
        <Shimmer className="h-10 w-full rounded-xl" />
        <Shimmer className="h-10 w-full rounded-xl" />
        <Shimmer className="h-10 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-3">
        <Shimmer className="w-24 h-24 rounded-full mb-4" />
        <Shimmer className="h-6 w-48 mb-2" />
        <Shimmer className="h-4 w-64 mb-6" />
        <Shimmer className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ─── Bookmarks Page Skeleton ───────────────────────────────────────────────
export function BookmarksPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-32" aria-label="Loading bookmarks…">
      <Shimmer className="h-9 w-48 mb-2" />
      <Shimmer className="h-4 w-64 mb-6" />
      <div className="flex gap-3 mb-8">
        {[...Array(5)].map((_, i) => (
          <Shimmer key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <Shimmer key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Generic Grid Card Skeleton ────────────────────────────────────────────
export function GridCardSkeleton() {
  return <Shimmer className="h-48 w-full rounded-xl" />;
}
