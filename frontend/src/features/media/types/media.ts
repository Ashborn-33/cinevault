import type { Genre } from "@/features/discover"

export interface CastItem {
  id: number
  name: string
  character: string
  profile_path: string | null
}

export interface CrewItem {
  id: number
  name: string
  job: string
  department: string
}

export interface CreditsResult {
  cast: CastItem[]
  crew: CrewItem[]
}

export interface VideoItem {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface VideosResult {
  results: VideoItem[]
}

export interface ImageItem {
  file_path: string
  aspect_ratio: number
  width: number
  height: number
}

export interface ImagesResult {
  backdrops: ImageItem[]
  posters: ImageItem[]
}

export interface MovieDetails {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genres: Genre[]
  runtime: number | null
  status: string
  tagline: string | null
  budget: number
  revenue: number
  original_language: string
  production_countries: Array<{ iso_3166_1: string; name: string }>
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>
  homepage: string | null
}

export interface TVSeasonSummary {
  id: number
  season_number: number
  episode_count: number
  name: string
  poster_path: string | null
  air_date: string | null
}

export interface TVDetails {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  last_air_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genres: Genre[]
  episode_run_time: number[]
  status: string
  tagline: string | null
  number_of_episodes: number
  number_of_seasons: number
  original_language: string
  networks: Array<{ id: number; name: string; logo_path: string | null }>
  production_countries: Array<{ iso_3166_1: string; name: string }>
  production_companies: Array<{ id: number; name: string; logo_path: string | null }>
  homepage: string | null
  seasons: TVSeasonSummary[]
}

export interface TVEpisode {
  id: number
  name: string
  overview: string
  episode_number: number
  season_number: number
  air_date: string | null
  still_path: string | null
  vote_average: number
  vote_count: number
  runtime: number | null
}

export interface TVSeasonDetails {
  id: number
  name: string
  overview: string
  season_number: number
  poster_path: string | null
  episodes: TVEpisode[]
}
