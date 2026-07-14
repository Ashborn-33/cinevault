import { Flame, Info } from "lucide-react"

interface StreakCalendarHeatmapProps {
  heatmapData: Record<string, number>
  currentStreak: number
  longestStreak: number
}

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function StreakCalendarHeatmap({
  heatmapData,
  currentStreak,
  longestStreak,
}: StreakCalendarHeatmapProps) {
  // Generate last 18 weeks of calendar dates (126 blocks)
  const generateHeatmapDays = () => {
    const days = []
    const start = new Date()
    start.setDate(start.getDate() - 125) // Go back 125 days

    for (let i = 0; i <= 125; i++) {
      const current = new Date(start)
      current.setDate(start.getDate() + i)
      const dateStr = getLocalDateString(current)
      days.push({
        date: current,
        dateStr,
        count: heatmapData[dateStr] || 0,
      })
    }
    return days
  }

  const days = generateHeatmapDays()

  // Color mapper based on daily check-in activity count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-zinc-900 border border-border/20"
    if (count === 1) return "bg-primary/20 border border-primary/35"
    if (count === 2) return "bg-primary/50 border border-primary/60"
    return "bg-primary border border-primary-hover"
  }

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-5 shadow-sm hover:border-border-hover transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-3">
        <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
          <Flame className="h-4.5 w-4.5 text-primary fill-current animate-bounce" />
          Consistency Heatmap & Streaks
        </h3>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold">Current:</span>
            <span className="text-primary">{currentStreak} days</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-[10px] uppercase font-bold">Longest:</span>
            <span className="text-accent">{longestStreak} days</span>
          </div>
        </div>
      </div>

      {/* Grid mapping */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap gap-1.5 items-center justify-center p-2.5 bg-zinc-950/40 border border-border/40 rounded-button max-w-full overflow-x-auto">
          {days.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}: ${day.count} watch event${day.count === 1 ? "" : "s"}`}
              className={`h-2.5 w-2.5 rounded-[2px] transition-all hover:scale-125 hover:ring-1 hover:ring-primary shrink-0 cursor-pointer ${getCellColor(
                day.count
              )}`}
            />
          ))}
        </div>

        {/* Legend panel */}
        <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold px-1">
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Showing daily activity count for the past 18 weeks
          </span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            <span className="h-2 w-2 rounded-[1px] bg-zinc-900 border border-border/20" />
            <span className="h-2 w-2 rounded-[1px] bg-primary/20 border border-primary/35" />
            <span className="h-2 w-2 rounded-[1px] bg-primary/50 border border-primary/60" />
            <span className="h-2 w-2 rounded-[1px] bg-primary" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default StreakCalendarHeatmap
