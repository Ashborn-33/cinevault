import { useState } from "react"
import { useAuth } from "@/features/auth"
import { ExportService } from "../services/export.service"

export function useExport() {
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const triggerExport = async () => {
    if (!user) return
    setIsExporting(true)
    setError(null)
    try {
      await ExportService.generateBackup(user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsExporting(false)
    }
  }

  return {
    isExporting,
    error,
    triggerExport,
  }
}
export default useExport
