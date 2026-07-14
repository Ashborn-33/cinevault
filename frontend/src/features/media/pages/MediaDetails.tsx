import * as React from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Star,
  Heart,
  Clock,
  User,
  Share2,
  ExternalLink,
  Film,
  AlertCircle,
  RefreshCw,
  Plus,
  Bookmark,
  FolderPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { AddToCollectionModal } from "@/features/collections/components/AddToCollectionModal"
import { MediaCard } from "@/components/ui/media-card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading"
import { tmdbClient } from "@/features/discover"
import {
  useLibraryItem,
  useAddToLibrary,
  useRemoveFromLibrary,
  useToggleFavorite,
  useToggleWatchlist,
  useUpdateStatus,
} from "@/features/library"
import {
  TrackingService,
  ProgressModal,
  useStartWatching,
  useProgress,
  useRewatchMovie,
  useEpisodeProgress,
  useMarkEpisode,
  useMarkSeasonCompleted,
  useSeasonProgress,
  useShowProgress,
  useStartTVShow,
} from "@/features/tracking"

import {
  useMovieDetails,
  useTVDetails,
  useMovieCredits,
  useTVCredits,
  useMovieVideos,
  useTVVideos,
  useMovieRecommendations,
  useTVRecommendations,
  useMovieImages,
  useTVImages,
  useTVSeasonDetails,
} from "../hooks/useMediaDetails"
import type { MovieDetails, TVDetails } from "../types/media"

interface MediaDetailsProps {
  type: "movie" | "tv"
}

