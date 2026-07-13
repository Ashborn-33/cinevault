import * as React from "react"
import { X, Film } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  initialProgress: number
  onSave: (progress: number) => Promise<void>
  isSaving: boolean
  title: string
}

export function ProgressModal({
  isOpen,
  onClose,
  initialProgress,
  onSave,
  isSaving,
  title,
}: ProgressModalProps) {
  const [progress, setProgress] = React.useState<number>(initialProgress)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Focus modal container on mount
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        modalRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Keybind listeners: Escape closes dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(e.target.value)
    if (val < 0) val = 0
    if (val > 100) val = 100
    setProgress(val)
  }

  const handleSaveClick = async () => {
    await onSave(progress)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-standard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-modal-title"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md border border-border bg-surface rounded-card p-6 shadow-level-3 space-y-6 focus:outline-none z-content"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <h2
              id="progress-modal-title"
              className="font-heading text-base font-extrabold tracking-tight"
            >
              Update Progress
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-button p-1 hover:bg-surface-hover hover:text-foreground text-muted-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[11px] text-muted-foreground">
            Set your current progress percentage. Setting this to 100% will automatically mark this
            movie as completed.
          </p>
        </div>

        <div className="space-y-6 font-sans">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Watching state</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              aria-label="Watch progress slider"
            />
          </div>

          <div className="flex items-center gap-4 justify-between border border-border/40 p-3 rounded-button bg-zinc-950/20">
            <span className="text-xs text-muted-foreground font-semibold">
              Enter custom percentage:
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={handleInputChange}
                className="w-16 h-8 text-center text-xs font-bold border border-border rounded-button bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Watch progress numeric input"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveClick} loading={isSaving}>
            Save Progress
          </Button>
        </div>
      </div>
    </div>
  )
}
export default ProgressModal
