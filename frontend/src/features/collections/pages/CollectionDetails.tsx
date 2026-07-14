import { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Folder,
  Heart,
  Film,
  Tv,
  Star,
  Flame,
  Trophy,
  Compass,
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Layers,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { tmdbClient } from "@/features/discover"
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
  useDuplicateCollection,
  useRemoveFromCollection,
} from "../hooks/useCollections"
import EditCollectionModal from "../components/EditCollectionModal"
import { StatisticsSkeleton } from "@/features/statistics/components/StatisticsSkeleton"

const COLOR_CLASSES: Record<string, string> = {
  indigo: "from-indigo-500/20 to-indigo-950/45 border-indigo-500/25 text-indigo-400",
  rose: "from-rose-500/20 to-rose-950/45 border-rose-500/25 text-rose-400",
  amber: "from-amber-500/20 to-amber-950/45 border-amber-500/25 text-amber-400",
  emerald: "from-emerald-500/20 to-emerald-950/45 border-emerald-500/25 text-emerald-400",
  violet: "from-violet-500/20 to-violet-950/45 border-violet-500/25 text-violet-400",
  blue: "from-blue-500/20 to-blue-950/45 border-blue-500/25 text-blue-400",
  cyan: "from-cyan-500/20 to-cyan-950/45 border-cyan-500/25 text-cyan-400",
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  heart: Heart,
  film: Film,
  tv: Tv,
  star: Star,
  flame: Flame,
  trophy: Trophy,
  compass: Compass,
}

