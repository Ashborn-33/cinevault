import { tmdbClient } from "../api/tmdb.client"
import { TMDB_ENDPOINTS } from "@/config/api"
import type { MediaItem, MediaType } from "@/components/ui/media-card"
import type {
  MovieDetails,
  TVDetails,
  Genre,
  TMDBMovie,
  TMDBTVShow,
  TMDBMediaItem,
} from "../types/discover"

let genreMapCache: Record<number, string> | null = null

export async function fetchGenreMap(): Promise<Record<number, string>> {
  if (genreMapCache) return genreMapCache

  try {
    const [movieGenres, tvGenres] = await Promise.all([
      tmdbClient.request<{ genres: Genre[] }>(TMDB_ENDPOINTS.GENRES_MOVIE),
      tmdbClient.request<{ genres: Genre[] }>(TMDB_ENDPOINTS.GENRES_TV),
    ])

    const map: Record<number, string> = {}
    movieGenres.genres.forEach((g) => (map[g.id] = g.name))
    tvGenres.genres.forEach((g) => (map[g.id] = g.name))

    genreMapCache = map
    return map
  } catch (err) {
    console.error("Failed to load genres map", err)
    return {}
  }
}

export function mapTMDBMovie(movie: TMDBMovie, genresMap: Record<number, string>): MediaItem {
  return {
    id: `movie-${movie.id}`,
    title: movie.title,
    type: "movie",
    posterUrl: tmdbClient.getImageUrl(movie.poster_path),
    releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
    genres: movie.genre_ids.map((id) => genresMap[id] || "").filter(Boolean),
    averageRating: movie.vote_average,
  }
}

export function mapTMDBTVShow(tv: TMDBTVShow, genresMap: Record<number, string>): MediaItem {
  return {
    id: `tv-${tv.id}`,
    title: tv.name,
    type: "tv",
    posterUrl: tmdbClient.getImageUrl(tv.poster_path),
    releaseYear: tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 0,
    genres: tv.genre_ids.map((id) => genresMap[id] || "").filter(Boolean),
    averageRating: tv.vote_average,
  }
}

export function mapTMDBMediaItem(
  item: TMDBMediaItem,
  genresMap: Record<number, string>
): MediaItem {
  const type: MediaType = item.media_type === "tv" ? "tv" : "movie"
  const title = item.title || item.name || "Untitled"
  const dateStr = item.release_date || item.first_air_date
  return {
    id: `${type}-${item.id}`,
    title,
    type,
    posterUrl: tmdbClient.getImageUrl(item.poster_path),
    releaseYear: dateStr ? new Date(dateStr).getFullYear() : 0,
    genres: item.genre_ids.map((id) => genresMap[id] || "").filter(Boolean),
    averageRating: item.vote_average,
  }
}

export const MediaService = {
  async getGenres(): Promise<Genre[]> {
    const movieRes = await tmdbClient.request<{ genres: Genre[] }>(TMDB_ENDPOINTS.GENRES_MOVIE)
    return movieRes.genres
  },

  async getTrending(page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
    const genresMap = await fetchGenreMap()
    const res = await tmdbClient.request<{ results: TMDBMediaItem[]; total_pages: number }>(
      TMDB_ENDPOINTS.TRENDING,
      { page }
    )
    return {
      results: res.results.map((item) => mapTMDBMediaItem(item, genresMap)),
      totalPages: res.total_pages,
    }
  },

  async getPopularMovies(page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
    const genresMap = await fetchGenreMap()
    const res = await tmdbClient.request<{ results: TMDBMovie[]; total_pages: number }>(
      TMDB_ENDPOINTS.POPULAR_MOVIES,
      { page }
    )
    return {
      results: res.results.map((item) => mapTMDBMovie(item, genresMap)),
      totalPages: res.total_pages,
    }
  },

  async getPopularTV(page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
    const genresMap = await fetchGenreMap()
    const res = await tmdbClient.request<{ results: TMDBTVShow[]; total_pages: number }>(
      TMDB_ENDPOINTS.POPULAR_TV,
      { page }
    )
    return {
      results: res.results.map((item) => mapTMDBTVShow(item, genresMap)),
      totalPages: res.total_pages,
    }
  },

  async searchMedia(
    query: string,
    page = 1
  ): Promise<{ results: MediaItem[]; totalPages: number }> {
    const genresMap = await fetchGenreMap()
    const res = await tmdbClient.request<{ results: TMDBMediaItem[]; total_pages: number }>(
      TMDB_ENDPOINTS.SEARCH,
      { query, page }
    )
    const validResults = res.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    )
    return {
      results: validResults.map((item) => mapTMDBMediaItem(item, genresMap)),
      totalPages: res.total_pages,
    }
  },

  async getMovieDetails(id: string | number): Promise<MovieDetails> {
    return tmdbClient.request<MovieDetails>(TMDB_ENDPOINTS.MOVIE_DETAILS(id))
  },

  async getTVDetails(id: string | number): Promise<TVDetails> {
    return tmdbClient.request<TVDetails>(TMDB_ENDPOINTS.TV_DETAILS(id))
  },

  async getUpcoming(page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
    const genresMap = await fetchGenreMap()
    const res = await tmdbClient.request<{ results: TMDBMovie[]; total_pages: number }>(
      TMDB_ENDPOINTS.UPCOMING,
      { page }
    )
    return {
      results: res.results.map((item) => mapTMDBMovie(item, genresMap)),
      totalPages: res.total_pages,
    }
  },

  async getNowPlaying(page = 1): Promise<{ results: MediaItem[]; totalPages: number }> {
    const genresMap = await fetchGenreMap()
    const res = await tmdbClient.request<{ results: TMDBMovie[]; total_pages: number }>(
      TMDB_ENDPOINTS.NOW_PLAYING,
      { page }
    )
    return {
      results: res.results.map((item) => mapTMDBMovie(item, genresMap)),
      totalPages: res.total_pages,
    }
  },
}
