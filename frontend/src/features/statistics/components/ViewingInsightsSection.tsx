import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react"
import type { ViewingInsight } from "../types/statistics"

interface ViewingInsightsSectionProps {
  insights: ViewingInsight[]
}

export function ViewingInsightsSection({ insights }: ViewingInsightsSectionProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
      case "warning":
        return <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0" />
      case "accent":
        return <Sparkles className="h-4.5 w-4.5 text-accent shrink-0" />
      default:
        return <Lightbulb className="h-4.5 w-4.5 text-primary shrink-0" />
    }
  }

  const getColorStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/5 border-emerald-500/20 text-foreground"
      case "warning":
        return "bg-amber-500/5 border-amber-500/20 text-foreground"
      case "accent":
        return "bg-pink-500/5 border-pink-500/20 text-foreground"
      default:
        return "bg-primary/5 border-primary/20 text-foreground"
    }
  }

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-4 shadow-sm hover:border-border-hover transition-colors">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
        Viewing Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex items-start gap-3 p-3.5 border rounded-button text-xs font-semibold ${getColorStyles(
              insight.type
            )}`}
          >
            {getIcon(insight.type)}
            <span>{insight.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default ViewingInsightsSection
