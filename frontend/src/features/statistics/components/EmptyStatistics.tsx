import { Link } from "react-router-dom"
import { BarChart3, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyStatistics() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6 font-sans">
      <div className="h-16 w-16 rounded-full bg-zinc-900 border border-border/80 flex items-center justify-center mx-auto shadow-sm">
        <BarChart3 className="h-8 w-8 text-muted-foreground opacity-35" />
      </div>

      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">
          No viewing activity yet
        </h1>
        <p className="text-muted-foreground text-xs max-w-sm mx-auto leading-relaxed">
          Your watch times, monthly activity heatmaps, and genre analytics charts will appear here
          once you begin tracking movies or TV episodes in your personal vault.
        </p>
      </div>

      <Button asChild size="sm" className="flex items-center gap-1.5 font-bold mx-auto w-fit">
        <Link to="/discover">
          <Compass className="h-4 w-4" />
          Browse Discover
        </Link>
      </Button>
    </div>
  )
}
export default EmptyStatistics
