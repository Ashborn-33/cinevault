import {
  Film,
  Tv,
  PlusCircle,
  CheckCircle2,
  RotateCcw,
  FolderPlus,
  FolderSync,
  BookPlus,
} from "lucide-react"
import type { ActivityType } from "../types/activity"

interface ActivityBadgeProps {
  type: ActivityType
}

export function ActivityBadge({ type }: ActivityBadgeProps) {
  let label = "Activity"
  let icon = <Film className="h-3 w-3" />
  let style = "bg-zinc-900 border-border text-muted-foreground"

  switch (type) {
    case "movie_started":
      label = "Started Movie"
      icon = <PlusCircle className="h-3 w-3 text-blue-400" />
      style = "bg-blue-500/10 border-blue-500/25 text-blue-400"
      break
    case "movie_continued":
      label = "Watching Movie"
      icon = <Film className="h-3 w-3 text-blue-400" />
      style = "bg-blue-500/10 border-blue-500/20 text-blue-400"
      break
    case "movie_completed":
      label = "Completed Movie"
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      style = "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-extrabold"
      break
    case "movie_rewatched":
      label = "Rewatched Movie"
      icon = <RotateCcw className="h-3 w-3 text-blue-400" />
      style = "bg-blue-500/15 border-blue-500/30 text-blue-400"
      break
    case "tv_started":
      label = "Started TV"
      icon = <PlusCircle className="h-3 w-3 text-purple-400" />
      style = "bg-purple-500/10 border-purple-500/25 text-purple-400"
      break
    case "tv_episode":
      label = "Watched Episode"
      icon = <Tv className="h-3 w-3 text-purple-400" />
      style = "bg-purple-500/10 border-purple-500/20 text-purple-400"
      break
    case "tv_season_completed":
      label = "Season Completed"
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      style = "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 font-extrabold"
      break
    case "tv_completed":
      label = "Completed TV"
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-400 animate-pulse" />
      style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-black"
      break
    case "collection_created":
      label = "Created Collection"
      icon = <FolderPlus className="h-3 w-3 text-amber-400" />
      style = "bg-amber-500/10 border-amber-500/25 text-amber-400"
      break
    case "collection_updated":
      label = "Updated Collection"
      icon = <FolderSync className="h-3 w-3 text-amber-400" />
      style = "bg-amber-500/10 border-amber-500/20 text-amber-400"
      break
    case "collection_added":
      label = "Added to Collection"
      icon = <BookPlus className="h-3 w-3 text-amber-400" />
      style = "bg-amber-500/10 border-amber-500/25 text-amber-400"
      break
    case "collection_removed":
      label = "Removed Item"
      icon = <FolderSync className="h-3 w-3 text-zinc-400" />
      style = "bg-zinc-800 border-zinc-700 text-zinc-400"
      break
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${style}`}
    >
      {icon}
      {label}
    </span>
  )
}
export default ActivityBadge
