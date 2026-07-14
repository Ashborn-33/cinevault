import { useNavigate } from "react-router-dom"
import { CheckCircle, Film, Tv } from "lucide-react"
import { tmdbClient } from "@/features/discover"
import type { RecentCompletion } from "../types/statistics"

interface RecentlyCompletedSectionProps {
  items: RecentCompletion[]
}

export function RecentlyCompletedSection({ items }: RecentlyCompletedSectionProps) {
  const navigate = useNavigate()

  if (items.length === 0) {
    return null
  }

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-4 shadow-sm hover:border-border-hover transition-colors">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
        <CheckCircle className="h-4 w-4 text-emerald-400" />
        Recently Completed
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((item) => {
          const posterUrl = item.posterPath ? tmdbClient.getImageUrl(item.posterPath) : undefined
          const completionDate = new Date(item.completedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/${item.mediaType}/${item.mediaId}`)}
              className="flex flex-col gap-2 cursor-pointer group select-none"
            >
              {/* Poster frame */}
              <div className="relative aspect-[2/3] w-full rounded-button overflow-hidden bg-zinc-900 border border-border/40 shadow-sm">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : item.mediaType === "tv" ? (
                  <Tv className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground/30" />
                ) : (
                  <Film className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground/30" />
                )}
                {/* Completion tag overlay */}
                <span className="absolute bottom-1 right-1 text-[8px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded shadow">
                  {completionDate}
                </span>
              </div>

              {/* Title label */}
              <h4 className="text-[11px] font-bold truncate group-hover:text-primary transition-colors text-center px-1">
                {item.title}
              </h4>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default RecentlyCompletedSection