export function MediaDetails({ type }: MediaDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const mediaId = id || ""
  const isMovie = type === "movie"

  const [isProgressModalOpen, setIsProgressModalOpen] = React.useState(false)
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = React.useState(false)
  const [selectedSeason, setSelectedSeason] = React.useState<number>(1)

  // TMDB Queries
  const movieDetails = useMovieDetails(mediaId)
  const tvDetails = useTVDetails(mediaId)
  const movieCredits = useMovieCredits(mediaId)
  const tvCredits = useTVCredits(mediaId)
  const movieVideos = useMovieVideos(mediaId)
  const tvVideos = useTVVideos(mediaId)
  const movieRecommendations = useMovieRecommendations(mediaId)
  const tvRecommendations = useTVRecommendations(mediaId)
  const movieImages = useMovieImages(mediaId)
  const tvImages = useTVImages(mediaId)

  // TMDB Season episodes query (TV show only)
  const {
    data: seasonDetails,
    isLoading: isSeasonDetailsLoading,
    isError: isSeasonDetailsError,
  } = useTVSeasonDetails(mediaId, isMovie ? 0 : selectedSeason)

  // Library Queries & Mutations
  const { data: libraryItem, refetch: refetchLibraryItem } = useLibraryItem(mediaId, type)
  const addToLibraryMutation = useAddToLibrary()
  const removeFromLibraryMutation = useRemoveFromLibrary()
  const toggleFavoriteMutation = useToggleFavorite()
  const toggleWatchlistMutation = useToggleWatchlist()
  const updateStatusMutation = useUpdateStatus()

  // Watch Tracking Mutations (Movie)
  const startWatchingMutation = useStartWatching()
  const progressMutation = useProgress()
  const rewatchMutation = useRewatchMovie()

  // Watch Tracking Mutations & Queries (TV Show)
  const startTVShowMutation = useStartTVShow()
  const markEpisodeMutation = useMarkEpisode()
  const markSeasonCompletedMutation = useMarkSeasonCompleted()

  const { data: episodeProgress = [] } = useEpisodeProgress(mediaId, isMovie ? 0 : selectedSeason)
  const { data: seasonProgress } = useSeasonProgress(
    mediaId,
    isMovie ? 0 : selectedSeason,
    seasonDetails?.episodes?.length || 0
  )
  const { data: showProgress } = useShowProgress(
    mediaId,
    !isMovie && tvDetails.data ? (tvDetails.data as TVDetails).number_of_episodes : 0
  )

  const inLibrary = !!libraryItem
  const status = libraryItem?.status || "planning"
  const favorite = libraryItem?.favorite || false
  const watchlist = libraryItem?.watchlist || false

  const location = useLocation()
  const queryParams = React.useMemo(() => new URLSearchParams(location.search), [location.search])
  const paramSeason = queryParams.get("season")
  const paramEpisode = queryParams.get("episode")

  // Sync selected season once library details load or URL params exist
  React.useEffect(() => {
    if (paramSeason) {
      setTimeout(() => {
        setSelectedSeason(Number(paramSeason))
      }, 0)
    } else if (!isMovie && libraryItem?.current_season) {
      setTimeout(() => {
        setSelectedSeason(libraryItem.current_season as number)
      }, 0)
    }
  }, [isMovie, libraryItem?.current_season, paramSeason])

  // Scroll to active episode on load if specified in URL params
  React.useEffect(() => {
    if (paramEpisode && !isSeasonDetailsLoading && seasonDetails?.episodes) {
      setTimeout(() => {
        const element = document.getElementById(`episode-${paramEpisode}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          // Flash dynamic border highlight accent
          element.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background")
          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-primary",
              "ring-offset-2",
              "ring-offset-background"
            )
          }, 2500)
        }
      }, 300)
    }
  }, [paramEpisode, isSeasonDetailsLoading, seasonDetails?.episodes])

  // Tracking Helpers
  const canStart = isMovie && TrackingService.canStartWatching(libraryItem || null)
  const canContinue = isMovie && TrackingService.canContinueWatching(libraryItem || null)
  const canRewatch = isMovie && TrackingService.canRewatch(libraryItem || null)
  const progressPercent = isMovie ? TrackingService.getProgressPercentage(libraryItem || null) : 0

  const isWatching = isMovie
    ? libraryItem?.status === "watching"
    : libraryItem?.status === "watching"

  // TV Can start helper
  const canStartTV = !isMovie && TrackingService.canStartWatching(libraryItem || null)

  const detailsQuery = isMovie ? movieDetails : tvDetails
  const creditsQuery = isMovie ? movieCredits : tvCredits
  const videosQuery = isMovie ? movieVideos : tvVideos
  const recommendationsQuery = isMovie ? movieRecommendations : tvRecommendations
  const imagesQuery = isMovie ? movieImages : tvImages

  const isLoading = detailsQuery.isLoading
  const isError = detailsQuery.isError

  const handleRetry = () => {
    detailsQuery.refetch()
    creditsQuery.refetch()
    videosQuery.refetch()
    recommendationsQuery.refetch()
    imagesQuery.refetch()
    refetchLibraryItem()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-muted-foreground">Loading title details...</p>
        </div>
      </div>
    )
  }

  if (isError || !detailsQuery.data) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4 bg-background text-foreground">
        <div className="flex flex-col items-center justify-center p-12 border border-error/20 bg-error/5 rounded-card text-center space-y-4 max-w-md animate-in fade-in">
          <AlertCircle className="h-12 w-12 text-error" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Couldn't load this title.</h2>
            <p className="text-xs text-muted-foreground">
              We encountered an issue fetching data from the TMDB registry. Please check your
              credentials or connection.
            </p>
          </div>
          <Button onClick={handleRetry} size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Query
          </Button>
        </div>
      </div>
    )
  }

  const details = detailsQuery.data
  const credits = creditsQuery.data
  const videos = videosQuery.data
  const recommendations = recommendationsQuery.data
  const images = imagesQuery.data

  const title = isMovie ? (details as MovieDetails).title : (details as TVDetails).name
  const originalTitle = isMovie
    ? (details as MovieDetails).original_title
    : (details as TVDetails).original_name
  const tagline = details.tagline
  const overview = details.overview || "No overview summary is available for this title."
  const rating = details.vote_average || 0
  const voteCount = details.vote_count || 0
  const popularity = details.popularity || 0
  const homepage = details.homepage
  const originalLanguage = details.original_language?.toUpperCase() || "EN"

  const dateStr = isMovie
    ? (details as MovieDetails).release_date
    : (details as TVDetails).first_air_date
  const releaseYear = dateStr ? new Date(dateStr).getFullYear() : "TBA"

  const posterPath = tmdbClient.getImageUrl(details.poster_path)
  const backdropPath = tmdbClient.getImageUrl(details.backdrop_path, "backdrop")

  const trailerVideo = videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  )

  const keyCrew = credits?.crew
    ? credits.crew
        .filter((c) =>
          [
            "Director",
            "Writer",
            "Screenplay",
            "Producer",
            "Executive Producer",
            "Executive Creator",
          ].includes(c.job)
        )
        .slice(0, 4)
    : []

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Media details link copied to clipboard!")
  }

  const handleAddToLibrary = async () => {
    try {
      if (inLibrary) {
        await removeFromLibraryMutation.mutateAsync({ mediaId, mediaType: type })
      } else {
        await addToLibraryMutation.mutateAsync({
          media_id: mediaId,
          media_type: type,
          title,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          overview: details.overview,
          release_date: dateStr,
          genres: details.genres?.map((g) => g.name) || [],
          status: "planning",
        })
      }
    } catch (err) {
      console.error("Failed to alter library membership", err)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      if (inLibrary) {
        await toggleFavoriteMutation.mutateAsync({ mediaId, mediaType: type, favorite: !favorite })
      } else {
        await addToLibraryMutation.mutateAsync({
          media_id: mediaId,
          media_type: type,
          title,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          overview: details.overview,
          release_date: dateStr,
          genres: details.genres?.map((g) => g.name) || [],
          favorite: true,
        })
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err)
    }
  }

  const handleToggleWatchlist = async () => {
    try {
      if (inLibrary) {
        await toggleWatchlistMutation.mutateAsync({
          mediaId,
          mediaType: type,
          watchlist: !watchlist,
        })
      } else {
        await addToLibraryMutation.mutateAsync({
          media_id: mediaId,
          media_type: type,
          title,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          overview: details.overview,
          release_date: dateStr,
          genres: details.genres?.map((g) => g.name) || [],
          watchlist: true,
        })
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err)
    }
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await updateStatusMutation.mutateAsync({
        mediaId,
        mediaType: type,
        status: e.target.value as import("@/features/library").LibraryStatus,
      })
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleSaveProgress = async (newProgress: number) => {
    try {
      await progressMutation.mutateAsync({
        mediaId: Number(mediaId),
        progress: newProgress,
        expectedUpdatedAt: libraryItem?.updated_at || null,
      })
    } catch (err) {
      console.error("Progress update mutation failed", err)
    }
  }

  const isEpisodeWatched = (episodeNumber: number) => {
    return episodeProgress.some(
      (ep) => ep.episode_number === episodeNumber && ep.watch_status === "completed"
    )
  }

  const handleToggleEpisode = async (episode: import("@/features/media/types/media").TVEpisode) => {
    const watched = isEpisodeWatched(episode.episode_number)
    try {
      await markEpisodeMutation.mutateAsync({
        mediaId: Number(mediaId),
        season: selectedSeason,
        episode: episode.episode_number,
        name: episode.name,
        stillPath: episode.still_path,
        airDate: episode.air_date,
        runtime: episode.runtime || null,
        totalShowEpisodes: (details as TVDetails).number_of_episodes || 0,
        totalSeasonEpisodes: seasonDetails?.episodes?.length || 0,
        title,
        poster: details.poster_path,
        watched: !watched,
        expectedUpdatedAt: libraryItem?.updated_at || null,
      })
    } catch (err) {
      console.error("Episode status toggle failed", err)
    }
  }

  const handleMarkSeasonCompleted = async () => {
    if (!seasonDetails?.episodes) return
    const episodesData = seasonDetails.episodes.map(
      (ep: import("@/features/media/types/media").TVEpisode) => ({
        episode_number: ep.episode_number,
        episode_name: ep.name,
        still_path: ep.still_path,
        air_date: ep.air_date,
        runtime_minutes: ep.runtime || 0,
      })
    )

    try {
      await markSeasonCompletedMutation.mutateAsync({
        mediaId: Number(mediaId),
        season: selectedSeason,
        episodesData,
        totalShowEpisodes: (details as TVDetails).number_of_episodes || 0,
        totalSeasonEpisodes: seasonDetails.episodes.length,
        title,
        poster: details.poster_path,
        expectedUpdatedAt: libraryItem?.updated_at || null,
      })
    } catch (err) {
      console.error("Season completion failed", err)
    }
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-24 space-y-12">
      {/* 1. Hero Backdrop Header */}
      <div className="relative w-full md:h-[500px] h-[350px] overflow-hidden flex items-end">
        {backdropPath ? (
          <img
            src={backdropPath}
            alt={`${title} Backdrop`}
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-medium"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center opacity-40">
            <Film className="h-24 w-24 text-muted-foreground/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent hidden md:block" />

        <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-6 flex flex-col md:flex-row gap-6 md:items-end z-content">
          <div className="w-32 md:w-56 shrink-0 rounded-card overflow-hidden border border-border shadow-level-3 aspect-[2/3] bg-zinc-900 flex items-center justify-center self-center md:self-auto -mb-12 md:mb-0">
            {posterPath ? (
              <img
                src={posterPath}
                alt={`${title} Poster`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <Film className="h-12 w-12 text-muted-foreground/35" />
            )}
          </div>

          <div className="space-y-4 flex-grow text-center md:text-left self-center md:self-auto">
            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight">
                {title} <span className="text-muted-foreground font-semibold">({releaseYear})</span>
              </h1>
              {originalTitle && originalTitle !== title && (
                <p className="text-xs text-muted-foreground font-medium">
                  Original Title: {originalTitle}
                </p>
              )}
              {tagline && (
                <p className="text-xs md:text-sm text-primary font-semibold italic">"{tagline}"</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold">
              <Badge
                variant="secondary"
                className="flex items-center gap-0.5 text-amber-400 font-bold"
              >
                <Star className="h-3 w-3 fill-current" />
                {rating.toFixed(1)}
              </Badge>
              <Badge variant="outline">{isMovie ? "Movie" : "TV Show"}</Badge>
              <Badge variant="outline">{originalLanguage}</Badge>
              {isMovie ? (
                (details as MovieDetails).runtime && (
                  <Badge variant="outline" className="flex items-center gap-0.5 text-zinc-300">
                    <Clock className="h-3 w-3" />
                    {(details as MovieDetails).runtime}m
                  </Badge>
                )
              ) : (
                <Badge variant="outline">{(details as TVDetails).number_of_seasons} Seasons</Badge>
              )}
              <Badge variant="outline" className="text-muted-foreground">
                {details.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1 text-[11px] font-bold font-sans">
              {details.genres?.map((g) => (
                <Badge
                  key={g.id}
                  variant="outline"
                  className="hover:border-primary cursor-pointer transition-colors"
                >
                  {g.name}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              {/* Play / Progress tracking primary button (Movie only) */}
              {isMovie && (
                <>
                  {canStart && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none text-white font-bold"
                      onClick={() =>
                        startWatchingMutation.mutate({
                          mediaId: Number(mediaId),
                          title,
                          posterPath: details.poster_path,
                          backdropPath: details.backdrop_path,
                          overview: details.overview,
                          releaseDate: dateStr,
                          genres: details.genres?.map((g) => g.name) || [],
                          runtimeMinutes: (details as MovieDetails).runtime || 0,
                        })
                      }
                      loading={startWatchingMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                      Start Watching
                    </Button>
                  )}

                  {canContinue && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex items-center gap-1.5 font-bold"
                        onClick={() => setIsProgressModalOpen(true)}
                        loading={progressMutation.isPending}
                      >
                        Update Progress
                      </Button>
                      <Badge
                        variant="outline"
                        className="text-primary border-primary/30 font-sans font-bold"
                      >
                        {progressPercent}% Complete
                      </Badge>
                    </div>
                  )}

                  {canRewatch && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none text-white font-bold"
                      onClick={() => rewatchMutation.mutate({ mediaId: Number(mediaId) })}
                      loading={rewatchMutation.isPending}
                    >
                      Rewatch Movie
                    </Button>
                  )}
                </>
              )}

              {/* Play / Progress tracking primary button (TV Show only) */}
              {!isMovie && (
                <>
                  {canStartTV && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-none text-white font-bold"
                      onClick={() =>
                        startTVShowMutation.mutate({
                          mediaId: Number(mediaId),
                          title,
                          posterPath: details.poster_path,
                          backdropPath: details.backdrop_path,
                          overview: details.overview,
                          releaseDate: dateStr,
                          genres: details.genres?.map((g) => g.name) || [],
                        })
                      }
                      loading={startTVShowMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                      Start TV Show
                    </Button>
                  )}

                  {isWatching && (
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/30 font-sans font-bold"
                    >
                      {showProgress?.percentage || 0}% Complete
                    </Badge>
                  )}
                </>
              )}

              {/* Standard Library CRUD Controls */}
              <Button
                size="sm"
                variant={inLibrary ? "destructive" : "primary"}
                className="flex items-center gap-1.5"
                onClick={handleAddToLibrary}
                loading={addToLibraryMutation.isPending || removeFromLibraryMutation.isPending}
              >
                {inLibrary ? (
                  <>Remove from Library</>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to Library
                  </>
                )}
              </Button>

              {inLibrary && (isMovie || !isWatching) && (
                <div className="relative">
                  <select
                    value={status}
                    onChange={handleStatusChange}
                    className="h-9 rounded-button border border-border bg-surface px-3 py-1 text-xs font-semibold select-none outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-label="Change watch status"
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="planning">Planning</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                    <option value="rewatching">Rewatching</option>
                  </select>
                </div>
              )}

              <Button
                variant={favorite ? "primary" : "secondary"}
                size="sm"
                className={`flex items-center gap-1.5 ${favorite ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                onClick={handleToggleFavorite}
                loading={toggleFavoriteMutation.isPending}
                aria-label={favorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                {favorite ? "Favorited" : "Favorite"}
              </Button>

              <Button
                variant={watchlist ? "primary" : "secondary"}
                size="sm"
                className={`flex items-center gap-1.5 ${watchlist ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                onClick={handleToggleWatchlist}
                loading={toggleWatchlistMutation.isPending}
                aria-label={watchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                <Bookmark className={`h-4 w-4 ${watchlist ? "fill-current" : ""}`} />
                {watchlist ? "Watchlisted" : "Watchlist"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => setIsAddToCollectionOpen(true)}
              >
                <FolderPlus className="h-4 w-4" />
                Collection
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 md:pt-4">
        <div className="lg:col-span-2 space-y-12">
          {/* Seasons & Episodes section (TV Show only) */}
          {!isMovie && (
            <div className="space-y-6 border border-border p-6 rounded-card bg-surface/30 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-extrabold tracking-tight">
                    Seasons & Episodes
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select a season below to view episodes, track air dates, and log progress.
                  </p>
                </div>

                {/* Season Dropdown Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="h-9 rounded-button border border-border bg-surface px-3 py-1 text-xs font-semibold select-none outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-label="Select season"
                  >
                    {(details as TVDetails).seasons?.map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`} ({s.episode_count} eps)
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSeasonCompleted}
                    loading={markSeasonCompletedMutation.isPending}
                    disabled={!seasonDetails?.episodes || seasonProgress?.percentage === 100}
                    className="font-bold text-xs"
                  >
                    Mark Season Completed
                  </Button>
                </div>
              </div>

              {/* Progress Summary indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Season Progress */}
                <div className="space-y-2 border border-border/40 p-3 rounded-button bg-zinc-950/10">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground">Season Progress</span>
                    <span className="text-primary font-bold">
                      {seasonProgress?.percentage || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-standard"
                      style={{ width: `${seasonProgress?.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {seasonProgress?.watched || 0} of {seasonDetails?.episodes?.length || 0}{" "}
                    episodes watched ({seasonProgress?.remaining || 0} remaining)
                  </p>
                </div>

                {/* Overall Show Progress */}
                <div className="space-y-2 border border-border/40 p-3 rounded-button bg-zinc-950/10">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="text-accent font-bold">{showProgress?.percentage || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-standard"
                      style={{ width: `${showProgress?.percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {showProgress?.watched || 0} of {(details as TVDetails).number_of_episodes || 0}{" "}
                    episodes watched
                  </p>
                </div>
              </div>

              {/* Episode list */}
              {isSeasonDetailsLoading ? (
                <div className="flex items-center justify-center p-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : isSeasonDetailsError || !seasonDetails?.episodes ? (
                <div className="p-8 border border-error/15 bg-error/5 text-center rounded-button text-xs text-error">
                  Couldn't fetch episodes for this season.
                </div>
              ) : seasonDetails.episodes.length === 0 ? (
                <div className="p-8 border border-border border-dashed text-center rounded-button text-xs text-muted-foreground">
                  No episodes found.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  {seasonDetails.episodes.map(
                    (episode: import("@/features/media/types/media").TVEpisode) => {
                      const watched = isEpisodeWatched(episode.episode_number)
                      const stillUrl = episode.still_path
                        ? tmdbClient.getImageUrl(episode.still_path)
                        : undefined
                      const airDateFormatted = episode.air_date
                        ? new Date(episode.air_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBA"

                      return (
                        <div
                          key={episode.id}
                          id={`episode-${episode.episode_number}`}
                          className="flex gap-4 p-3 border border-border bg-surface/40 rounded-card hover:border-border-hover transition-colors font-sans"
                        >
                          {/* Episode Still thumbnail */}
                          <div className="h-16 w-24 shrink-0 rounded-button overflow-hidden bg-zinc-900 border border-border/40 aspect-video flex items-center justify-center">
                            {stillUrl ? (
                              <img
                                src={stillUrl}
                                alt={`S${selectedSeason}E${episode.episode_number} Still`}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Film className="h-6 w-6 text-muted-foreground/35" />
                            )}
                          </div>

                          {/* Title, runtime, and watched toggle */}
                          <div className="flex-grow space-y-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-bold truncate">
                                  E{episode.episode_number} -{" "}
                                  {episode.name || `Episode ${episode.episode_number}`}
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-semibold">
                                  {airDateFormatted}{" "}
                                  {episode.runtime ? `• ${episode.runtime}m` : ""}
                                </p>
                              </div>

                              {/* Watch Checkbox Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleEpisode(episode)}
                                disabled={markEpisodeMutation.isPending}
                                aria-label={`Mark episode ${episode.episode_number} as ${watched ? "unwatched" : "watched"}`}
                                className={`h-6 px-3 rounded-full border text-[10px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring select-none ${
                                  watched
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-surface border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${watched ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`}
                                />
                                {watched ? "Watched" : "Watch"}
                              </button>
                            </div>

                            <p className="text-[10px] text-muted-foreground line-clamp-2">
                              {episode.overview || "No overview available for this episode."}
                            </p>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-heading text-lg font-extrabold border-b border-border pb-2 tracking-tight">
              Overview
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-sans">{overview}</p>
          </div>

          {keyCrew.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-heading text-lg font-extrabold border-b border-border pb-2 tracking-tight">
                Key Contributors
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-sans">
                {keyCrew.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                      {c.job}
                    </p>
                    <p className="text-sm font-semibold">{c.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-heading text-lg font-extrabold border-b border-border pb-2 tracking-tight">
              Top Billed Cast
            </h3>
            {!credits?.cast || credits.cast.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No cast list is available for this title.
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin font-sans">
                {credits.cast.slice(0, 10).map((actor) => {
                  const profileUrl = tmdbClient.getImageUrl(actor.profile_path)
                  return (
                    <div
                      key={actor.id}
                      className="w-24 shrink-0 space-y-2 flex flex-col items-center text-center"
                    >
                      <div className="h-20 w-20 rounded-full overflow-hidden border border-border bg-zinc-900 flex items-center justify-center">
                        {profileUrl ? (
                          <img
                            src={profileUrl}
                            alt={actor.name}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold truncate w-24">{actor.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate w-24">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-lg font-extrabold border-b border-border pb-2 tracking-tight">
              Trailer
            </h3>
            {trailerVideo ? (
              <div className="aspect-video w-full rounded-card overflow-hidden border border-border shadow-sm">
                <iframe
                  src={`https://www.youtube.com/embed/${trailerVideo.key}`}
                  className="w-full h-full border-none"
                  allowFullScreen
                  title={`${title} Trailer`}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-card text-muted-foreground text-center space-y-2">
                <AlertCircle className="h-8 w-8 opacity-40" />
                <p className="text-xs">No trailer is currently available for this title.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-lg font-extrabold border-b border-border pb-2 tracking-tight">
              Gallery
            </h3>
            {!images?.backdrops || images.backdrops.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No gallery photos are available for this title.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.backdrops.slice(0, 6).map((img, idx) => {
                  const url = tmdbClient.getImageUrl(img.file_path, "backdrop")
                  return (
                    <div
                      key={idx}
                      className="rounded-card border border-border overflow-hidden bg-zinc-900 aspect-video shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`Gallery Backdrop ${idx}`}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-standard"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-card border border-border bg-surface p-6 space-y-6 shadow-sm">
            <h3 className="font-heading text-lg font-extrabold border-b border-border pb-2 tracking-tight">
              Facts
            </h3>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                  Status
                </span>
                <span className="text-sm font-semibold">{details.status}</span>
              </div>

              {isMovie ? (
                <>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                      Budget
                    </span>
                    <span className="text-sm font-semibold">
                      {(details as MovieDetails).budget
                        ? `$${(details as MovieDetails).budget.toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                      Revenue
                    </span>
                    <span className="text-sm font-semibold">
                      {(details as MovieDetails).revenue
                        ? `$${(details as MovieDetails).revenue.toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                      Seasons
                    </span>
                    <span className="text-sm font-semibold">
                      {(details as TVDetails).number_of_seasons}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                      Episodes
                    </span>
                    <span className="text-sm font-semibold">
                      {(details as TVDetails).number_of_episodes}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                      First Air Date
                    </span>
                    <span className="text-sm font-semibold">
                      {(details as TVDetails).first_air_date || "—"}
                    </span>
                  </div>
                </>
              )}

              <div className="space-y-0.5">
                <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                  Original Language
                </span>
                <span className="text-sm font-semibold">{originalLanguage}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                  Popularity Score
                </span>
                <span className="text-sm font-semibold">{popularity.toFixed(1)}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-muted-foreground uppercase font-bold tracking-wider block">
                  Vote count
                </span>
                <span className="text-sm font-semibold">{voteCount.toLocaleString()} votes</span>
              </div>

              {homepage && (
                <div className="space-y-0.5 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <a href={homepage} target="_blank" rel="noopener noreferrer">
                      Official Homepage
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-border/60 pt-10 space-y-6">
        <h3 className="font-heading text-xl font-extrabold tracking-tight">Recommendations</h3>
        {!recommendations?.results || recommendations.results.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No recommendations lists are available for this title.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {recommendations.results.slice(0, 6).map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/${item.type}/${item.id.split("-")[1]}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress update dialog modal overlay */}
      <ProgressModal
        key={isProgressModalOpen ? `open-${progressPercent}` : "closed"}
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        initialProgress={progressPercent}
        onSave={handleSaveProgress}
        isSaving={progressMutation.isPending}
        title={title}
      />

      <AddToCollectionModal
        isOpen={isAddToCollectionOpen}
        onClose={() => setIsAddToCollectionOpen(false)}
        mediaId={Number(mediaId)}
        mediaType={type}
        title={title || ""}
        posterPath={posterPath || null}
      />
    </div>
  )
}
export default MediaDetails
