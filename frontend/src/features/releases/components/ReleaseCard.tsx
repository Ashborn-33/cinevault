import { useNavigate } from "react-router-dom"
import { Film, Tv, Calendar, Hourglass } from "lucide-react"
import { tmdbClient } from "@/features/discover"
import { format, differenceInCalendarDays, parseISO } from "date-fns"
import type { ReleaseEvent } from "../types/releases"

interface ReleaseCardProps {
  event: ReleaseEvent
}

export function ReleaseCard({ event }: ReleaseCardProps) {
  const navigate = useNavigate()
  const posterUrl = event.posterPath ? tmdbClient.getImageUrl(event.posterPath) : null

  // Date parsing
  const airDateObj = parseISO(event.airDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = differenceInCalendarDays(airDateObj, today)

  // Countdown text
  let countdownText: string
  let countdownStyle: string

  if (diffDays === 0) {
    countdownText = "Today"
    countdownStyle = "text-primary bg-primary/10 border-primary/20 font-black animate-pulse"
  } else if (diffDays === 1) {
    countdownText = "Tomorrow"
    countdownStyle = "text-accent bg-accent/10 border-accent/20 font-bold"
  } else if (diffDays > 1) {
    countdownText = `In ${diffDays} Days`
    countdownStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  } else {
    countdownText = `${Math.abs(diffDays)} Days Ago`
    countdownStyle = "text-muted-foreground bg-zinc-950/40 border-border/40"
  }

  const formattedDate = format(airDateObj, "MMMM d, yyyy")

  const handleCardClick = () => {
    navigate(`/${event.mediaType}/${event.mediaId}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="flex gap-4 p-4 border border-border bg-surface/40 hover:bg-surface-hover/75 hover:border-border-hover rounded-card transition-all cursor-pointer shadow-sm group font-sans"
    >
      {/* Cover Poster */}
      <div className="h-20 w-14 shrink-0 rounded-button overflow-hidden bg-zinc-900 border border-border/40 aspect-[2/3] flex items-center justify-center relative select-none">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Film className="h-6 w-6 text-muted-foreground/35" />
        )}
      </div>

      {/* Info details */}
      <div className="flex-grow flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Movie/TV type badge */}
            <span
              className={`inline-flex items-center gap-1 text-[8px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full border ${
                event.mediaType === "movie"
                  ? "bg-blue-500/10 border-blue-500/35 text-blue-400"
                  : "bg-purple-500/10 border-purple-500/35 text-purple-400"
              }`}
            >
              {event.mediaType === "movie" ? (
                <Film className="h-2 w-2" />
              ) : (
                <Tv className="h-2 w-2" />
              )}
              {event.mediaType === "movie" ? "Movie" : "TV Show"}
            </span>

            {/* Countdown Badge */}
            <span
              className={`inline-flex items-center gap-1 text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${countdownStyle}`}
            >
              <Hourglass className="h-2 w-2 shrink-0" />
              {countdownText}
            </span>
          </div>

          <h4 className="text-xs font-black truncate w-full group-hover:text-primary transition-colors">
            {event.title}
          </h4>

          {/* TV show episode metadata */}
          {event.mediaType === "tv" && event.details && (
            <p className="text-[10px] text-muted-foreground font-semibold truncate leading-relaxed">
              Season {event.details.seasonNumber}, Ep {event.details.episodeNumber} •{" "}
              <span className="italic">"{event.details.episodeTitle}"</span>
            </p>
          )}
        </div>

        {/* Date block */}
        <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-semibold">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}
export default ReleaseCard
