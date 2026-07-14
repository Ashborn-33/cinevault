interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 6,
  className = "",
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset =
    circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-medium ease-out-decelerate"
        />
        {/* Gradients definitions */}
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #6366f1)" />
            <stop offset="100%" stopColor="var(--color-accent, #ec4899)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centered text label */}
      <span className="absolute text-[11px] font-black text-foreground">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
export default ProgressRing
