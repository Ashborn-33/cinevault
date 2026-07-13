import { useNavigate } from "react-router-dom"
import { Calendar, Tv } from "lucide-react"
import { tmdbClient } from "@/features/discover"
import type { UpcomingEpisodeEntry } from "../types/dashboard"

interface UpcomingEpisodeCardProps {
  episode: UpcomingEpisodeEntry
}

function getRelativeEpisodeDateLabel(airDateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(airDateStr + "T00:00:00")
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays > 1 && diffDays < 7) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const dayName = daysOfWeek[target.getDay()]
    return `This ${dayName}`
  }
  return `In ${diffDays} Days`
}

export function UpcomingEpisodeCard({ episode }: UpcomingEpisodeCardProps) {
  const navigate = useNavigate()
  const posterUrl = episode.posterPath ? tmdbClient.getImageUrl(episode.posterPath) : undefined
  const relativeDate = getRelativeEpisodeDateLabel(episode.airDate)

  const formattedAirDate = new Date(episode.airDate + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const episodeCode = `S${String(episode.seasonNumber).padStart(2, "0")}E${String(
    episode.episodeNumber
  ).padStart(2, "0")}`

  return (
    <div
      onClick={() => navigate(`/tv/${episode.showId}`)}
      className="flex gap-4 p-4 border border-border bg-surface/40 hover:bg-surface-hover/60 hover:border-border-hover rounded-card transition-all cursor-pointer shadow-sm group font-sans"
    >
      {/* Small Poster */}
      <div className="h-16 w-11 shrink-0 rounded-button overflow-hidden bg-zinc-900 border border-border/40 aspect-[2/3] flex items-center justify-center">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={episode.showName}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Tv className="h-6 w-6 text-muted-foreground/30" />
        )}
      </div>

      {/* Metadata */}
      <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5 space-y-1">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold truncate group-hover:text-primary transition-colors">
            {episode.showName}
          </h4>
          <p className="text-[10px] text-primary font-bold">
            {episodeCode} - {episode.episodeTitle}
          </p>
        </div>

        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedAirDate}
          </span>
          <span className="text-accent font-extrabold bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
            {relativeDate}
          </span>
        </div>
      </div>
    </div>
  )
}
export default UpcomingEpisodeCard