export function CollectionDetails() {
  const { id = "" } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: collection, isLoading, isError, error, refetch } = useCollection(id)

  const updateCollection = useUpdateCollection()
  const deleteCollection = useDeleteCollection()
  const duplicateCollection = useDuplicateCollection()
  const removeFromCollection = useRemoveFromCollection()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"added" | "alphabetical">("added")

  const handleEditSubmit = async (updates: {
    name: string
    description: string | null
    color: string
    icon: string
  }) => {
    await updateCollection.mutateAsync({
      collectionId: id,
      updates,
    })
    setIsEditOpen(false)
  }

  const handleDelete = async () => {
    await deleteCollection.mutateAsync(id)
    navigate("/collections")
  }

  const handleDuplicate = async () => {
    if (!collection) return
    const cloned = await duplicateCollection.mutateAsync(id)
    navigate(`/collections/${cloned.id}`)
  }

  const handleRemoveItem = async (
    e: React.MouseEvent,
    mediaId: number,
    mediaType: "movie" | "tv"
  ) => {
    e.stopPropagation()
    await removeFromCollection.mutateAsync({
      collectionId: id,
      mediaId,
      mediaType,
    })
  }

  const items = useMemo(() => collection?.items || [], [collection?.items])

  // Filter & Sort Items
  const processedItems = useMemo(() => {
    // 1. Filter by search
    let list = items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

    // 2. Sort
    if (sortBy === "alphabetical") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    }

    return list
  }, [items, searchQuery, sortBy])

  // Stats calculation
  const stats = useMemo(() => {
    const movies = items.filter((i) => i.media_type === "movie").length
    const tvShows = items.filter((i) => i.media_type === "tv").length
    return { movies, tvShows }
  }, [items])

  if (isLoading) {
    return <StatisticsSkeleton />
  }

  if (isError || !collection) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-error">Failed to load collection details</h2>
        <p className="text-muted-foreground text-xs">{error?.message || "Collection not found."}</p>
        <Button onClick={() => refetch()} size="sm">
          Retry
        </Button>
      </div>
    )
  }

  const posterUrl = collection.cover_media_id
    ? collection.items.find((item) => item.media_id === collection.cover_media_id)?.poster_path
      ? tmdbClient.getImageUrl(
          collection.items.find((item) => item.media_id === collection.cover_media_id)!.poster_path!
        )
      : collection.items[0]?.poster_path
        ? tmdbClient.getImageUrl(collection.items[0].poster_path)
        : null
    : collection.items[0]?.poster_path
      ? tmdbClient.getImageUrl(collection.items[0].poster_path)
      : null

  const colColor = collection.color || "indigo"
  const themeClass = COLOR_CLASSES[colColor] || COLOR_CLASSES.indigo
  const IconComponent = ICON_MAP[collection.icon || "folder"] || Folder

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background font-sans">
      {/* Back link */}
      <button
        onClick={() => navigate("/collections")}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-extrabold cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collections
      </button>

      {/* Collection Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 p-6 border border-border bg-surface/50 rounded-card shadow-sm">
        {/* Cover Block */}
        <div className="w-full md:w-44 shrink-0 aspect-[16/10] md:aspect-[2/3] rounded-card overflow-hidden bg-zinc-900 border border-border/40 flex items-center justify-center relative select-none">
          {posterUrl ? (
            <img src={posterUrl} alt={collection.name} className="h-full w-full object-cover" />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${themeClass} flex items-center justify-center`}
            >
              <IconComponent className="h-10 w-10 text-foreground opacity-80 fill-current" />
            </div>
          )}
        </div>

        {/* Text detail & tools */}
        <div className="flex-grow flex flex-col justify-between space-y-4 md:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
                {collection.name}
              </h1>
              {collection.is_smart && (
                <span className="text-[9px] bg-primary/95 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Smart
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl font-semibold">
              {collection.description || "No description provided for this collection."}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5 p-1 px-2.5 bg-zinc-900/50 rounded-full border border-border/40">
              <Layers className="h-3.5 w-3.5" />
              {collection.items.length} {collection.items.length === 1 ? "Item" : "Items"}
            </span>
            <span className="flex items-center gap-1.5 p-1 px-2.5 bg-zinc-900/50 rounded-full border border-border/40">
              <Film className="h-3.5 w-3.5" />
              {stats.movies} {stats.movies === 1 ? "Movie" : "Movies"}
            </span>
            <span className="flex items-center gap-1.5 p-1 px-2.5 bg-zinc-900/50 rounded-full border border-border/40">
              <Tv className="h-3.5 w-3.5" />
              {stats.tvShows} {stats.tvShows === 1 ? "TV Show" : "TV Shows"}
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => setIsEditOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Collection
            </Button>
            <Button
              onClick={handleDuplicate}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-bold"
              disabled={duplicateCollection.isPending}
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button
              onClick={() => setIsDeleteConfirmOpen(true)}
              variant="destructive"
              size="sm"
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid & Controls */}
      <div className="space-y-4">
        {/* Controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by title..."
              className="w-full pl-9 pr-4 py-2 rounded-input border border-border bg-surface/50 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "added" | "alphabetical")}
              className="bg-surface border border-border rounded-button px-2.5 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer font-sans"
            >
              <option value="added">Recently Added</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Media Grid */}
        {processedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border/60 rounded-card bg-surface/10 text-center space-y-2">
            <Layers className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground font-bold">
              No matching collection items found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {processedItems.map((item) => {
              const url = item.poster_path ? tmdbClient.getImageUrl(item.poster_path) : null
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/${item.media_type}/${item.media_id}`)}
                  className="group relative flex flex-col border border-border/40 bg-surface/40 hover:bg-surface-hover/60 hover:border-border-hover rounded-card overflow-hidden cursor-pointer shadow-sm transition-all"
                >
                  {/* Poster cover */}
                  <div className="aspect-[2/3] w-full overflow-hidden bg-zinc-900 flex items-center justify-center border-b border-border/20 relative">
                    {url ? (
                      <img
                        src={url}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Film className="h-10 w-10 text-muted-foreground/35" />
                    )}

                    {/* Quick remove trigger overlay */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveItem(e, item.media_id, item.media_type)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-950/70 hover:bg-error text-foreground border border-border/40 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                      title="Remove from collection"
                      aria-label={`Remove ${item.title} from collection`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="p-2 flex-grow flex flex-col justify-between">
                    <h5 className="text-[10px] font-extrabold truncate w-full">{item.title}</h5>
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground font-black mt-0.5">
                      {item.media_type}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <EditCollectionModal
        key={collection?.id || "empty"}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        collection={collection}
        onSubmit={handleEditSubmit}
        isPending={updateCollection.isPending}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setIsDeleteConfirmOpen(false)}
          />
          <div className="relative w-full max-w-sm p-6 border border-border bg-surface rounded-card shadow-level-3 font-sans text-foreground animate-in fade-in zoom-in-95">
            <h3 className="font-heading text-base font-extrabold tracking-tight">
              Delete Collection
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-semibold">
              Are you sure you want to delete "{collection.name}"? This action is permanent and
              cannot be undone. Items inside the collection will not be removed from your personal
              library.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={deleteCollection.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteCollection.isPending}
              >
                {deleteCollection.isPending ? "Deleting..." : "Delete Collection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default CollectionDetails
