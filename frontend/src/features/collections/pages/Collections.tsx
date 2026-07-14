import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { FolderPlus, Search, ArrowUpDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCollections, useCreateCollection } from "../hooks/useCollections"
import CollectionCard from "../components/CollectionCard"
import CreateCollectionModal from "../components/CreateCollectionModal"
import CollectionsSkeleton from "../components/CollectionsSkeleton"
import EmptyCollections from "../components/EmptyCollections"

export function Collections() {
  const navigate = useNavigate()
  const { data: collections = [], isLoading, isError, error, refetch } = useCollections()
  const createCollection = useCreateCollection()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"updated" | "created" | "alphabetical" | "items">("updated")
  const [filterType, setFilterType] = useState<"all" | "manual" | "smart">("all")

  const handleCreateSubmit = async (data: {
    name: string
    description: string | null
    color: string
    icon: string
  }) => {
    await createCollection.mutateAsync(data)
    setIsCreateOpen(false)
  }

  // Filter & Sort collections list
  const processedCollections = useMemo(() => {
    // 1. Filter by search & type
    let list = collections.filter((col) => {
      const matchSearch =
        col.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (col.description || "").toLowerCase().includes(searchQuery.toLowerCase())

      const matchType =
        filterType === "all" ||
        (filterType === "manual" && !col.is_smart) ||
        (filterType === "smart" && col.is_smart)

      return matchSearch && matchType
    })

    // 2. Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === "items") {
        return (b.items_count || 0) - (a.items_count || 0)
      }
      // Default: "updated"
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })

    return list
  }, [collections, searchQuery, sortBy, filterType])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6 min-h-[calc(100vh-10rem)] bg-background">
        <div className="h-10 w-44 bg-skeleton rounded animate-pulse" />
        <CollectionsSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-error">Failed to load collections</h2>
        <p className="text-muted-foreground text-xs">
          {error?.message || "Verify your connection."}
        </p>
        <Button onClick={() => refetch()} size="sm">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2 select-none">
            <Layers className="h-8 w-8 text-primary" />
            My Collections
          </h1>
          <p className="text-xs text-muted-foreground">
            Organize movies and TV shows into custom folders, boards, or playlists.
          </p>
        </div>
        {collections.length > 0 && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="flex items-center gap-1.5 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm"
          >
            <FolderPlus className="h-4 w-4" />
            Create Collection
          </Button>
        )}
      </div>

      {/* Empty State */}
      {collections.length === 0 ? (
        <EmptyCollections onCreateClick={() => setIsCreateOpen(true)} />
      ) : (
        <>
          {/* Controls filtering bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between border-b border-border/40 pb-4">
            {/* Left: Search input */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections..."
                className="w-full pl-9 pr-4 py-2 rounded-input border border-border bg-surface/50 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold"
              />
            </div>

            {/* Right: Filters & Sort selectors */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
              {/* Type filter */}
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground mr-1">Type:</span>
                {(["all", "manual", "smart"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-full border text-[10px] uppercase tracking-wider cursor-pointer transition-all ${
                      filterType === t
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Sorting selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "updated" | "created" | "alphabetical" | "items")
                  }
                  className="bg-surface border border-border rounded-button px-2.5 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="created">Recently Created</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="items">Most Items</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {processedCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 border border-dashed border-border/60 rounded-card bg-surface/10 text-center space-y-2">
              <Layers className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground font-bold">
                No collections match your filter parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {processedCollections.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  onClick={() => navigate(`/collections/${col.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <CreateCollectionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isPending={createCollection.isPending}
      />
    </div>
  )
}
export default Collections
