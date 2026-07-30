export function RecommendationSkeleton() {
  return (
    <div className="space-y-8 animate-pulse bg-background font-sans max-w-5xl mx-auto py-8">
      {/* Header stub */}
      <div className="space-y-2 border-b border-border/40 pb-5">
        <div className="h-8 w-60 bg-skeleton rounded" />
        <div className="h-4 w-96 bg-skeleton/70 rounded" />
      </div>

      {/* Rows of carousels stub */}
      {Array.from({ length: 3 }).map((_, rIdx) => (
        <div key={rIdx} className="space-y-3">
          <div className="h-4 w-40 bg-skeleton rounded" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-72 w-44 bg-skeleton/30 border border-border/20 rounded-card shrink-0"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
export default RecommendationSkeleton
