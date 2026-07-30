import { useState } from "react"
import { Folder, Heart, Film, Tv, Star, Flame, Trophy, Compass, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Collection } from "../types/collections"

interface EditCollectionModalProps {
  collection: Collection | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (updates: {
    name: string
    description: string | null
    color: string
    icon: string
  }) => void
  isPending?: boolean
}

const COLORS = [
  { name: "Indigo", value: "indigo", hex: "#6366f1" },
  { name: "Rose", value: "rose", hex: "#f43f5e" },
  { name: "Amber", value: "amber", hex: "#f59e0b" },
  { name: "Emerald", value: "emerald", hex: "#10b981" },
  { name: "Violet", value: "violet", hex: "#8b5cf6" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Cyan", value: "cyan", hex: "#06b6d4" },
]

const ICONS = [
  { name: "Folder", value: "folder", icon: Folder },
  { name: "Heart", value: "heart", icon: Heart },
  { name: "Film", value: "film", icon: Film },
  { name: "Tv", value: "tv", icon: Tv },
  { name: "Star", value: "star", icon: Star },
  { name: "Flame", value: "flame", icon: Flame },
  { name: "Trophy", value: "trophy", icon: Trophy },
  { name: "Compass", value: "compass", icon: Compass },
]

export function EditCollectionModal({
  collection,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: EditCollectionModalProps) {
  const [name, setName] = useState(collection?.name || "")
  const [description, setDescription] = useState(collection?.description || "")
  const [color, setColor] = useState(collection?.color || "indigo")
  const [icon, setIcon] = useState(collection?.icon || "folder")
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !collection) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Name is required.")
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      color,
      icon,
    })
  }

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md p-6 border border-border bg-surface rounded-card shadow-level-3 font-sans text-foreground animate-in fade-in zoom-in-95 duration-standard z-modal-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-heading text-lg font-extrabold tracking-tight mb-4">
          Edit Collection Properties
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {error && <p className="text-error font-bold text-[11px]">{error}</p>}

          {/* Name Field */}
          <div className="space-y-1">
            <label htmlFor="edit-col-name" className="text-muted-foreground">
              Collection Name
            </label>
            <Input
              id="edit-col-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sci-Fi Favorites"
              className="w-full text-sm font-sans"
              maxLength={40}
              required
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label htmlFor="edit-col-desc" className="text-muted-foreground">
              Description (Optional)
            </label>
            <textarea
              id="edit-col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this collection..."
              className="w-full h-20 rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans"
              maxLength={200}
            />
          </div>

          {/* Color Picker Grid */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground">Thematic Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-7 w-7 rounded-full cursor-pointer transition-all border-2 ${
                    color === c.value
                      ? "border-foreground scale-110 shadow"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  title={c.name}
                  aria-label={`Select color ${c.name}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground">Collection Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {ICONS.map((i) => {
                const IconComponent = i.icon
                return (
                  <button
                    key={i.value}
                    type="button"
                    onClick={() => setIcon(i.value)}
                    className={`p-2 rounded-button border cursor-pointer transition-all flex items-center justify-center ${
                      icon === i.value
                        ? "border-primary bg-primary/10 text-primary scale-110 shadow"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                    title={i.name}
                    aria-label={`Select icon ${i.name}`}
                  >
                    <IconComponent className="h-3.5 w-3.5" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default EditCollectionModal
