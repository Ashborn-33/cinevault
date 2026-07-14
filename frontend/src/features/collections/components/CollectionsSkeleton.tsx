export function CollectionsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="border border-border/40 bg-surface/40 rounded-card overflow-hidden animate-pulse flex flex-col justify-between"
        >
          {/* Cover image placeholder */}
          <div className="aspect-[16/10] w-full bg-skeleton/40" />

          {/* Details placeholder */}
          <div className="p-4 space-y-3 flex-grow">
            <div className="space-y-1.5">
              <div className="h-4 w-2/3 bg-skeleton/50 rounded" />
              <div className="h-3 w-full bg-skeleton/30 rounded" />
              <div className="h-3 w-5/6 bg-skeleton/30 rounded" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border/20">
              <div className="h-3.5 w-12 bg-skeleton/40 rounded" />
              <div className="h-3.5 w-16 bg-skeleton/40 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
export default CollectionsSkeleton
