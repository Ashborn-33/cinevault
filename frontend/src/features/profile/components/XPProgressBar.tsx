import type { ViewerLevel } from "../types/profile"

interface XPProgressBarProps {
  viewerLevel: ViewerLevel
}

export function XPProgressBar({ viewerLevel }: XPProgressBarProps) {
  return (
    <div className="space-y-2 font-sans select-none">
      {/* Label and Info */}
      <div className="flex justify-between items-baseline text-xs font-bold">
        <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-black">
          XP Progress
        </span>
        <span className="text-foreground">
          {viewerLevel.xp % 300} <span className="text-muted-foreground text-[10px]">/ 300 XP</span>
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2.5 w-full bg-zinc-950/45 rounded-full overflow-hidden border border-border/25 relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${viewerLevel.progressPercent}%` }}
        />
      </div>
    </div>
  )
}
export default XPProgressBar
