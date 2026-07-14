import { Search, Filter, ArrowUpDown } from "lucide-react"
import type { ActivityFilters as FiltersType } from "../types/activity"

interface TimelineFiltersProps {
  filters: FiltersType
  onChange: (updates: Partial<FiltersType>) => void
}

const CATEGORIES: { value: FiltersType["category"]; label: string }[] = [
  { value: "all", label: "All Activity" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "collection", label: "Collections" },
  { value: "completed", label: "Completed Only" },
  { value: "started", label: "Started Only" },
  { value: "progress", label: "In Progress" },
]

export function TimelineFilters({ filters, onChange }: TimelineFiltersProps) {
  return (
    <div className="border border-border bg-surface/50 rounded-card p-4 space-y-4 font-sans shadow-sm">
      {/* Filters Title Header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-border/40 text-xs font-black uppercase tracking-wider text-foreground select-none">
        <Filter className="h-4 w-4 text-primary" />
        Filter Timeline Feed
      </div>

      {/* Row: Search & Sort */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by title, collection, episode name..."
            className="w-full pl-9 pr-4 py-2 rounded-input border border-border bg-surface/50 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold"
          />
        </div>

        {/* Sort Select */}
        <div className="relative flex items-center gap-2 border border-border bg-surface/50 rounded-input px-3 py-1 text-xs">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground select-none">Sort:</span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as "newest" | "oldest" })}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer w-full text-foreground"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Horizontal categories list */}
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange({ category: cat.value })}
            className={`px-3 py-1 rounded-button border text-[9px] uppercase tracking-wider font-black cursor-pointer transition-all whitespace-nowrap ${
              filters.category === cat.value
                ? "bg-primary border-primary text-white shadow-sm"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
export default TimelineFilters
