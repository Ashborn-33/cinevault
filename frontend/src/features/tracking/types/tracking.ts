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
  season_number: number | null
  episode_number: number | null
  episode_name: string | null
  still_path: string | null
  air_date: string | null
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

export interface EpisodeProgress {
  id: string
  user_id: string
  library_id: string
  media_id: number
  season_number: number
  episode_number: number
  episode_name: string | null
  still_path: string | null
  air_date: string | null
  runtime_minutes: number | null
  watch_status: "unwatched" | "watching" | "completed"
  watched_at: string | null
  created_at: string
  updated_at: string
}
