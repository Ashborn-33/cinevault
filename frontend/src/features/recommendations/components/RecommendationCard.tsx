import { useNavigate } from "react-router-dom"
import { Star, Trophy } from "lucide-react"
import { tmdbClient } from "@/features/discover"
import { RecommendationReason } from "./RecommendationReason"
import type { RecommendationItem } from "../types/recommendations"

interface RecommendationCardProps {
  item: RecommendationItem
}

export function RecommendationCard({ item }: RecommendationCardProps) {
  const navigate = useNavigate()
  const posterUrl = item.posterPath ? tmdbClient.getImageUrl(item.posterPath) : null

  const handleNavigate = () => {
    navigate(`/${item.mediaType}/${item.mediaId}`)
  }

  return (
    <div
      onClick={handleNavigate}
      className="flex flex-col border border-border/60 bg-surface/35 rounded-card overflow-hidden hover:border-primary/50 cursor-pointer select-none group transition-all duration-300 w-44 shrink-0 shadow-sm relative focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      tabIndex={0}
      role="link"
      aria-label={`Recommendation for ${item.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleNavigate()
        }
      }}
    >
      {/* Poster image container */}
      <div className="h-56 relative overflow-hidden bg-zinc-950/45">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs font-bold font-heading uppercase p-4 text-center">
            {item.title}
          </div>
        )}

        {/* Rating and Match score badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-black text-amber-400">
            <Star className="h-3 w-3 fill-amber-400 shrink-0" />
            {item.rating.toFixed(1)}
          </span>
          {item.score > 0 && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary text-[9px] font-black text-white">
              <Trophy className="h-3 w-3 shrink-0" />
              {item.score}% Match
            </span>
          )}
        </div>
      </div>

      {/* Info details block */}
      <div className="p-3 space-y-2 flex flex-col justify-between flex-grow">
        <div className="space-y-1">
          <h4 className="text-xs font-black truncate leading-tight group-hover:text-primary transition-colors">
            {item.title}
          </h4>
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">
            {item.mediaType === "movie" ? "Movie" : "TV Show"}
            {item.releaseDate && ` • ${new Date(item.releaseDate).getFullYear()}`}
          </p>
        </div>

        <RecommendationReason reason={item.reason} />
      </div>
    </div>
  )
}
export default RecommendationCard
