import { ArrowRight, Sparkles } from "lucide-react"

interface ImportProviderCardProps {
  name: string
  description: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function ImportProviderCard({
  name,
  description,
  selected,
  onClick,
  disabled = false,
}: ImportProviderCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type="button"
      className={`w-full p-4 rounded-card border text-left font-sans transition-all duration-200 flex items-center justify-between outline-none select-none ${
        disabled
          ? "opacity-50 cursor-not-allowed border-border/80 bg-surface/10"
          : selected
            ? "border-primary bg-primary/5 ring-1 ring-primary cursor-pointer shadow-sm"
            : "border-border bg-surface/30 hover:border-muted-foreground/60 hover:bg-surface-hover cursor-pointer"
      }`}
    >
      <div className="space-y-1 max-w-[80%]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-foreground uppercase tracking-wide">{name}</span>
          {selected && <Sparkles className="h-3 w-3 text-primary animate-pulse" />}
          {disabled && (
            <span className="text-[8px] font-black uppercase bg-muted/65 text-muted-foreground px-1.5 py-0.5 rounded-full">
              Future Ready
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
          {description}
        </p>
      </div>
      <ArrowRight
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          selected ? "text-primary translate-x-1" : "text-muted-foreground/60"
        }`}
      />
    </button>
  )
}
export default ImportProviderCard
