import { useParams, useNavigate } from "react-router-dom"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { MediaCard } from "@/components/ui/media-card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading"
import { tmdbClient } from "@/features/discover"

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

  const handleActionPlaceholder = (action: string) => {
    alert(`${action} is a placeholder and will be completed in Sprint: Library Features (CV-031).`)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Media details link copied to clipboard!")
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

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <Button
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => handleActionPlaceholder("Add to Library")}
              >
                <Plus className="h-4 w-4" />
                Add to Library
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => handleActionPlaceholder("Favorite")}
              >
                <Heart className="h-4 w-4" />
                Favorite
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => handleActionPlaceholder("Watchlist")}
              >
                <Bookmark className="h-4 w-4" />
                Watchlist
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
    </div>
  )
}
export default MediaDetails
