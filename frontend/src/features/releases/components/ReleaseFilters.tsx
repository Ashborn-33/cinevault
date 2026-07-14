import { Search, Filter, Layers, Clock } from "lucide-react"
import type { ReleaseFilters as FiltersType } from "../types/releases"

interface ReleaseFiltersProps {
  filters: FiltersType
  onChange: (updates: Partial<FiltersType>) => void
}

export function ReleaseFilters({ filters, onChange }: ReleaseFiltersProps) {
  return (
    <div className="border border-border bg-surface/50 rounded-card p-4 space-y-6 font-sans shadow-sm">
      {/* Filters Title Header */}
      <div className="flex items-center gap-1.5 pb-3 border-b border-border/40 text-xs font-black uppercase tracking-wider text-foreground select-none">
        <Filter className="h-4 w-4 text-primary" />
        Filter Releases
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          Search Release
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2 rounded-input border border-border bg-surface/50 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold"
          />
        </div>
      </div>

      {/* Media Type Filters */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block select-none">
          Media Type
        </label>
        <div className="grid grid-cols-3 gap-1">
          {(["all", "movie", "tv"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ type: t })}
              className={`py-1.5 rounded-button border text-[9px] uppercase tracking-wider font-extrabold cursor-pointer transition-all ${
                filters.type === t
                  ? "bg-primary border-primary text-white shadow-sm"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : t === "movie" ? "Movies" : "TV"}
            </button>
          ))}
        </div>
      </div>

      {/* Scope Library Filters */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block select-none">
          Catalog Scope
        </label>
        <div className="flex flex-col gap-1.5 text-xs font-bold">
          <button
            onClick={() => onChange({ scope: "all" })}
            className={`w-full flex items-center justify-between p-2 rounded-button border text-left cursor-pointer transition-all ${
              filters.scope === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Layers className="h-3.5 w-3.5" />
              All Releases
            </span>
          </button>
          <button
            onClick={() => onChange({ scope: "library" })}
            className={`w-full flex items-center justify-between p-2 rounded-button border text-left cursor-pointer transition-all ${
              filters.scope === "library"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Clock className="h-3.5 w-3.5" />
              Only My Library
            </span>
          </button>
        </div>
      </div>

      {/* Time window Filters */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block select-none">
          Time Period
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {(["all", "upcoming", "today"] as const).map((timeVal) => (
            <button
              key={timeVal}
              onClick={() => onChange({ time: timeVal })}
              className={`w-full text-left p-2 rounded-button border text-xs font-bold cursor-pointer transition-all ${
                filters.time === timeVal
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {timeVal === "all"
                ? "All Calendar Events"
                : timeVal === "upcoming"
                  ? "Upcoming Only"
                  : "Released Today"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
export default ReleaseFilters
