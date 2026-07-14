import {
  Folder,
  Heart,
  Film,
  Tv,
  Star,
  Flame,
  Trophy,
  Compass,
  Calendar,
  Layers,
} from "lucide-react"
import { tmdbClient } from "@/features/discover"
import type { Collection } from "../types/collections"

interface CollectionCardProps {
  collection: Collection
  onClick: () => void
}

const COLOR_CLASSES: Record<string, string> = {
  indigo: "from-indigo-500/20 to-indigo-950/45 border-indigo-500/25",
  rose: "from-rose-500/20 to-rose-950/45 border-rose-500/25",
  amber: "from-amber-500/20 to-amber-950/45 border-amber-500/25",
  emerald: "from-emerald-500/20 to-emerald-950/45 border-emerald-500/25",
  violet: "from-violet-500/20 to-violet-950/45 border-violet-500/25",
  blue: "from-blue-500/20 to-blue-950/45 border-blue-500/25",
  cyan: "from-cyan-500/20 to-cyan-950/45 border-cyan-500/25",
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  heart: Heart,
  film: Film,
  tv: Tv,
  star: Star,
  flame: Flame,
  trophy: Trophy,
  compass: Compass,
}

export function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const posterUrl = collection.poster_path ? tmdbClient.getImageUrl(collection.poster_path) : null
  const colColor = collection.color || "indigo"
  const themeClass = COLOR_CLASSES[colColor] || COLOR_CLASSES.indigo
  const IconComponent = ICON_MAP[collection.icon || "folder"] || Folder

  const formattedDate = new Date(collection.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between border bg-surface/50 hover:bg-surface-hover/70 hover:border-border-hover rounded-card overflow-hidden cursor-pointer transition-all duration-medium group font-sans shadow-sm`}
    >
      {/* Visual cover block */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 flex items-center justify-center border-b border-border/40 select-none">
        {posterUrl ? (
          <div className="relative w-full h-full">
            <img
              src={posterUrl}
              alt={collection.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
            {/* Gradient shadow overlay on cover */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/10" />
            <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-white">
              <IconComponent className="h-4 w-4 drop-shadow text-primary fill-current" />
              <span className="text-[10px] font-black uppercase tracking-wider drop-shadow-sm">
                Collection
              </span>
            </div>
          </div>
        ) : (
          /* Thematic icon placeholder cover */
          <div
            className={`absolute inset-0 bg-gradient-to-br ${themeClass} flex flex-col items-center justify-center gap-2`}
          >
            <div className="p-3 bg-zinc-950/40 rounded-full border border-border/60 shadow">
              <IconComponent className="h-6 w-6 text-foreground fill-current opacity-85" />
            </div>
          </div>
        )}

        {/* Smart / Manual collection type badge */}
        {collection.is_smart && (
          <span className="absolute top-2 right-2 text-[8px] bg-primary/95 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow">
            Smart
          </span>
        )}
      </div>

      {/* Info details */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1 min-w-0">
          <h4 className="text-xs font-black truncate group-hover:text-primary transition-colors">
            {collection.name}
          </h4>
          <p className="text-[10px] text-muted-foreground font-semibold line-clamp-2 min-h-[30px] leading-relaxed">
            {collection.description || "No description provided."}
          </p>
        </div>

        {/* Card footer details */}
        <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold border-t border-border/40 pt-2.5">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {collection.items_count} {collection.items_count === 1 ? "Item" : "Items"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  )
}
export default CollectionCard
