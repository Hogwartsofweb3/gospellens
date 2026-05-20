// Skeleton loading states for all card types

export function LandscapeCardSkeleton({ fluid = false }: { fluid?: boolean } = {}) {
  return (
    <div
      className={`flex-shrink-0 rounded-md overflow-hidden skeleton ${fluid ? 'w-full aspect-video' : ''}`}
      style={fluid ? undefined : { width: 280, height: 160 }}
    />
  );
}

export function SquareCardSkeleton() {
  return (
    <div className="flex-shrink-0 flex flex-col gap-2" style={{ width: 160 }}>
      <div className="rounded-md skeleton" style={{ width: 160, height: 160 }} />
      <div className="skeleton h-3 rounded w-3/4" />
      <div className="skeleton h-2.5 rounded w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full skeleton" style={{ height: 520 }} />
  );
}

export function TopicTileSkeleton() {
  return (
    <div className="rounded-lg skeleton" style={{ height: 120 }} />
  );
}

export function MinistryCardSkeleton() {
  return (
    <div className="flex-shrink-0 rounded-lg skeleton" style={{ width: 240, height: 280 }} />
  );
}
