import { useNavigate } from "react-router-dom"
import { Compass, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyRecommendations() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-card bg-surface/20 min-h-[380px] font-sans max-w-2xl mx-auto">
      <div className="p-4 bg-primary/10 rounded-full border border-primary/25 shadow mb-4 text-primary">
        <Sparkles className="h-10 w-10 opacity-85 animate-pulse" />
      </div>

      <div className="space-y-1 max-w-md">
        <h3 className="text-base font-extrabold tracking-tight">
          Recommendation Engine is warming up
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
          CineVault Intelligence needs viewing activity or favorite genres to generate smart
          matches. Start logging completed movies in your library or set preferences to receive
          suggestions!
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={() => navigate("/discover")}
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <Compass className="h-4 w-4" />
          Browse Discover
        </Button>
        <Button
          onClick={() => navigate("/settings")}
          variant="outline"
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm"
        >
          Customize Genres
        </Button>
      </div>
    </div>
  )
}
export default EmptyRecommendations
