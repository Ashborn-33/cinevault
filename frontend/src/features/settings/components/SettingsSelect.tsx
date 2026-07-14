interface Option {
  value: string
  label: string
}

interface SettingsSelectProps {
  label: string
  description?: string
  value: string
  options: Option[]
  onChange: (val: string) => void
  disabled?: boolean
}

export function SettingsSelect({
  label,
  description,
  value,
  options,
  onChange,
  disabled = false,
}: SettingsSelectProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-border/40 bg-surface/20 rounded-button font-sans gap-2">
      <div className="space-y-0.5 max-w-[70%]">
        <span className="text-xs font-bold text-foreground">{label}</span>
        {description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
            {description}
          </p>
        )}
      </div>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-950/45 border border-border rounded px-2.5 py-1.5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer min-w-[120px] text-foreground"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
export default SettingsSelect
