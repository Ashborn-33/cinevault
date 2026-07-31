import { Hourglass } from "lucide-react"
import { Link } from "react-router-dom"
import { AbandonedWatchingCard } from "./AbandonedWatchingCard"
import type { LibraryItem } from "@/features/library"

interface AbandonedWatchingSectionProps {
  items: LibraryItem[]
}

export function AbandonedWatchingSection({ items }: AbandonedWatchingSectionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Hourglass className="h-5 w-5 text-amber-500 fill-current animate-pulse" />
          <h2 className="font-heading text-lg font-extrabold tracking-tight">
            ⏳ Haven't Watched for a While
          </h2>
        </div>
        <Link
          to="/library"
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
          View All &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <AbandonedWatchingCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
export default AbandonedWatchingSection
