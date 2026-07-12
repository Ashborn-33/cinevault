export interface Genre {
  id: number
  name: string
}

export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
}

export interface TMDBTVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
}

export interface TMDBMediaItem {
  id: number
  media_type: "movie" | "tv"
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  genre_ids: number[]
  overview: string
}

export interface MovieDetails extends TMDBMovie {
  genres: Genre[]
  runtime: number | null
  status: string
  tagline: string | null
}

export interface TVDetails extends TMDBTVShow {
  genres: Genre[]
  episode_run_time: number[]
  status: string
  tagline: string | null
  number_of_episodes: number
  number_of_seasons: number
}
