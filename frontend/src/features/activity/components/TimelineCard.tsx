import { useNavigate } from "react-router-dom"
import { Film, Tv, Layers, Calendar, ArrowRight } from "lucide-react"
import { tmdbClient } from "@/features/discover"
import { format, parseISO } from "date-fns"
import type { ActivityItem } from "../types/activity"
import { ActivityBadge } from "./ActivityBadge"

interface TimelineCardProps {
  item: ActivityItem
}

export function TimelineCard({ item }: TimelineCardProps) {
  const navigate = useNavigate()
  const posterUrl = item.posterPath ? tmdbClient.getImageUrl(item.posterPath) : null
  const formattedTime = format(parseISO(item.timestamp), "MMM d, yyyy 'at' h:mm a")

  const handleCardClick = () => {
    if (item.type.startsWith("collection_")) {
      if (item.details?.collectionId) {
        navigate(`/collections/${item.details.collectionId}`)
      }
    } else if (item.mediaType && item.mediaId) {
      navigate(`/${item.mediaType}/${item.mediaId}`)
    }
  }

  // Determine what visual detail line to show
  const renderDetails = () => {
    switch (item.type) {
      case "tv_episode":
        return (
          <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
            Season {item.details?.seasonNumber}, Episode {item.details?.episodeNumber} •{" "}
            <span className="italic">"{item.details?.episodeName}"</span>
          </p>
        )
      case "tv_season_completed":
        return (
          <p className="text-[10px] text-emerald-400 font-extrabold leading-relaxed">
            Completed Season {item.details?.seasonNumber}!
          </p>
        )
      case "collection_added":
        return (
          <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
            Added to{" "}
            <span className="text-amber-400 font-bold">{item.details?.collectionName}</span>{" "}
            collection
          </p>
        )
      case "movie_continued":
        return (
          <div className="space-y-1.5 max-w-xs">
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-extrabold">
              <span>Progress</span>
              <span>{item.details?.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-border/20">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.details?.progress || 0}%` }}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className="flex gap-4 p-4 border border-border bg-surface/35 hover:bg-surface-hover/60 hover:border-border-hover rounded-card transition-all cursor-pointer shadow-sm group font-sans text-foreground"
    >
      {/* Visual Poster Cover or Icon Box */}
      <div className="h-16 w-11 shrink-0 rounded bg-zinc-950/40 border border-border/40 aspect-[2/3] flex items-center justify-center relative overflow-hidden select-none">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : item.type.startsWith("collection_") ? (
          <Layers className="h-5 w-5 text-amber-400/60" />
        ) : item.mediaType === "tv" ? (
          <Tv className="h-5 w-5 text-purple-400/40" />
        ) : (
          <Film className="h-5 w-5 text-blue-400/40" />
        )}
      </div>

      {/* Main Info Blocks */}
      <div className="flex-grow min-w-0 flex flex-col justify-between space-y-1">
        <div className="space-y-1">
          {/* Header Action Badges & Time */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <ActivityBadge type={item.type} />
              {item.mediaType && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[8px] uppercase tracking-wider font-extrabold ${
                    item.mediaType === "movie" ? "text-blue-400" : "text-purple-400"
                  }`}
                >
                  {item.mediaType === "movie" ? "• movie" : "• tv"}
                </span>
              )}
            </div>
            <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {formattedTime}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-xs font-black truncate w-full group-hover:text-primary transition-colors flex items-center gap-1">
            {item.title}
            <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
          </h4>
        </div>

        {/* Dynamic Detail Sections */}
        {renderDetails()}
      </div>
    </div>
  )
}
export default TimelineCard
