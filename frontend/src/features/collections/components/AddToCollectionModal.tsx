import { useState } from "react"
import { Folder, X, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useCollections,
  useAddToCollection,
  useRemoveFromCollection,
  useCreateCollection,
  useMediaCollections,
} from "../hooks/useCollections"

interface AddToCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  mediaId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
}

export function AddToCollectionModal({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  title,
  posterPath,
}: AddToCollectionModalProps) {
  const { data: collections = [], isLoading } = useCollections()
  const { data: itemColIds = [] } = useMediaCollections(mediaId, mediaType)

  const addToCollection = useAddToCollection()
  const removeFromCollection = useRemoveFromCollection()
  const createCollection = useCreateCollection()

  const [newColName, setNewColName] = useState("")
  const [isCreatingInline, setIsCreatingInline] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleToggle = async (collectionId: string) => {
    const isAdded = itemColIds.includes(collectionId)
    if (isAdded) {
      await removeFromCollection.mutateAsync({ collectionId, mediaId, mediaType })
    } else {
      await addToCollection.mutateAsync({
        collectionId,
        mediaId,
        mediaType,
        title,
        posterPath,
      })
    }
  }

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newColName.trim()) {
      setError("Name is required.")
      return
    }

    try {
      // 1. Create collection
      const newCol = await createCollection.mutateAsync({
        name: newColName.trim(),
        description: null,
        color: "indigo",
        icon: "folder",
      })

      // 2. Add item to it
      await addToCollection.mutateAsync({
        collectionId: newCol.id,
        mediaId,
        mediaType,
        title,
        posterPath,
      })

      // 3. Reset state
      setNewColName("")
      setIsCreatingInline(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create collection."
      setError(message)
    }
  }

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm p-6 border border-border bg-surface rounded-card shadow-level-3 font-sans text-foreground animate-in fade-in zoom-in-95 duration-standard z-modal-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4">
          <div>
            <h3 className="font-heading text-base font-extrabold tracking-tight">
              Add to Collection
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 line-clamp-1">
              Organize "{title}" in your custom folders.
            </p>
          </div>

          {/* Collections List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin">
            {isLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-8 bg-skeleton rounded-button animate-pulse" />
                <div className="h-8 bg-skeleton rounded-button animate-pulse" />
              </div>
            ) : collections.length === 0 ? (
              <p className="text-[10px] text-muted-foreground font-semibold py-6 text-center">
                You have no collections yet.
              </p>
            ) : (
              collections.map((col) => {
                const isAdded = itemColIds.includes(col.id)
                const isPending = addToCollection.isPending || removeFromCollection.isPending

                return (
                  <button
                    key={col.id}
                    onClick={() => handleToggle(col.id)}
                    disabled={isPending}
                    className={`w-full flex items-center justify-between p-2.5 rounded-button border text-left cursor-pointer transition-all text-xs font-bold ${
                      isAdded
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-surface/50 border-border/60 text-foreground hover:bg-surface-hover hover:border-border"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{col.name}</span>
                    </span>
                    <span className="shrink-0 ml-2">
                      {isAdded ? (
                        <span className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-border/80" />
                      )}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          {/* Create New Collection Inline Form */}
          <div className="border-t border-border/40 pt-4">
            {isCreatingInline ? (
              <form onSubmit={handleCreateAndAdd} className="space-y-2 text-xs font-semibold">
                {error && <p className="text-error font-bold text-[10px]">{error}</p>}
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="New Collection name..."
                    className="h-8 text-xs font-sans flex-grow"
                    required
                    maxLength={30}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 font-bold text-xs"
                    disabled={createCollection.isPending}
                  >
                    Create
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-bold"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingInline(true)}
                className="w-full flex items-center justify-center gap-1.5 p-2 border border-dashed border-border/80 hover:border-foreground rounded-button text-[10px] font-extrabold cursor-pointer transition-colors text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New Collection
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default AddToCollectionModal
