import { Clock } from "lucide-react"

interface ImportProgressProps {
  taskName: string
  progressPct: number
  elapsedTime: number
}

export function ImportProgress({ taskName, progressPct, elapsedTime }: ImportProgressProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remaining = secs % 60
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`
  }

  return (
    <div className="space-y-5 text-left font-sans select-none">
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-wider text-primary">Importing Data</h4>
        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
          Please keep this tab open. All parsing occurs locally on your browser.
        </p>
      </div>

      <div className="space-y-3 bg-surface/30 p-5 rounded-card border border-border/80 shadow-sm">
        <div className="flex justify-between items-center text-xs font-bold leading-tight">
          <span className="text-white truncate max-w-[70%]">{taskName}</span>
          <span className="text-primary font-black">{progressPct}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-primary rounded-full transition-all duration-300"
          />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase pt-2">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Elapsed Time: {formatTime(elapsedTime)}</span>
        </div>
      </div>
    </div>
  )
}
export default ImportProgress
