import { User } from "lucide-react"
import { useProfileFavorites } from "../hooks/useProfile"
import { tmdbClient } from "@/features/discover"

export function FavoriteDirectors() {
  const { data, isLoading } = useProfileFavorites()
  const directors = data?.topDirectors || []

  if (isLoading) {
    return (
      <div className="border border-border bg-surface/30 rounded-card p-4 space-y-3 font-sans shadow-sm animate-pulse">
        <div className="h-3 w-28 bg-skeleton rounded" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 bg-skeleton/50 rounded-full shrink-0" />
              <div className="h-2 w-12 bg-skeleton/40 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (directors.length === 0) return null

  return (
    <div className="border border-border bg-surface/30 rounded-card p-4 space-y-3 font-sans shadow-sm">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
        <User className="h-3.5 w-3.5 text-primary" />
        Favorite Directors
      </h4>
      <div className="grid grid-cols-5 gap-3">
        {directors.map((dir) => {
          const profileUrl = dir.profilePath ? tmdbClient.getImageUrl(dir.profilePath) : null
          return (
            <div
              key={dir.name}
              className="flex flex-col items-center text-center space-y-1 min-w-0"
            >
              {/* Profile image wrapper */}
              <div className="h-10 w-10 rounded-full border border-border/40 overflow-hidden bg-zinc-900 shrink-0 flex items-center justify-center select-none shadow">
                {profileUrl ? (
                  <img src={profileUrl} alt={dir.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0 w-full">
                <p className="text-[9px] font-extrabold truncate w-full leading-normal">
                  {dir.name}
                </p>
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-wide">
                  {dir.count} {dir.count === 1 ? "time" : "times"}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default FavoriteDirectors
