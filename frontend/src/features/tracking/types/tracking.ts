export type WatchAction = "started" | "continued" | "completed" | "rewatched"

export interface WatchHistoryEntry {
  id: string
  user_id: string
  library_id: string
  media_id: number
  media_type: "movie" | "tv"
  action: WatchAction
  previous_progress: number | null
  new_progress: number | null
  title: string
  poster_path: string | null
  watch_date: string
  runtime_minutes: number | null
  completion_source: string | null
  created_at: string
}

export interface TrackingProgress {
  mediaId: number
  progress: number
}

export interface TrackingState {
  status: string
  progress: number
  times_watched: number
  started_at: string | null
  last_watched_at: string | null
  completed_at: string | null
  updated_progress_at: string | null
}
