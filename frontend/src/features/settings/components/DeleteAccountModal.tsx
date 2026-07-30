import * as React from "react"
import { X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDeleteAccount } from "../hooks/useDeleteAccount"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = React.useState("")
  const modalRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const deleteMutation = useDeleteAccount()
  const isDeleting = deleteMutation.isPending

  // Focus modal container on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Keybind listeners: Escape closes dialog
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap implementation
  React.useEffect(() => {
    if (!isOpen) return
    const modalElement = modalRef.current
    if (!modalElement) return

    const focusableElements = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    modalElement.addEventListener("keydown", handleTabKey)
    return () => modalElement.removeEventListener("keydown", handleTabKey)
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setConfirmText("")
    onClose()
  }

  const handleDeleteClick = async () => {
    if (confirmText !== "DELETE") return
    try {
      await deleteMutation.mutateAsync()
      handleClose()
    } catch {
      // Errors handled inside the mutation hook toast
    }
  }

  return (
    <div
      className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-standard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md border border-error/30 bg-surface rounded-card p-6 shadow-level-3 space-y-6 focus:outline-none z-modal-content"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-error" />
            <h2
              id="delete-modal-title"
              className="font-heading text-base font-extrabold tracking-tight text-error"
            >
              Delete Account
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-button p-1 hover:bg-surface-hover hover:text-foreground text-muted-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 font-sans text-xs">
          <p className="font-bold text-foreground">
            This action is permanent and cannot be undone.
          </p>
          <div className="space-y-1.5 bg-error/5 border border-error/10 p-3.5 rounded-button text-muted-foreground font-semibold">
            <span className="text-[10px] font-black text-error uppercase tracking-wider block mb-1">
              The following data will be deleted forever:
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Library</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Watch History</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Episode Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Collections</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Collection Items</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Profile</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Preferences</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Wrapped Data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Statistics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Activity Timeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Recommendations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Uploaded Avatar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-error font-extrabold">✓</span>
                <span>Uploaded Banner</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 font-sans">
          <label
            htmlFor="confirm-delete-input"
            className="text-[11px] font-bold text-muted-foreground"
          >
            Type <span className="text-error font-black select-all">DELETE</span> to continue:
          </label>
          <input
            id="confirm-delete-input"
            ref={inputRef}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            disabled={isDeleting}
            className="w-full h-9 px-3 text-xs font-bold border border-border rounded-button bg-surface outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:border-error text-error"
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDeleteClick}
            disabled={confirmText !== "DELETE" || isDeleting}
            loading={isDeleting}
            className="bg-error hover:bg-error-hover text-white border-transparent"
          >
            Delete Forever
          </Button>
        </div>
      </div>
    </div>
  )
}
export default DeleteAccountModal
