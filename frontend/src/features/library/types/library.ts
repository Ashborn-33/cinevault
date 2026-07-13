export type LibraryStatus =
  "planning" | "watching" | "completed" | "on_hold" | "dropped" | "rewatching"

export interface LibraryItem {
  id: string
  user_id: string
  media_id: string
  media_type: "movie" | "tv"
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  release_date: string | null
  genres: string[] | null
  status: LibraryStatus
  favorite: boolean
  watchlist: boolean
  rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
  progress: number | null
  runtime_minutes: number | null
  times_watched: number | null
  started_at: string | null
  last_watched_at: string | null
  completed_at: string | null
  updated_progress_at: string | null
}

export interface AddLibraryItemInput {
  media_id: string
  media_type: "movie" | "tv"
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  release_date: string | null
  genres: string[] | null
  status?: LibraryStatus
  favorite?: boolean
  watchlist?: boolean
  rating?: number | null
  notes?: string | null
  progress?: number | null
  runtime_minutes?: number | null
  times_watched?: number | null
  started_at?: string | null
  last_watched_at?: string | null
  completed_at?: string | null
  updated_progress_at?: string | null
}
