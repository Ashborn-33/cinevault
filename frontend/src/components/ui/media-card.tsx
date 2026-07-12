import * as React from "react"
import { Star, Heart, Clock, User, Flame, Film, Tv, Play } from "lucide-react"

import { Card, type CardProps } from "./card"
import { cn } from "@/lib/utils"

export type MediaType = "movie" | "tv" | "anime" | "documentary" | "kdrama"

export type MediaStatus = "watching" | "completed" | "planned" | "dropped" | "on_hold"

export interface MediaItem {
  id: string
  title: string
  type: MediaType
  posterUrl?: string
  releaseYear: number
  genres: string[]
  runtime?: number // in minutes
  averageRating: number // e.g., 8.4
  userRating?: number // e.g., 9
  status?: MediaStatus
  isFavorite?: boolean
  isTrending?: boolean
  progress?: {
    current: number
    total: number
    type: "episodes" | "seasons" | "percent" | "watched"
  }
}

export interface MediaCardProps extends Omit<CardProps, "children"> {
  item: MediaItem
  onClick?: () => void
}

const MediaCard = React.forwardRef<HTMLDivElement, MediaCardProps>(
  ({ className, item, onClick, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    // Formatted runtime (e.g. 142m or 2h 22m)
    const formatRuntime = (mins?: number) => {
      if (!mins) return null
      if (mins < 60) return `${mins}m`
      const hrs = Math.floor(mins / 60)
      const remaining = mins % 60
      return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs}h`
    }

    // Media type labels
    const formatMediaType = (type: MediaType) => {
      switch (type) {
        case "movie":
          return "Movie"
        case "tv":
          return "TV Show"
        case "anime":
          return "Anime"
        case "documentary":
          return "Doc"
        case "kdrama":
          return "K-Drama"
        default:
          return type
      }
    }

    // Map status pill styles
    const getStatusStyles = (status: MediaStatus) => {
      switch (status) {
        case "watching":
          return "bg-warning/10 border-warning/30 text-warning"
        case "completed":
          return "bg-success/10 border-success/30 text-success"
        case "planned":
          return "bg-info/10 border-info/30 text-info"
        case "dropped":
          return "bg-error/10 border-error/30 text-error"
        case "on_hold":
          return "bg-secondary/10 border-border text-muted-foreground"
        default:
          return ""
      }
    }

    // Map status labels
    const getStatusLabel = (status: MediaStatus) => {
      switch (status) {
        case "watching":
          return "Watching"
        case "completed":
          return "Completed"
        case "planned":
          return "Planning"
        case "dropped":
          return "Dropped"
        case "on_hold":
          return "On Hold"
        default:
          return status
      }
    }

    // Calculate progress percentage
    const progressPercent = item.progress
      ? item.progress.type === "percent"
        ? item.progress.current
        : item.progress.total > 0
          ? Math.min((item.progress.current / item.progress.total) * 100, 100)
          : 0
      : 0

    return (
      <Card
        ref={ref}
        padding="none"
        hoverable
        className={cn(
          "aspect-[2/3] w-full overflow-hidden group select-none relative focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-label={`${item.title} (${formatMediaType(item.type)}, Released ${item.releaseYear})`}
        {...props}
      >
        {/* Poster Image */}
        {item.posterUrl && !imageError ? (
          <img
            src={item.posterUrl}
            alt={`Poster of ${item.title}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-standard ease-out-decelerate group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-muted-foreground p-4 text-center">
            {item.type === "movie" || item.type === "documentary" ? (
              <Film className="h-10 w-10 mb-2 opacity-50" />
            ) : (
              <Tv className="h-10 w-10 mb-2 opacity-50" />
            )}
            <span className="font-heading text-xs font-semibold px-2 line-clamp-2">
              {item.title}
            </span>
          </div>
        )}

        {/* Skeleton loading overlay */}
        {item.posterUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-skeleton animate-pulse" />
        )}

        {/* Ambient bottom-up gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 opacity-80 transition-opacity duration-standard ease-out-decelerate group-hover:opacity-90" />

        {/* Top Badges / Indicators */}
        <div className="absolute left-3 top-3 right-3 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1.5 items-start">
            {item.status && (
              <span
                className={cn(
                  "rounded-badge border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm",
                  getStatusStyles(item.status)
                )}
              >
                {getStatusLabel(item.status)}
              </span>
            )}
            {item.isTrending && (
              <span className="rounded-badge border border-rose-500/30 bg-rose-500/10 text-rose-400 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm flex items-center gap-0.5">
                <Flame className="h-3 w-3" />
                Trending
              </span>
            )}
          </div>

          <div className="flex gap-1.5">
            {item.isFavorite && (
              <span
                className="rounded-badge bg-rose-500/20 border border-rose-500/30 text-rose-400 p-1 backdrop-blur-md shadow-sm flex items-center justify-center"
                aria-label="Add to Favorites"
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
              </span>
            )}
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 pointer-events-none">
          <div className="space-y-0.5">
            <h4 className="font-heading text-base font-extrabold text-white line-clamp-1 group-hover:text-primary transition-colors duration-instant">
              {item.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
              <span>{item.releaseYear}</span>
              <span>•</span>
              <span>{formatMediaType(item.type)}</span>
              {item.runtime && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatRuntime(item.runtime)}
                  </span>
                </>
              )}
            </div>
            {item.genres.length > 0 && (
              <p className="text-[10px] text-zinc-400 truncate font-medium">
                {item.genres.join(", ")}
              </p>
            )}
          </div>

          {/* Ratings Grid */}
          <div className="flex items-center gap-3 pt-0.5">
            <div className="flex items-center gap-0.5 text-xs font-bold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{item.averageRating.toFixed(1)}</span>
            </div>

            {item.userRating && (
              <div className="flex items-center gap-0.5 text-xs font-bold text-violet-400">
                <User className="h-3.5 w-3.5" />
                <span>{item.userRating}</span>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {item.progress && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-300">
                <span className="flex items-center gap-0.5">
                  <Play className="h-2.5 w-2.5 fill-current" />
                  {item.progress.type === "episodes" &&
                    `${item.progress.current}/${item.progress.total} eps`}
                  {item.progress.type === "seasons" &&
                    `${item.progress.current}/${item.progress.total} seasons`}
                  {item.progress.type === "watched" && "Watched"}
                  {item.progress.type === "percent" && `${item.progress.current}%`}
                </span>
                {item.progress.type !== "watched" && <span>{Math.round(progressPercent)}%</span>}
              </div>
              {item.progress.type !== "watched" && (
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-standard ease-out-decelerate"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }
)
MediaCard.displayName = "MediaCard"

// Skeleton Placeholder
export function MediaCardSkeleton() {
  return (
    <div className="aspect-[2/3] w-full rounded-card border border-border/20 bg-skeleton/40 animate-pulse relative p-4 flex flex-col justify-end gap-3">
      {/* Top right overlay box placeholder */}
      <div className="absolute right-3 top-3 h-6 w-6 rounded-badge bg-zinc-800" />
      {/* Top left overlay box placeholder */}
      <div className="absolute left-3 top-3 h-5 w-14 rounded-badge bg-zinc-800" />

      {/* Metadata placeholders */}
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded bg-zinc-800" />
        <div className="h-3 w-1/2 rounded bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-800" />
      </div>

      {/* Rating placeholders */}
      <div className="flex gap-2">
        <div className="h-4 w-10 rounded bg-zinc-800" />
        <div className="h-4 w-10 rounded bg-zinc-800" />
      </div>
    </div>
  )
}

export { MediaCard }
