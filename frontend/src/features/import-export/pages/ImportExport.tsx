import { ShieldCheck } from "lucide-react"
import { ImportWizard } from "../components/ImportWizard"
import { ExportCard } from "../components/ExportCard"

export function ImportExport() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10 space-y-6 md:space-y-8 font-sans text-foreground">
      {/* 1. Header */}
      <div className="space-y-1 text-left border-b border-border/60 pb-6">
        <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight">
          Data Migration Hub
        </h1>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          Import your historical tracking lists or download a complete CineVault JSON archive
          backup.
        </p>
      </div>

      {/* 2. Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <ImportWizard />
        </div>

        <div className="space-y-6">
          <ExportCard />

          {/* Privacy Note */}
          <div className="border border-border rounded-card p-4 bg-surface/20 space-y-2.5 text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>100% Client-Side Encryption</span>
            </div>
            <p className="text-[9px] text-muted-foreground leading-relaxed font-semibold">
              All ZIP extraction, CSV column normalization, and JSON backups occur locally inside
              your browser cache. No files are ever sent to unverified remote servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ImportExport
