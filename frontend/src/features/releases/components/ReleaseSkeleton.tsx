export function ReleaseSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-pulse bg-background">
      {/* Header stub */}
      <div className="space-y-2 border-b border-border/40 pb-5">
        <div className="h-8 w-48 bg-skeleton rounded" />
        <div className="h-4 w-72 bg-skeleton/70 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column sidebar skeleton */}
        <div className="space-y-6">
          <div className="h-64 bg-skeleton/40 border border-border/20 rounded-card" />
          <div className="h-64 bg-skeleton/40 border border-border/20 rounded-card" />
        </div>

        {/* Right 3 columns timeline skeleton */}
        <div className="lg:col-span-3 space-y-8">
          {Array.from({ length: 3 }).map((_, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <div className="h-5 w-24 bg-skeleton rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className="h-24 bg-skeleton/40 border border-border/20 rounded-card flex gap-4 p-4"
                  >
                    <div className="h-full w-12 bg-skeleton/50 rounded-button shrink-0" />
                    <div className="flex-grow space-y-2 py-1">
                      <div className="h-3 w-1/3 bg-skeleton/60 rounded" />
                      <div className="h-4 w-2/3 bg-skeleton rounded" />
                      <div className="h-3 w-1/2 bg-skeleton/45 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default ReleaseSkeleton
