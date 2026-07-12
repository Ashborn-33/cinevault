import { useState, useEffect } from "react"
import { Search, AlertCircle, RefreshCw, X, Film, Tv } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MediaCard, MediaCardSkeleton } from "@/components/ui/media-card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading"

import {
  useTrending,
  usePopularMovies,
  usePopularTV,
  useSearch,
  useGenres,
} from "../hooks/useMedia"

export function Discover() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Handle 300ms search input debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Queries
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    refetch: refetchTrending,
  } = useTrending()

  const {
    data: moviesData,
    isLoading: isMoviesLoading,
    isError: isMoviesError,
    refetch: refetchMovies,
  } = usePopularMovies()

  const {
    data: tvData,
    isLoading: isTVLoading,
    isError: isTVError,
    refetch: refetchTV,
  } = usePopularTV()

  const { data: genresData } = useGenres()

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearch(debouncedQuery)

  const isSearchActive = debouncedQuery.trim().length > 0

  const handleRetryAll = () => {
    if (isSearchActive) {
      refetchSearch()
    } else {
      refetchTrending()
      refetchMovies()
      refetchTV()
    }
  }

  const handleCardClick = (type: string, compoundId: string) => {
    const numericId = compoundId.split("-")[1]
    navigate(`/${type}/${numericId}`)
  }

  const renderSkeletons = (count = 6) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <MediaCardSkeleton key={idx} />
      ))}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 min-h-[calc(100vh-10rem)] pb-24 text-foreground bg-background">
      {/* 1. Title & Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Media
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse trending films, television series, and catalog items.
          </p>
        </div>

        {/* Debounced Search Box */}
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows, series..."
            className="pl-9 pr-9 w-full rounded-input border-border bg-surface text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Search media vault"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Search Results Grid (If active) */}
      {isSearchActive ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <h2 className="font-heading text-lg font-extrabold tracking-tight">
              Search Results for <span className="text-primary">"{debouncedQuery}"</span>
            </h2>
            {isSearchLoading && <LoadingSpinner size="sm" />}
          </div>

          {isSearchError && (
            <div
              className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 animate-in fade-in animate-out duration-medium"
              role="alert"
            >
              <AlertCircle className="h-10 w-10 text-error" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Couldn't load search results.</p>
                <p className="text-xs text-muted-foreground">
                  Please check your network and try again.
                </p>
              </div>
              <Button onClick={handleRetryAll} size="sm" className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Retry Search
              </Button>
            </div>
          )}

          {!isSearchError && isSearchLoading && renderSkeletons()}

          {!isSearchError &&
            !isSearchLoading &&
            (!searchData?.results || searchData.results.length === 0) && (
              <div className="flex flex-col items-center justify-center p-16 border border-border rounded-card text-center space-y-4 animate-in fade-in">
                <div className="flex gap-3">
                  <Film className="h-12 w-12 text-muted-foreground opacity-30" />
                  <Tv className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold">No media found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Try checking spelling or searching for another title.
                  </p>
                </div>
              </div>
            )}

          {!isSearchError && !isSearchLoading && searchData && searchData.results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in duration-medium">
              {searchData.results.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onClick={() => handleCardClick(item.type, item.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 3. Discover Landing page grids */
        <div className="space-y-12">
          {/* Genres Pills listing */}
          {genresData && genresData.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Browse Genres
              </span>
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-2 pb-1 font-sans">
                {genresData.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="px-3 py-1 text-xs hover:border-primary hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => setSearchQuery(genre.name)}
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Section: Trending items */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h2 className="font-heading text-xl font-extrabold tracking-tight">Trending Today</h2>
              {isTrendingError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchTrending()}
                  className="text-error flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>

            {isTrendingLoading && renderSkeletons()}

            {isTrendingError && !isTrendingLoading && (
              <div className="flex flex-col items-center justify-center p-8 border border-error/15 bg-error/5 rounded-card text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-error" />
                <p className="text-xs text-muted-foreground">Couldn't load trending data.</p>
                <Button variant="outline" size="sm" onClick={() => refetchTrending()}>
                  Retry
                </Button>
              </div>
            )}

            {!isTrendingLoading && !isTrendingError && trendingData && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in duration-medium">
                {trendingData.results.slice(0, 6).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onClick={() => handleCardClick(item.type, item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section: Popular Movies */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h2 className="font-heading text-xl font-extrabold tracking-tight">Popular Movies</h2>
              {isMoviesError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchMovies()}
                  className="text-error flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>

            {isMoviesLoading && renderSkeletons()}

            {isMoviesError && !isMoviesLoading && (
              <div className="flex flex-col items-center justify-center p-8 border border-error/15 bg-error/5 rounded-card text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-error" />
                <p className="text-xs text-muted-foreground">Couldn't load popular movies.</p>
                <Button variant="outline" size="sm" onClick={() => refetchMovies()}>
                  Retry
                </Button>
              </div>
            )}

            {!isMoviesLoading && !isMoviesError && moviesData && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in duration-medium">
                {moviesData.results.slice(0, 6).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onClick={() => handleCardClick(item.type, item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section: Popular TV Shows */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h2 className="font-heading text-xl font-extrabold tracking-tight">
                Popular TV Shows
              </h2>
              {isTVError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchTV()}
                  className="text-error flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              )}
            </div>

            {isTVLoading && renderSkeletons()}

            {isTVError && !isTVLoading && (
              <div className="flex flex-col items-center justify-center p-8 border border-error/15 bg-error/5 rounded-card text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-error" />
                <p className="text-xs text-muted-foreground">Couldn't load popular television.</p>
                <Button variant="outline" size="sm" onClick={() => refetchTV()}>
                  Retry
                </Button>
              </div>
            )}

            {!isTVLoading && !isTVError && tvData && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-in fade-in duration-medium">
                {tvData.results.slice(0, 6).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onClick={() => handleCardClick(item.type, item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
export default Discover
