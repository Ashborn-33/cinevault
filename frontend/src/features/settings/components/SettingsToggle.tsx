interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-border/40 bg-surface/20 rounded-button font-sans">
      <div className="space-y-0.5 max-w-[80%]">
        <span className="text-xs font-bold text-foreground">{label}</span>
        {description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-primary" : "bg-zinc-800"
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0.5"
          } mt-[1px]`}
        />
      </button>
    </div>
  )
}
export default SettingsToggle
