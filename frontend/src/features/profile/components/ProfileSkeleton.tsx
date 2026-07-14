export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-pulse bg-background">
      {/* Header and Banner stub */}
      <div className="relative rounded-card overflow-hidden border border-border/20 bg-skeleton/30 h-44 md:h-60" />

      {/* Info Section stub */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start md:pl-6 -mt-16 relative z-10">
        <div className="h-28 w-28 rounded-full border-4 border-background bg-skeleton shrink-0" />
        <div className="space-y-2 mt-4 md:mt-16 text-center md:text-left flex-grow">
          <div className="h-6 w-48 bg-skeleton rounded mx-auto md:mx-0" />
          <div className="h-4 w-64 bg-skeleton/75 rounded mx-auto md:mx-0" />
        </div>
      </div>

      {/* Overview Cards stub */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-20 bg-skeleton/40 border border-border/20 rounded-card" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column sidebar stub */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-skeleton/40 border border-border/20 rounded-card" />
          <div className="h-32 bg-skeleton/40 border border-border/20 rounded-card" />
        </div>

        {/* Right column sidebar stub */}
        <div className="space-y-6">
          <div className="h-60 bg-skeleton/40 border border-border/20 rounded-card" />
        </div>
      </div>
    </div>
  )
}
export default ProfileSkeleton
