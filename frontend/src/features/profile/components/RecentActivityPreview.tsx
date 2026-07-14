import { History } from "lucide-react"
import { useTimeline } from "@/features/activity/hooks/useActivity"
import TimelineCard from "@/features/activity/components/TimelineCard"

export function RecentActivityPreview() {
  // Query timeline with a limit of 10
  const { data, isLoading } = useTimeline(undefined, 10)
  const activities = data?.pages?.[0]?.data || []

  if (isLoading) {
    return (
      <div className="space-y-3 font-sans animate-pulse">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
          <History className="h-4 w-4 text-primary" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-16 bg-skeleton rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (activities.length === 0) return null

  return (
    <div className="space-y-3 font-sans">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
        <History className="h-4 w-4 text-primary" />
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((item) => (
          <TimelineCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
export default RecentActivityPreview
