import { useEffect, useState } from "react"
import { Wifi, WifiOff, X } from "lucide-react"

interface OfflineBannerProps {
  isOnline: boolean
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  const [show, setShow] = useState(!isOnline)
  const [prevOnline, setPrevOnline] = useState(isOnline)

  // Synchronize state during render (standard React recommendation)
  if (isOnline !== prevOnline) {
    setPrevOnline(isOnline)
    setShow(true)
  }

  // Timer effect to automatically close banner when connection is restored
  useEffect(() => {
    if (show && isOnline) {
      const timer = setTimeout(() => setShow(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [show, isOnline])

  if (!show) return null

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-toast w-[90%] max-w-sm p-3 rounded-card border shadow-level-2 flex items-center justify-between font-sans text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-4 ${
        isOnline
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-error/10 border-error/30 text-error"
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 shrink-0" />
        ) : (
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
        )}
        <span className="leading-tight">
          {isOnline
            ? "Connection restored! You are back online."
            : "Offline mode. Browsing using local cached data."}
        </span>
      </div>
      <button
        onClick={() => setShow(false)}
        className="text-muted-foreground hover:text-foreground cursor-pointer outline-none shrink-0"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
export default OfflineBanner
