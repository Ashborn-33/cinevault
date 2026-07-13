import { useState, useMemo, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Film, Tv, Compass, Search, Filter, ArrowUpDown, Heart, Bookmark, Play } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MediaCard, MediaCardSkeleton } from "@/components/ui/media-card"
import { useLibrary } from "../hooks/useLibrary"
import { useContinueWatching, useContinueWatchingShows } from "@/features/tracking"
import type { LibraryItem, LibraryStatus } from "../types/library"
import type { MediaItem, MediaStatus } from "@/components/ui/media-card"
import { tmdbClient } from "@/features/discover"

// Translate library status to MediaCard status
const mapStatus = (status: LibraryStatus): MediaStatus => {
  if (status === "planning") return "planned"
  if (status === "rewatching") return "watching"
  return status as MediaStatus
}

export function Library() {
  const navigate = useNavigate()
  const { data: libraryItems = [], isLoading, isError, refetch } = useLibrary()
  const { data: continueWatchingList = [], isLoading: isContinueLoading } = useContinueWatching()
  const { data: continueWatchingShows = [], isLoading: isContinueShowsLoading } =
    useContinueWatchingShows()

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("")
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "movie" | "tv">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | LibraryStatus>("all")
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [watchlistOnly, setWatchlistOnly] = useState(false)
  const [genreFilter, setGenreFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"recent" | "alpha" | "release" | "rating">("recent")

  // Helper to map LibraryItem to MediaItem
  const mapItem = useCallback((item: LibraryItem): MediaItem => {
    return {
      id: `${item.media_type}-${item.media_id}`,
      title: item.title,
      type: item.media_type as import("@/components/ui/media-card").MediaType,
      posterUrl: item.poster_path ? tmdbClient.getImageUrl(item.poster_path) : undefined,
      releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : 0,
      genres: item.genres || [],
      averageRating: item.rating || 0,
      status: mapStatus(item.status),
      isFavorite: item.favorite,
    }
  }, [])

  // Get all genres present in user's library items
  const allGenres = useMemo(() => {
    const genresSet = new Set<string>()
    libraryItems.forEach((item) => {
      item.genres?.forEach((g) => genresSet.add(g))
    })
    return Array.from(genresSet).sort()
  }, [libraryItems])

  // Filtered & Sorted list
  const processedItems = useMemo(() => {
    let items = [...libraryItems]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter((item) => item.title.toLowerCase().includes(q))
    }

    // 2. Media Type
    if (mediaTypeFilter !== "all") {
      items = items.filter((item) => item.media_type === mediaTypeFilter)
    }

    // 3. Status
    if (statusFilter !== "all") {
      items = items.filter((item) => item.status === statusFilter)
    }

    // 4. Favorites Only
    if (favoriteOnly) {
      items = items.filter((item) => item.favorite)
    }

    // 5. Watchlist Only
    if (watchlistOnly) {
      items = items.filter((item) => item.watchlist)
    }

    // 6. Genre
    if (genreFilter !== "all") {
      items = items.filter((item) => item.genres?.includes(genreFilter))
    }

    // 7. Sorting
    items.sort((a, b) => {
      if (sortBy === "alpha") {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === "release") {
        const yearA = a.release_date ? new Date(a.release_date).getTime() : 0
        const yearB = b.release_date ? new Date(b.release_date).getTime() : 0
        return yearB - yearA
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0)
      }
      // default: "recent" (created_at desc)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return items
  }, [
    libraryItems,
    searchQuery,
    mediaTypeFilter,
    statusFilter,
    favoriteOnly,
    watchlistOnly,
    genreFilter,
    sortBy,
  ])

  // Split into default dashboard sections if no filters are active
  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    mediaTypeFilter !== "all" ||
    statusFilter !== "all" ||
    favoriteOnly ||
    watchlistOnly ||
    genreFilter !== "all"

  const sections = useMemo(() => {
    if (isFilteringActive) return null

    return {
      watching: libraryItems.filter((i) => i.status === "watching").map(mapItem),
      planning: libraryItems.filter((i) => i.status === "planning").map(mapItem),
      completed: libraryItems.filter((i) => i.status === "completed").map(mapItem),
      favorites: libraryItems.filter((i) => i.favorite).map(mapItem),
      watchlist: libraryItems.filter((i) => i.watchlist).map(mapItem),
    }
  }, [libraryItems, isFilteringActive, mapItem])

  // Merged & Sorted Continue Watching List (Movie + TV Show)
  const mergedContinueWatching = useMemo(() => {
    const list = [...continueWatchingList, ...continueWatchingShows]
    list.sort((a, b) => {
      const timeA = a.last_watched_at ? new Date(a.last_watched_at).getTime() : 0
      const timeB = b.last_watched_at ? new Date(b.last_watched_at).getTime() : 0
      return timeB - timeA
    })
    return list.slice(0, 20)
  }, [continueWatchingList, continueWatchingShows])

  const renderGrid = (items: MediaItem[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          onClick={() => navigate(`/${item.type}/${item.id.split("-")[1]}`)}
        />
      ))}
    </div>
  )

  const renderContinueWatchingGrid = (rawItems: LibraryItem[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {rawItems.map((item) => {
        const mapped = mapItem(item)
        mapped.progress = {
          current: item.progress || 0,
          total: 100,
          type: "percent",
        }

        const lastWatchedDate = item.last_watched_at
          ? new Date(item.last_watched_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Recently"

        const isTv = item.media_type === "tv"
        const episodeText =
          isTv && item.current_season && item.current_episode
            ? `S${String(item.current_season).padStart(2, "0")}E${String(item.current_episode).padStart(2, "0")}`
            : null
        const episodeName = isTv ? item.last_episode_name : null

        return (
          <div key={item.id} className="space-y-2 group">
            <MediaCard
              item={mapped}
              onClick={() => navigate(`/${mapped.type}/${mapped.id.split("-")[1]}`)}
            />
            <div className="space-y-1 px-1 font-sans">
              {episodeText && (
                <div className="flex items-center justify-between text-[10px] font-extrabold text-primary">
                  <span>{episodeText}</span>
                  {episodeName && (
                    <span className="text-[10px] text-foreground font-semibold truncate max-w-[80px]">
                      {episodeName}
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold">
                <span>Last Watched:</span>
                <span className="text-foreground font-bold">{lastWatchedDate}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <MediaCardSkeleton key={idx} />
      ))}
    </div>
  )

  if (isLoading || isContinueLoading || isContinueShowsLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-[calc(100vh-10rem)]">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Your Library</h1>
        {renderSkeletons()}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md">
          <p className="text-sm font-bold text-error">Couldn't load library.</p>
          <Button onClick={() => refetch()} size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background">
      {/* 1. Header block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Personal Library
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Organize watch progress, custom folders, and tracking statuses.
          </p>
        </div>

        {/* Local Search */}
        <div className="relative w-full md:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items in library..."
            className="pl-9 pr-3 w-full rounded-input border-border bg-surface text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* 2. Filters Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border bg-surface/50 backdrop-blur-sm rounded-card text-xs font-semibold">
        {/* Type select */}
        <div className="space-y-1">
          <label className="text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Media Type
          </label>
          <select
            value={mediaTypeFilter}
            onChange={(e) => setMediaTypeFilter(e.target.value as "all" | "movie" | "tv")}
            className="w-full h-9 rounded-button border border-border bg-surface px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="all">All Content</option>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>
        </div>

        {/* Watch Status select */}
        <div className="space-y-1">
          <label className="text-muted-foreground">Watch Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | LibraryStatus)}
            className="w-full h-9 rounded-button border border-border bg-surface px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="dropped">Dropped</option>
            <option value="rewatching">Rewatching</option>
          </select>
        </div>

        {/* Genre select */}
        <div className="space-y-1">
          <label className="text-muted-foreground">Filter by Genre</label>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full h-9 rounded-button border border-border bg-surface px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="all">All Genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Sort select */}
        <div className="space-y-1">
          <label className="text-muted-foreground flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "alpha" | "release" | "rating")}
            className="w-full h-9 rounded-button border border-border bg-surface px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="alpha">Alphabetical</option>
            <option value="release">Newest Release</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Checkbox Toggles Row */}
        <div className="md:col-span-4 flex flex-wrap items-center gap-4 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              favoriteOnly
                ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${favoriteOnly ? "fill-current" : ""}`} />
            Favorites Only
          </button>

          <button
            type="button"
            onClick={() => setWatchlistOnly(!watchlistOnly)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              watchlistOnly
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${watchlistOnly ? "fill-current" : ""}`} />
            Watchlist Only
          </button>
        </div>
      </div>

      {/* 3. Render content layout */}
      {libraryItems.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-20 border border-border border-dashed rounded-card text-center space-y-6 animate-in fade-in">
          <div className="flex gap-4 opacity-35">
            <Film className="h-14 w-14 text-muted-foreground" />
            <Tv className="h-14 w-14 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Your library is empty
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm">
              Start searching for titles and add them to your personalized collection vault.
            </p>
          </div>
          <Button asChild className="flex items-center gap-2">
            <Link to="/discover">
              <Compass className="h-4 w-4" />
              Discover Something Amazing
            </Link>
          </Button>
        </div>
      ) : isFilteringActive ? (
        /* Filtered Grid Output */
        <div className="space-y-6">
          <div className="border-b border-border/60 pb-3 flex justify-between items-center">
            <h2 className="font-heading text-xl font-extrabold tracking-tight">Search Results</h2>
            <span className="text-xs text-muted-foreground font-semibold">
              {processedItems.length} {processedItems.length === 1 ? "title" : "titles"} matched
            </span>
          </div>

          {processedItems.length === 0 ? (
            <div className="p-12 border border-border rounded-card text-center text-xs text-muted-foreground">
              No library items match the active filters.
            </div>
          ) : (
            renderGrid(processedItems.map(mapItem))
          )}
        </div>
      ) : (
        /* Grouped Sections Dashboard */
        <div className="space-y-12 animate-in fade-in duration-medium font-sans">
          {/* 0. Continue Watching Progress list */}
          {mergedContinueWatching.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold border-b border-border/60 pb-2.5 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary fill-current" />
                Continue Watching
              </h2>
              {renderContinueWatchingGrid(mergedContinueWatching)}
            </div>
          )}

          {/* 1. Watching */}
          {sections && sections.watching.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold border-b border-border/60 pb-2.5">
                In Progress
              </h2>
              {renderGrid(sections.watching)}
            </div>
          )}

          {/* 2. Favorites */}
          {sections && sections.favorites.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold border-b border-border/60 pb-2.5 flex items-center gap-1.5">
                <Heart className="h-5 w-5 text-rose-500 fill-current" />
                Favorites
              </h2>
              {renderGrid(sections.favorites)}
            </div>
          )}

          {/* 3. Watchlist */}
          {sections && sections.watchlist.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold border-b border-border/60 pb-2.5 flex items-center gap-1.5">
                <Bookmark className="h-5 w-5 text-blue-500 fill-current" />
                Watchlist
              </h2>
              {renderGrid(sections.watchlist)}
            </div>
          )}

          {/* 4. Planning */}
          {sections && sections.planning.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold border-b border-border/60 pb-2.5">
                Plan to Watch
              </h2>
              {renderGrid(sections.planning)}
            </div>
          )}

          {/* 5. Completed */}
          {sections && sections.completed.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-extrabold border-b border-border/60 pb-2.5">
                Completed
              </h2>
              {renderGrid(sections.completed)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default Library
