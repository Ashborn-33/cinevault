import { CheckCircle2, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ImportSummaryData } from "../types/import-export"

interface ImportSummaryProps {
  data: ImportSummaryData
  onClose: () => void
}

export function ImportSummary({ data, onClose }: ImportSummaryProps) {
  const handleDownloadReport = () => {
    const blob = new Blob([data.report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `cinevault-import-report-${new Date().toISOString().split("T")[0]}.txt`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 text-left font-sans select-none">
      <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-card shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0 animate-pulse" />
        <div className="space-y-1">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
            Import Completed
          </span>
          <h4 className="text-base font-black text-white">Data Migration Successful</h4>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-surface/30 p-3 rounded-card border border-border/80 shadow-sm">
          <div className="text-base font-black text-emerald-400">{data.importedCount}</div>
          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-wide">
            Imported
          </div>
        </div>

        <div className="bg-surface/30 p-3 rounded-card border border-border/80 shadow-sm">
          <div className="text-base font-black text-amber-400">{data.skippedCount}</div>
          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-wide">
            Skipped
          </div>
        </div>

        <div className="bg-surface/30 p-3 rounded-card border border-border/80 shadow-sm">
          <div className="text-base font-black text-error">{data.failedCount}</div>
          <div className="text-[8px] font-black text-muted-foreground uppercase tracking-wide">
            Failed
          </div>
        </div>
      </div>

      {/* Detailed breakdown list */}
      <div className="border border-border/60 rounded-card p-4 bg-zinc-950/10 space-y-2.5 text-xs font-semibold text-muted-foreground">
        <span className="text-[10px] font-black uppercase text-foreground tracking-wider block border-b border-border/40 pb-1.5">
          Detailed Summary Breakdown
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold">
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Movies Imported:</span>
            <span className="text-white">{data.importedMovies ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Shows Imported:</span>
            <span className="text-white">{data.importedShows ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Episodes Imported:</span>
            <span className="text-white">{data.importedEpisodes ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Watch History Logged:</span>
            <span className="text-white">{data.importedHistory ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Collections Imported:</span>
            <span className="text-white">{data.importedCollections ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Favorites Imported:</span>
            <span className="text-white">{data.importedFavorites ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Ratings Imported:</span>
            <span className="text-white">{data.importedRatings ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Reactions Imported:</span>
            <span className="text-white">{data.importedReactions ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Achievements Mapped:</span>
            <span className="text-white">{data.mappedAchievements ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>TMDB Matches:</span>
            <span className="text-emerald-400">+{data.tmdbMatches ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>TMDB Not Found:</span>
            <span className="text-amber-500">{data.tmdbNotFound ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1">
            <span>Duplicates Skipped:</span>
            <span className="text-amber-500">{data.duplicatesSkipped ?? 0}</span>
          </div>
          <div className="flex justify-between border-b border-border/20 pb-1 sm:col-span-2">
            <span>Elapsed Time:</span>
            <span className="text-white">{data.elapsedTime ?? 0}s</span>
          </div>
        </div>
      </div>

      {/* Verification status checks */}
      {data.verificationReport && (
        <div
          className={`p-3 rounded-card text-[10px] font-bold border leading-relaxed ${
            data.verificationStatus === "Verified"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}
        >
          <p className="whitespace-pre-line leading-relaxed">{data.verificationReport}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleDownloadReport}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button
          onClick={onClose}
          type="button"
          variant="outline"
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Close Wizard
        </Button>
      </div>
    </div>
  )
}
export default ImportSummary
