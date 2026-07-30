import { X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpdatePromptProps {
  needRefresh: boolean
  onUpdate: () => void
  onDismiss: () => void
}

export function UpdatePrompt({ needRefresh, onUpdate, onDismiss }: UpdatePromptProps) {
  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 z-toast w-[90%] max-w-sm p-4 rounded-card border border-border bg-surface shadow-level-3 font-sans text-foreground animate-in slide-in-from-bottom-4">
      {/* Header Close */}
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer outline-none"
        aria-label="Dismiss update alert"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-3 text-xs font-semibold">
        <div className="space-y-1">
          <span className="text-xs font-bold text-foreground">Update Available</span>
          <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
            A new version of CineVault is ready. Reload the application to apply the enhancements.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onUpdate}
            size="sm"
            className="flex items-center gap-1 text-[10px] font-black uppercase"
          >
            <RefreshCw className="h-3 w-3 animate-spin" />
            Reload Now
          </Button>
          <Button
            onClick={onDismiss}
            variant="outline"
            size="sm"
            className="text-[10px] font-black uppercase"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}
export default UpdatePrompt
