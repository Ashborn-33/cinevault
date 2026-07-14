import { FolderPlus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyCollectionsProps {
  onCreateClick: () => void
}

export function EmptyCollections({ onCreateClick }: EmptyCollectionsProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/80 rounded-card bg-surface/20 min-h-[350px] font-sans">
      <div className="p-4 bg-zinc-950/40 rounded-full border border-border/60 shadow mb-4 text-muted-foreground">
        <FolderPlus className="h-10 w-10 opacity-75" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-extrabold tracking-tight">No collections yet</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Create a custom collection to group your favorite movies, seasons, TV shows, and thematic
          watch folders.
        </p>
      </div>

      <Button
        onClick={onCreateClick}
        className="mt-6 flex items-center gap-1.5 text-xs font-bold shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Create Collection
      </Button>
    </div>
  )
}
export default EmptyCollections
