import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { ImportService } from "../services/import.service"
import type { ImportProvider } from "../providers/ImportProvider"
import type {
  ImportParsedData,
  ImportPreviewData,
  ImportSummaryData,
  ImportOptions,
} from "../types/import-export"

export function useImport() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  const [step, setStep] = useState(1) // 1: Choose Source, 2: Upload, 3: Validation, 4: Preview, 5: Options, 6: Progress, 7: Completed
  const [provider, setProvider] = useState<ImportProvider | null>(null)
  const [parsedData, setParsedData] = useState<ImportParsedData | null>(null)
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null)
  const [summaryData, setSummaryData] = useState<ImportSummaryData | null>(null)

  const [taskName, setTaskName] = useState("")
  const [progressPct, setProgressPct] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Handle uploaded ZIP file
  const handleZipUpload = async (file: File) => {
    setError(null)
    setStep(3) // Validation step
    try {
      const files = await ImportService.extractZipFile(file)

      const detected = await ImportService.detectProvider(files)
      if (!detected) {
        throw new Error("Unsupported ZIP structure. No matching data provider headers found.")
      }
      setProvider(detected)

      // Automatically parse CSV datasets
      const parsed = await detected.parse(files)
      setParsedData(parsed)

      // Fetch preview conflicts metrics
      const preview = await detected.preview(userId, parsed)
      setPreviewData(preview)

      setStep(4) // Move to Preview step
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStep(2) // Fall back to upload
    }
  }

  // Execute import process
  const executeImport = async (options: ImportOptions) => {
    if (!provider || !parsedData) return
    setError(null)
    setStep(6) // Progress step
    setTaskName("Initializing database synchronization...")
    setProgressPct(5)
    setElapsedTime(0)

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    try {
      const summary = await provider.import(userId, parsedData, options, (task, pct) => {
        setTaskName(task)
        setProgressPct(pct)
      })

      clearInterval(timer)
      queryClient.invalidateQueries()
      setSummaryData(summary)
      setStep(7) // Completed step
    } catch (err) {
      clearInterval(timer)
      setError(err instanceof Error ? err.message : String(err))
      setStep(5) // Fall back to options
    }
  }

  const reset = () => {
    setStep(1)
    setProvider(null)
    setParsedData(null)
    setPreviewData(null)
    setSummaryData(null)
    setTaskName("")
    setProgressPct(0)
    setError(null)
    setElapsedTime(0)
  }

  return {
    step,
    setStep,
    provider,
    previewData,
    summaryData,
    taskName,
    progressPct,
    elapsedTime,
    error,
    handleZipUpload,
    executeImport,
    reset,
  }
}
export default useImport
