export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 animate-pulse font-sans">
      {/* Header skeleton */}
      <div className="h-24 w-full bg-skeleton/40 border border-border/40 rounded-card" />

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Continue Watching */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 w-44 bg-skeleton rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 w-full bg-skeleton/40 border border-border/40 rounded-card"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming */}
        <div className="space-y-6">
          <div className="h-6 w-36 bg-skeleton rounded" />
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <div className="h-4 w-14 bg-skeleton rounded" />
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, eIdx) => (
                    <div
                      key={eIdx}
                      className="h-20 w-full bg-skeleton/40 border border-border/40 rounded-card"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
export default DashboardSkeleton
