import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Upload, ChevronRight, AlertCircle, ArrowLeft, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useImport } from "../hooks/useImport"
import { ImportProviderCard } from "./ImportProviderCard"
import { ImportPreview } from "./ImportPreview"
import { ImportProgress } from "./ImportProgress"
import { ImportSummary } from "./ImportSummary"
import type { ImportOptions } from "../types/import-export"

export function ImportWizard() {
  const queryClient = useQueryClient()
  const {
    step,
    setStep,
    previewData,
    summaryData,
    taskName,
    progressPct,
    elapsedTime,
    error,
    handleZipUpload,
    executeImport,
    reset,
  } = useImport()

  const [selectedProviderId, setSelectedProviderId] = useState<string>("tvtime")
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local state for import configuration options
  const [options, setOptions] = useState<ImportOptions>({
    importLibrary: true,
    importProgress: true,
    importWatchHistory: true,
    importCollections: true,
    importFavorites: true,
    duplicateHandling: "skip",
  })

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleZipUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleZipUpload(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleClose = () => {
    queryClient.invalidateQueries()
    reset()
  }

  return (
    <div className="border border-border rounded-card bg-surface/30 p-6 space-y-6 font-sans text-left shadow-sm">
      {/* Step header progress status indicators */}
      {step < 6 && (
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground tracking-wider pb-2 border-b border-border/40">
          <span className={step >= 1 ? "text-primary" : ""}>Source Selection</span>
          <ChevronRight className="h-3 w-3" />
          <span className={step >= 2 ? "text-primary" : ""}>Upload Archive</span>
          <ChevronRight className="h-3 w-3" />
          <span className={step >= 4 ? "text-primary" : ""}>Preview Details</span>
          <ChevronRight className="h-3 w-3" />
          <span className={step >= 5 ? "text-primary" : ""}>Configuration</span>
        </div>
      )}

      {/* STEP 1: Choose Source */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider">Choose Import Source</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Select the tracking provider you want to import your historical viewing statistics
              from.
            </p>
          </div>

          <div className="space-y-2.5">
            <ImportProviderCard
              name="TV Time GDPR Export"
              description="Upload your TV Time database. CineVault automatically imports series collections and episode statuses."
              selected={selectedProviderId === "tvtime"}
              onClick={() => setSelectedProviderId("tvtime")}
            />
            <ImportProviderCard
              name="Trakt.tv Sync"
              description="Import watchlists, history logs, and movie collections from your Trakt account."
              selected={selectedProviderId === "trakt"}
              onClick={() => setSelectedProviderId("trakt")}
              disabled
            />
            <ImportProviderCard
              name="IMDb List Backup"
              description="Import ratings, watchlists, and checklists exported from your IMDb account."
              selected={selectedProviderId === "imdb"}
              onClick={() => setSelectedProviderId("imdb")}
              disabled
            />
          </div>

          <Button onClick={() => setStep(2)} className="w-full text-xs font-bold gap-1">
            Continue to Upload
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* STEP 2: Upload ZIP */}
      {step === 2 && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(1)}
            type="button"
            className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground outline-none cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider">Upload GDPR Archive</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Drop the raw GDPR export ZIP file received from TV Time below.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 min-h-[180px] ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border/80 bg-surface/20 hover:border-muted-foreground/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <span className="text-xs font-bold text-foreground">
              {dragActive ? "Drop the ZIP here" : "Drag and drop export ZIP, or browse"}
            </span>
            <span className="text-[10px] text-muted-foreground/80 mt-1.5 font-semibold">
              Supports official TV Time GDPR package
            </span>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-card bg-error/10 border border-error/20 text-error text-xs font-semibold items-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Validation (Loading ZIP) */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center min-h-[220px]">
          <div className="h-8 w-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-foreground">Decompressing Export...</span>
            <p className="text-[10px] text-muted-foreground font-semibold">
              Unpacking files and detecting structure parameters...
            </p>
          </div>
        </div>
      )}

      {/* STEP 4: Preview parsed results */}
      {step === 4 && previewData && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(2)}
            type="button"
            className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground outline-none cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Reupload File
          </button>

          <ImportPreview data={previewData} />

          <Button onClick={() => setStep(5)} className="w-full text-xs font-bold gap-1">
            Configure Import Options
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* STEP 5: Import configuration choices */}
      {step === 5 && previewData && (
        <div className="space-y-5">
          <button
            onClick={() => setStep(4)}
            type="button"
            className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground outline-none cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider">Configure Data Options</h3>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Select which categories of logs you want to transfer into CineVault.
            </p>
          </div>

          <div className="space-y-3 bg-surface/30 p-4 rounded-card border border-border/80 shadow-sm text-xs font-semibold text-muted-foreground">
            {/* Options Deck */}
            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={options.importLibrary}
                onChange={(e) => setOptions({ ...options, importLibrary: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
              />
              <span className="text-foreground">
                Import Library Statuses ({previewData.totalShows} shows)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={options.importProgress}
                onChange={(e) => setOptions({ ...options, importProgress: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
              />
              <span className="text-foreground">
                Import Episode Progress ({previewData.totalEpisodes} episodes)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={options.importCollections}
                onChange={(e) => setOptions({ ...options, importCollections: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
              />
              <span className="text-foreground">
                Import Playlists & Collections ({previewData.totalCollections} lists)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
              <input
                type="checkbox"
                checked={options.importFavorites}
                onChange={(e) => setOptions({ ...options, importFavorites: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5"
              />
              <span className="text-foreground">
                Preserve Favorite Flags ({previewData.totalFavorites} flags)
              </span>
            </label>
          </div>

          {/* Conflict detection option dropdown selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider block">
              Duplicate Records Resolution
            </label>
            <select
              value={options.duplicateHandling}
              onChange={(e) =>
                setOptions({
                  ...options,
                  duplicateHandling: e.target.value as "skip" | "merge" | "replace",
                })
              }
              className="w-full bg-surface border border-border/80 p-2.5 rounded-button text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="skip">
                Skip overlaps (Recommended - Keeps existing database entries)
              </option>
              <option value="merge">Merge flags (Combines ratings and favorite tags)</option>
              <option value="replace">
                Overwrite local data (Replaces with imported statuses)
              </option>
            </select>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-card bg-error/10 border border-error/20 text-error text-xs font-semibold items-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          <Button
            onClick={() => executeImport(options)}
            className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Layers className="h-4 w-4" />
            Start Sync Migration
          </Button>
        </div>
      )}

      {/* STEP 6: Progress animation */}
      {step === 6 && (
        <ImportProgress taskName={taskName} progressPct={progressPct} elapsedTime={elapsedTime} />
      )}

      {/* STEP 7: Completed summary report */}
      {step === 7 && summaryData && <ImportSummary data={summaryData} onClose={handleClose} />}
    </div>
  )
}
export default ImportWizard
