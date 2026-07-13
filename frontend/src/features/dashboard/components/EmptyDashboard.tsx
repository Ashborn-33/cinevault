import { Link } from "react-router-dom"
import { Compass, Calendar, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyDashboardProps {
  type: "continue" | "upcoming"
}

export function EmptyDashboard({ type }: EmptyDashboardProps) {
  if (type === "continue") {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-border border-dashed rounded-card text-center space-y-4 font-sans">
        <Play className="h-10 w-10 text-muted-foreground opacity-35" />
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-extrabold tracking-tight">
            Nothing in progress
          </h3>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            You haven't started watching anything yet. Find a title to start tracking!
          </p>
        </div>
        <Button size="sm" asChild className="flex items-center gap-1.5 font-bold text-xs">
          <Link to="/discover">
            <Compass className="h-4 w-4" />
            Browse Discover
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-border border-dashed rounded-card text-center space-y-3 font-sans">
      <Calendar className="h-10 w-10 text-muted-foreground opacity-35" />
      <div className="space-y-1">
        <h3 className="font-heading text-sm font-extrabold tracking-tight">No upcoming releases</h3>
        <p className="text-[11px] text-muted-foreground max-w-xs">
          No upcoming episodes found for the TV shows in your library. Add more shows to track their
          calendar releases.
        </p>
      </div>
    </div>
  )
}
export default EmptyDashboard
