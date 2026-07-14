import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { StatisticsService } from "@/features/statistics/services/statistics.service"
import { Film } from "lucide-react"

export function FavoriteGenres() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const { data: genres = [], isLoading } = useQuery({
    queryKey: ["profile", "favorite-genres", userId],
    queryFn: async () => {
      const items = await StatisticsService.getLibraryItems(userId)
      const counts: Record<string, number> = {}
      items.forEach((item) => {
        if (item.genres) {
          item.genres.forEach((g) => {
            counts[g] = (counts[g] || 0) + 1
          })
        }
      })
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    },
    enabled: !!userId,
  })

  if (isLoading) {
    return (
      <div className="border border-border bg-surface/30 rounded-card p-4 space-y-3 font-sans shadow-sm animate-pulse">
        <div className="h-3 w-28 bg-skeleton rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-6 bg-skeleton/50 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (genres.length === 0) return null

  // Calculate highest count to scale the progress widths correctly
  const maxCount = Math.max(...genres.map((g) => g.count))

  return (
    <div className="border border-border bg-surface/30 rounded-card p-4 space-y-3 font-sans shadow-sm">
      <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
        <Film className="h-3.5 w-3.5 text-primary" />
        Favorite Genres
      </h4>
      <div className="space-y-2.5">
        {genres.map((g) => {
          const widthPercent = maxCount > 0 ? Math.round((g.count / maxCount) * 100) : 0
          return (
            <div key={g.name} className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span>{g.name}</span>
                <span className="text-muted-foreground">{g.count} titles</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950/45 rounded-full overflow-hidden border border-border/10">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default FavoriteGenres
