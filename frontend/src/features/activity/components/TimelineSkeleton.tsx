export function TimelineSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 animate-pulse bg-background font-sans">
      {/* Header stub */}
      <div className="space-y-2 border-b border-border/40 pb-5">
        <div className="h-8 w-48 bg-skeleton rounded" />
        <div className="h-4 w-72 bg-skeleton/70 rounded" />
      </div>

      {/* Filter bar stub */}
      <div className="h-20 bg-skeleton/40 border border-border/20 rounded-card" />

      {/* Cards timeline list stub */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, gIdx) => (
          <div key={gIdx} className="space-y-4">
            <div className="h-4 w-24 bg-skeleton rounded" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, cIdx) => (
                <div
                  key={cIdx}
                  className="h-20 bg-skeleton/45 border border-border/20 rounded-card flex gap-4 p-4"
                >
                  <div className="h-full w-10 bg-skeleton/60 rounded shrink-0" />
                  <div className="flex-grow space-y-2 py-0.5">
                    <div className="h-3.5 w-1/4 bg-skeleton/50 rounded" />
                    <div className="h-4 w-1/2 bg-skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default TimelineSkeleton
