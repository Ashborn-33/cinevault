import { Check } from "lucide-react"

interface AccentColorPickerProps {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

const ACCENT_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Slate", hex: "#64748b" },
]

export function AccentColorPicker({ value, onChange, disabled = false }: AccentColorPickerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-border/40 bg-surface/20 rounded-button font-sans gap-2">
      <div className="space-y-0.5">
        <span className="text-xs font-bold text-foreground">Accent Color</span>
        <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
          Choose a highlight color theme for links, badges, and controls.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap sm:justify-end">
        {ACCENT_COLORS.map((c) => {
          const isSelected = value.toLowerCase() === c.hex.toLowerCase()
          return (
            <button
              key={c.hex}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c.hex)}
              style={{ backgroundColor: c.hex }}
              className={`h-7 w-7 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? "border-foreground scale-110 shadow-md"
                  : "border-transparent opacity-75 hover:opacity-100"
              }`}
              title={c.name}
              aria-label={`Select accent color ${c.name}`}
            >
              {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
export default AccentColorPicker
