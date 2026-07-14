import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { Trophy, Award } from "lucide-react"
import { StatisticsService } from "@/features/statistics/services/statistics.service"

export function AchievementShowcase() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["profile", "achievements", userId],
    queryFn: async () => {
      const [lib, watch, ep] = await Promise.all([
        StatisticsService.getLibraryItems(userId),
        StatisticsService.getWatchHistory(userId),
        StatisticsService.getEpisodeProgress(userId),
      ])
      return StatisticsService.calculateAchievements(lib, watch, ep).filter((a) => a.unlocked)
    },
    enabled: !!userId,
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-3 font-sans animate-pulse">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
          <Trophy className="h-4 w-4 text-amber-400" />
          Achievement Showcase
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-skeleton rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (achievements.length === 0) return null

  return (
    <div className="space-y-3 font-sans">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
        <Trophy className="h-4 w-4 text-amber-400" />
        Achievement Showcase
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className="flex gap-2.5 items-center p-3 border border-border/50 bg-surface/30 rounded-card"
            title={ach.description}
          >
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black truncate leading-tight">{ach.title}</p>
              <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                Unlocked
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default AchievementShowcase
