import { Calendar } from "lucide-react"
import { UpcomingEpisodeCard } from "./UpcomingEpisodeCard"
import { EmptyDashboard } from "./EmptyDashboard"
import type { UpcomingEpisodesGrouped } from "../types/dashboard"

interface UpcomingEpisodesSectionProps {
  grouped: UpcomingEpisodesGrouped
}

export function UpcomingEpisodesSection({ grouped }: UpcomingEpisodesSectionProps) {
  const hasToday = grouped.today.length > 0
  const hasTomorrow = grouped.tomorrow.length > 0
  const hasWeek = grouped.thisWeek.length > 0

  if (!hasToday && !hasTomorrow && !hasWeek) {
    return <EmptyDashboard type="upcoming" />
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Calendar className="h-5 w-5 text-accent" />
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Upcoming Releases</h2>
      </div>

      <div className="space-y-6">
        {/* Today Group */}
        {hasToday && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-primary uppercase tracking-wider pl-1">Today</h3>
            <div className="grid grid-cols-1 gap-3">
              {grouped.today.map((episode) => (
                <UpcomingEpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </div>
        )}

        {/* Tomorrow Group */}
        {hasTomorrow && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-accent uppercase tracking-wider pl-1">
              Tomorrow
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {grouped.tomorrow.map((episode) => (
                <UpcomingEpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </div>
        )}

        {/* This Week Group */}
        {hasWeek && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider pl-1">
              This Week
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {grouped.thisWeek.map((episode) => (
                <UpcomingEpisodeCard key={episode.id} episode={episode} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default UpcomingEpisodesSection
