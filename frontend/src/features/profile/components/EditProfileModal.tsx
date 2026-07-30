import { useState } from "react"
import { X, Upload, Check, Layers, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCollections } from "@/features/collections/hooks/useCollections"
import { ProfileService } from "../services/profile.service"
import type { UserProfile } from "../types/profile"

interface EditProfileModalProps {
  profile: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<UserProfile>) => void
  isPending: boolean
}

const COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Slate", hex: "#64748b" },
]

export function EditProfileModal({
  profile,
  isOpen,
  onClose,
  onSave,
  isPending,
}: EditProfileModalProps) {
  const { data: collections = [] } = useCollections()

  const [bio, setBio] = useState(profile?.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || "")
  const [favColor, setFavColor] = useState(profile?.favorite_color || "#7C3AED")
  const [pinned, setPinned] = useState<string[]>(profile?.pinned_collections || [])

  const [avatarUploading, setAvatarUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !profile) return null

  // File Upload Handlers
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setError(null)
    try {
      const url = await ProfileService.uploadAvatar(profile.user_id, file)
      setAvatarUrl(url)
    } catch (err) {
      console.error(err)
      setError("Failed to upload avatar image.")
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    setError(null)
    try {
      const url = await ProfileService.uploadBanner(profile.user_id, file)
      setBannerUrl(url)
    } catch (err) {
      console.error(err)
      setError("Failed to upload banner image.")
    } finally {
      setBannerUploading(false)
    }
  }

  // Pin Collection Toggle
  const handleTogglePin = (colId: string) => {
    if (pinned.includes(colId)) {
      setPinned(pinned.filter((id) => id !== colId))
    } else {
      if (pinned.length >= 4) {
        setError("You can only pin up to 4 collections.")
        return
      }
      setPinned([...pinned, colId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      banner_url: bannerUrl.trim() || null,
      favorite_color: favColor,
      pinned_collections: pinned,
    })
  }

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg p-6 border border-border bg-surface rounded-card shadow-level-3 font-sans text-foreground max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-standard z-modal-content">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-heading text-lg font-extrabold tracking-tight mb-4">
          Edit Profile Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          {error && <p className="text-error font-bold text-[11px]">{error}</p>}

          {/* Bio Field */}
          <div className="space-y-1">
            <label htmlFor="prof-bio" className="text-muted-foreground">
              About Bio
            </label>
            <textarea
              id="prof-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other viewers about yourself..."
              className="w-full h-16 rounded-input border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans"
              maxLength={160}
            />
          </div>

          {/* Avatar Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Avatar Image</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="URL e.g. https://..."
                  className="text-xs font-sans w-full"
                />
                <label className="flex items-center justify-center px-3 border border-border bg-zinc-950/40 rounded-button cursor-pointer hover:bg-zinc-900 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                </label>
              </div>
              {avatarUploading && <p className="text-[9px] text-primary">Uploading image...</p>}
            </div>

            {/* Banner Fields */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground">Banner Background Image</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="URL e.g. https://..."
                  className="text-xs font-sans w-full"
                />
                <label className="flex items-center justify-center px-3 border border-border bg-zinc-950/40 rounded-button cursor-pointer hover:bg-zinc-900 transition-colors">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFile}
                    className="hidden"
                    disabled={bannerUploading}
                  />
                </label>
              </div>
              {bannerUploading && <p className="text-[9px] text-primary">Uploading image...</p>}
            </div>
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground">Profile Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setFavColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-7 w-7 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center ${
                    favColor === c.hex
                      ? "border-foreground scale-110 shadow-md"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  title={c.name}
                  aria-label={`Select color ${c.name}`}
                >
                  {favColor === c.hex && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pin Collections selection list */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-muted-foreground">Pinned Collections (Max 4)</label>
              <span className="text-[10px] text-muted-foreground font-black">
                {pinned.length} / 4 Pinned
              </span>
            </div>
            {collections.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic">
                Create collections first in the library to pin them here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/40 bg-zinc-950/20 rounded-card p-3 max-h-36 overflow-y-auto">
                {collections.map((col) => {
                  const isChecked = pinned.includes(col.id)
                  const isDisabled = !isChecked && pinned.length >= 4

                  return (
                    <button
                      key={col.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleTogglePin(col.id)}
                      className={`flex items-center justify-between p-2 rounded-button border text-left cursor-pointer transition-all ${
                        isChecked
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-surface border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate text-[11px] font-bold">
                        <Layers className="h-3.5 w-3.5 shrink-0" />
                        {col.name}
                      </span>
                      {isChecked && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending || avatarUploading || bannerUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || avatarUploading || bannerUploading}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default EditProfileModal
