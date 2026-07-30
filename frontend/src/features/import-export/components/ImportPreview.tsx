import { Film, Tv, Layers, Heart, AlertTriangle } from "lucide-react"
import type { ImportPreviewData } from "../types/import-export"

interface ImportPreviewProps {
  data: ImportPreviewData
}

export function ImportPreview({ data }: ImportPreviewProps) {
  return (
    <div className="space-y-5 text-left font-sans select-none">
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-wider text-primary">Import Preview</h4>
        <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
          Here is a summary of the records detected in your ZIP backup. Select options below to
          merge or skip duplicates.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface/30 p-3 rounded-card border border-border/80 flex flex-col justify-between shadow-sm">
          <Tv className="h-4 w-4 text-indigo-400" />
          <div className="mt-4">
            <span className="text-base font-black text-white">{data.totalShows}</span>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">
              TV Shows
            </div>
          </div>
        </div>

        <div className="bg-surface/30 p-3 rounded-card border border-border/80 flex flex-col justify-between shadow-sm">
          <Film className="h-4 w-4 text-purple-400" />
          <div className="mt-4">
            <span className="text-base font-black text-white">{data.totalEpisodes}</span>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">
              Episodes
            </div>
          </div>
        </div>

        <div className="bg-surface/30 p-3 rounded-card border border-border/80 flex flex-col justify-between shadow-sm">
          <Layers className="h-4 w-4 text-pink-400" />
          <div className="mt-4">
            <span className="text-base font-black text-white">{data.totalCollections}</span>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">
              Collections
            </div>
          </div>
        </div>

        <div className="bg-surface/30 p-3 rounded-card border border-border/80 flex flex-col justify-between shadow-sm">
          <Heart className="h-4 w-4 text-amber-400" />
          <div className="mt-4">
            <span className="text-base font-black text-white">{data.totalFavorites}</span>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">
              Favorites
            </div>
          </div>
        </div>
      </div>

      {(data.duplicateLibraryCount > 0 || data.duplicateProgressCount > 0) && (
        <div className="flex gap-2.5 p-3 rounded-card bg-amber-500/10 border border-amber-500/20 text-amber-400 items-start">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs font-bold leading-tight">
            <span>Overlapping Records Detected</span>
            <p className="text-[10px] text-amber-400/90 leading-relaxed font-semibold">
              We detected {data.duplicateLibraryCount} matching library statuses and{" "}
              {data.duplicateProgressCount} episode entries. Choose duplicate handling logic in the
              next options step.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
export default ImportPreview
