import { useNavigate } from "react-router-dom"
import { WifiOff, RefreshCw, Library } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OfflinePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-card bg-surface/20 min-h-[400px] font-sans max-w-lg mx-auto py-16 space-y-6 select-none">
      {/* Icon alert */}
      <div className="p-4 bg-error/10 rounded-full border border-error/20 shadow text-error animate-bounce">
        <WifiOff className="h-10 w-10 shrink-0" />
      </div>

      <div className="space-y-1 max-w-xs">
        <h2 className="text-base font-black tracking-tight">No Internet Connection</h2>
        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
          It looks like you are offline. CineVault can still browse previously loaded library items
          and stats.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs justify-center pt-2">
        <Button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm justify-center"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
        <Button
          onClick={() => navigate("/library")}
          variant="outline"
          className="flex items-center gap-1.5 text-xs font-bold shadow-sm justify-center"
        >
          <Library className="h-4 w-4" />
          Browse Offline Library
        </Button>
      </div>
    </div>
  )
}
export default OfflinePage
