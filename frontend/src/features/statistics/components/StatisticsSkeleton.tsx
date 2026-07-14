export function StatisticsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 animate-pulse font-sans">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-64 bg-skeleton rounded" />
        <div className="h-4 w-96 bg-skeleton rounded" />
      </div>

      {/* Grid of overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-24 w-full bg-skeleton/40 border border-border/40 rounded-card"
          />
        ))}
      </div>

      {/* 2-Column charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 w-full bg-skeleton/40 border border-border/40 rounded-card" />
        <div className="h-80 w-full bg-skeleton/40 border border-border/40 rounded-card" />
      </div>

      <div className="h-40 w-full bg-skeleton/40 border border-border/40 rounded-card" />
      <div className="h-48 w-full bg-skeleton/40 border border-border/40 rounded-card" />
    </div>
  )
}
export default StatisticsSkeleton
