import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { ActivityEntry } from "../types/statistics"

interface ActivityBarChartProps {
  data: ActivityEntry[]
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
}

export function ActivityBarChart({ data, title }: ActivityBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground border border-border bg-surface/50 rounded-card font-sans">
        No activity records.
      </div>
    )
  }

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-4 shadow-sm hover:border-border-hover transition-colors">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border, #27272a)"
              opacity={0.3}
            />
            <XAxis
              dataKey="label"
              stroke="var(--color-muted-foreground, #a1a1aa)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground, #a1a1aa)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}h`}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
              contentStyle={{
                backgroundColor: "var(--color-surface, #18181b)",
                borderColor: "var(--color-border, #27272a)",
                borderRadius: "var(--radius-button, 8px)",
                fontSize: "11px",
                fontFamily: "var(--font-sans, sans-serif)",
                color: "var(--color-foreground, #fafafa)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${value} hrs`, "Watch Hours"]}
            />
            <Bar dataKey="hours" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary, #6366f1)" />
                <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
export default ActivityBarChart
