import { Sun, Moon, Laptop } from "lucide-react"

interface ThemeSelectorProps {
  value: string
  onChange: (theme: string) => void
  disabled?: boolean
}

export function ThemeSelector({ value, onChange, disabled = false }: ThemeSelectorProps) {
  const modes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-border/40 bg-surface/20 rounded-button font-sans gap-2">
      <div className="space-y-0.5">
        <span className="text-xs font-bold text-foreground">Color Theme</span>
        <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
          Select dark, light, or auto system synchronized theme modes.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1 min-w-[200px]">
        {modes.map((m) => {
          const Icon = m.icon
          const isSelected = value === m.value
          return (
            <button
              key={m.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(m.value)}
              className={`py-1.5 px-3 rounded-button border text-[9px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                isSelected
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-zinc-950/20 border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-50"
              }`}
            >
              <Icon className="h-3 w-3 shrink-0" />
              {m.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
export default ThemeSelector
