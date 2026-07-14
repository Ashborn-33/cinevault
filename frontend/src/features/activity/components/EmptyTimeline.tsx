import { useNavigate } from "react-router-dom"
import { History, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyTimeline() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-card bg-surface/20 min-h-[350px] font-sans">
      <div className="p-4 bg-zinc-950/40 rounded-full border border-border/60 shadow mb-4 text-muted-foreground">
        <History className="h-10 w-10 opacity-75 animate-pulse" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-extrabold tracking-tight">No activity yet</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
          Your CineVault activity timeline is currently empty. Start tracking movies or TV episodes
          in your library to see them logged here chronologically.
        </p>
      </div>

      <Button
        onClick={() => navigate("/discover")}
        className="mt-6 flex items-center gap-1.5 text-xs font-bold shadow-sm"
      >
        <Compass className="h-4 w-4" />
        Browse Discover
      </Button>
    </div>
  )
}
export default EmptyTimeline
