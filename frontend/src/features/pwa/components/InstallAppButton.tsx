import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstallAppButtonProps {
  isInstallable: boolean
  onInstall: () => void
}

export function InstallAppButton({ isInstallable, onInstall }: InstallAppButtonProps) {
  if (!isInstallable) return null

  return (
    <Button
      onClick={onInstall}
      size="sm"
      className="flex items-center gap-1.5 text-xs font-bold shadow bg-primary hover:bg-primary/95 text-white transition-all duration-200"
      aria-label="Install CineVault App"
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}
export default InstallAppButton
