import { useNavigate } from "react-router-dom"
import { Play, Clock, Tv, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { tmdbClient } from "@/features/discover"
import type { LibraryItem } from "@/features/library"

interface ContinueWatchingCardProps {
  item: LibraryItem
}

export function ContinueWatchingCard({ item }: ContinueWatchingCardProps) {
  const navigate = useNavigate()
  const isTv = item.media_type === "tv"
  const posterUrl = item.poster_path ? tmdbClient.getImageUrl(item.poster_path) : undefined

  const progressPercent = item.progress || 0

  const lastWatchedLabel = item.last_watched_at
    ? new Date(item.last_watched_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Recently"

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isTv && item.current_season && item.current_episode) {
      navigate(`/tv/${item.media_id}?season=${item.current_season}&episode=${item.current_episode}`)
    } else {
      navigate(`/${item.media_type}/${item.media_id}`)
    }
  }

  return (
    <div
      onClick={handleActionClick}
      className="flex gap-4 p-4 border border-border bg-surface/40 hover:bg-surface-hover/60 hover:border-border-hover rounded-card transition-all cursor-pointer shadow-sm group font-sans"
    >
      {/* Tiny Poster Cover */}
      <div className="h-20 w-14 shrink-0 rounded-button overflow-hidden bg-zinc-900 border border-border/40 aspect-[2/3] flex items-center justify-center relative">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : isTv ? (
          <Tv className="h-6 w-6 text-muted-foreground/35" />
        ) : (
          <Film className="h-6 w-6 text-muted-foreground/35" />
        )}
      </div>

      {/* Metadata column */}
      <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5 space-y-2">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-xs font-bold truncate group-hover:text-primary transition-colors">
              {item.title}
            </h4>
            <span className="text-[9px] text-muted-foreground font-semibold shrink-0">
              {lastWatchedLabel}
            </span>
          </div>

          {/* Episodic metadata if TV, or Runtime if Movie */}
          {isTv ? (
            item.current_season && item.current_episode ? (
              <p className="text-[10px] text-primary font-bold truncate">
                S{String(item.current_season).padStart(2, "0")}E
                {String(item.current_episode).padStart(2, "0")}{" "}
                {item.last_episode_name && (
                  <span className="text-muted-foreground font-medium">
                    {" "}
                    - {item.last_episode_name}
                  </span>
                )}
              </p>
            ) : null
          ) : (
            item.runtime_minutes && (
              <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.runtime_minutes} mins remaining
              </p>
            )
          )}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px] font-semibold text-muted-foreground">
            <span>Progress</span>
            <span className="text-foreground font-bold">{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-standard"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="flex items-center shrink-0 pl-1 self-center">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full bg-zinc-900 border border-border/80 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm"
          onClick={handleActionClick}
          aria-label={`Continue watching ${item.title}`}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </Button>
      </div>
    </div>
  )
}
export default ContinueWatchingCard
