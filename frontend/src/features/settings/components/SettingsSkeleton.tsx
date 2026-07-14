export function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 animate-pulse bg-background font-sans">
      {/* Header stub */}
      <div className="space-y-2 border-b border-border/40 pb-5">
        <div className="h-8 w-48 bg-skeleton rounded" />
        <div className="h-4 w-72 bg-skeleton/70 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar categories stub */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-9 bg-skeleton/40 rounded-button" />
          ))}
        </div>

        {/* Content boxes stub */}
        <div className="lg:col-span-3 space-y-6">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="border border-border/20 rounded-card p-6 bg-surface/35 space-y-4"
            >
              <div className="h-5 w-32 bg-skeleton rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, cIdx) => (
                  <div key={cIdx} className="h-12 bg-skeleton/30 rounded-button" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default SettingsSkeleton
