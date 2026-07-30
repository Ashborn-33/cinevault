import { Sparkles } from "lucide-react"

interface RecommendationReasonProps {
  reason: string
}

export function RecommendationReason({ reason }: RecommendationReasonProps) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 border border-primary/25 text-primary text-[9px] font-black uppercase tracking-wider select-none shrink-0 w-fit">
      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
      {reason}
    </div>
  )
}
export default RecommendationReason
