import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { GenreStatEntry } from "../types/statistics"

interface GenrePieChartProps {
  data: GenreStatEntry[]
}

const COLORS = [
  "#6366f1", // primary / indigo
  "#ec4899", // accent / pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#06b6d4", // cyan
]

export function GenrePieChart({ data }: GenrePieChartProps) {
  const chartData = data.slice(0, 7).map((item) => ({
    name: item.genre,
    value: item.hours,
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground border border-border bg-surface/50 rounded-card font-sans">
        No genre stats found.
      </div>
    )
  }

  return (
    <div className="p-5 border border-border bg-surface/50 backdrop-blur-sm rounded-card font-sans space-y-4 shadow-sm hover:border-border-hover transition-colors">
      <h3 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
        Most Watched Genres (Hours)
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="var(--color-surface, #18181b)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
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
              formatter={(value: any) => [`${value} hrs`, "Time Played"]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "10px",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
export default GenrePieChart
