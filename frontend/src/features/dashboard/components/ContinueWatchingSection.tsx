import { Play } from "lucide-react"
import { ContinueWatchingCard } from "./ContinueWatchingCard"
import { EmptyDashboard } from "./EmptyDashboard"
import type { LibraryItem } from "@/features/library"

interface ContinueWatchingSectionProps {
  items: LibraryItem[]
}

export function ContinueWatchingSection({ items }: ContinueWatchingSectionProps) {
  if (items.length === 0) {
    return <EmptyDashboard type="continue" />
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <Play className="h-5 w-5 text-primary fill-current" />
        <h2 className="font-heading text-lg font-extrabold tracking-tight">Continue Watching</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <ContinueWatchingCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
export default ContinueWatchingSection
