import { useNavigate } from "react-router-dom"
import { Layers } from "lucide-react"
import { usePinnedCollections } from "../hooks/useProfile"
import CollectionCard from "@/features/collections/components/CollectionCard"

export function PinnedCollections() {
  const { data: pinned = [], isLoading } = usePinnedCollections()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-3 font-sans">
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
          <Layers className="h-4 w-4 text-amber-400" />
          Pinned Collections
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-28 bg-skeleton rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (pinned.length === 0) return null

  return (
    <div className="space-y-3 font-sans">
      <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
        <Layers className="h-4 w-4 text-amber-400" />
        Pinned Collections
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pinned.map((col) => (
          <CollectionCard
            key={col.id}
            collection={col}
            onClick={() => navigate(`/collections/${col.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
export default PinnedCollections
