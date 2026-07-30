import { Download, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExport } from "../hooks/useExport"

export function ExportCard() {
  const { isExporting, error, triggerExport } = useExport()

  return (
    <div className="border border-border rounded-card p-6 bg-surface/30 space-y-4 font-sans text-left shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <h3 className="text-sm font-black uppercase tracking-wider">CineVault Backup</h3>
      </div>
      <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
        Export a complete archive containing your viewing progress, personal library statuses,
        preferences, and collections. Keep your history safe or migrate it between accounts.
      </p>

      {error && (
        <div className="flex gap-2 p-3 rounded-card bg-error/10 border border-error/20 text-error text-xs font-semibold items-center">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      <Button
        onClick={triggerExport}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Compiling Backup..." : "Export CineVault Backup"}
      </Button>
    </div>
  )
}
export default ExportCard
