import { useState, useEffect } from "react"
import { useRegisterSW } from "virtual:pwa-register/react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Initialize state based on standalone mode query (avoids synchronous setState in effect)
  const [isInstallable, setIsInstallable] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.matchMedia("(display-mode: standalone)").matches
    }
    return false
  })

  // VitePWA's register hooks (removed unused setOfflineReady variable)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r)
    },
    onRegisterError(e) {
      console.error("SW Registration Error:", e)
    },
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  const update = async () => {
    await updateServiceWorker(true)
    setNeedRefresh(false)
  }

  return {
    isOnline,
    isInstallable,
    needRefresh,
    offlineReady,
    install,
    update,
    dismissUpdate: () => setNeedRefresh(false),
  }
}
export default usePWA
