import type { LucideIcon } from "lucide-react"
import { ProgressRing } from "./ProgressRing"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  subtitle?: string
  progressPercentage?: number
  accentColor?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  subtitle,
  progressPercentage,
  accentColor = "text-primary",
}: StatCardProps) {
  return (
    <div className="flex items-center justify-between p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card gap-4 font-sans shadow-sm hover:border-border-hover transition-colors">
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          {Icon && <Icon className={`h-4 w-4 shrink-0 ${accentColor}`} />}
          <span className="truncate">{label}</span>
        </div>
        <div className="text-2xl font-black tracking-tight text-foreground truncate">{value}</div>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground font-semibold truncate">{subtitle}</p>
        )}
      </div>

      {/* Optional Progress Ring */}
      {progressPercentage !== undefined && (
        <ProgressRing percentage={progressPercentage} size={54} strokeWidth={5} />
      )}
    </div>
  )
}
export default StatCard
