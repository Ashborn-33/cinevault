import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import type { ActivityEntry } from "../types/statistics"

interface ActivityAreaChartProps {
  data: ActivityEntry[]
  title: string
}

export function ActivityAreaChart({ data, title }: ActivityAreaChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground border border-border bg-surface/50 rounded-card font-sans">
        No trend records found.
      </div>
    )
  }

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-4 shadow-sm hover:border-border-hover transition-colors">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Area
              type="monotone"
              dataKey="hours"
              stroke="var(--color-accent, #ec4899)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGrad)"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent, #ec4899)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-accent, #ec4899)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
export default ActivityAreaChart
