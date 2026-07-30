import { motion } from "framer-motion"
import type { WrappedGenre } from "../types/wrapped"

interface GenreChartProps {
  genres: WrappedGenre[]
}

export function GenreChart({ genres }: GenreChartProps) {
  return (
    <div className="space-y-3.5 w-full max-w-xs mx-auto select-none">
      {genres.map((g, idx) => (
        <div key={g.name} className="space-y-1.5 text-left font-sans">
          <div className="flex justify-between text-[11px] font-black text-white/90 uppercase tracking-wide">
            <span>
              {idx + 1}. {g.name}
            </span>
            <span>{g.percentage}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${g.percentage}%` }}
              transition={{ duration: 1.2, delay: idx * 0.15, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
export default GenreChart
