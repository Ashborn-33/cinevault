import type { LibraryStatus } from "@/features/library/types/library"

export interface ImportOptions {
  importLibrary: boolean
  importProgress: boolean
  importWatchHistory: boolean
  importCollections: boolean
  importFavorites: boolean
  duplicateHandling: "skip" | "merge" | "replace"
}

export interface ParsedLibraryItem {
  media_id: string
  media_type: "movie" | "tv"
  title: string
  status: LibraryStatus
  favorite: boolean
  watchlist: boolean
  rating: number | null
  poster_path?: string | null
  backdrop_path?: string | null
  overview?: string | null
  genres?: string[] | null
  release_date?: string | null
  current_season?: number | null
  current_episode?: number | null
  last_episode_name?: string | null
  last_watched_at?: string | null
  times_watched?: number | null
  notes?: string | null
  progress?: number | null
  started_at?: string | null
  updated_progress_at?: string | null
  runtime_minutes?: number | null
}

export interface ParsedWatchHistory {
  media_id: string
  media_type: "movie" | "tv"
  title: string
  watch_date: string
  action: string
  progress: number
  season_number?: number
  episode_number?: number
  episode_name?: string | null
  still_path?: string | null
  air_date?: string | null
}

export interface ParsedEpisodeProgress {
  show_id: string
  season_number: number
  episode_number: number
  watch_status: "completed" | "watching" | "plan_to_watch"
  watched_at: string | null
  runtime_minutes: number
}

export interface ParsedCollectionItem {
  media_id: string
  media_type: "movie" | "tv"
  title: string
  poster_path: string | null
}

export interface ParsedCollection {
  name: string
  description: string | null
  color: string | null
  icon: string | null
  items: ParsedCollectionItem[]
}

export interface ParsedContinueWatching {
  show_id: string
  season_number: number
  episode_number: number
  episode_name: string | null
  last_watched_at: string | null
}

export interface ParsedSpecialStatus {
  show_id: string
  status: string
}

export interface ParsedRating {
  media_id: string
  media_type: "movie" | "tv"
  rating: number
  season_number?: number
  episode_number?: number
}

export interface ParsedReaction {
  media_id: string
  media_type: "movie" | "tv"
  reaction: string
  season_number?: number
  episode_number?: number
}

export interface ParsedBadge {
  badge_name: string
  unlocked_at: string | null
}

export interface ParsedStatistics {
  shows_count?: number
  episodes_count?: number
  movies_count?: number
  watch_count?: number
}

export interface ImportParsedData {
  libraryItems: ParsedLibraryItem[]
  watchHistory: ParsedWatchHistory[]
  episodeProgress: ParsedEpisodeProgress[]
  collections: ParsedCollection[]
  continueWatching?: ParsedContinueWatching[]
  specialStatuses?: ParsedSpecialStatus[]
  ratings?: ParsedRating[]
  reactions?: ParsedReaction[]
  badges?: ParsedBadge[]
  userStats?: ParsedStatistics
}

export interface ImportPreviewData {
  totalShows: number
  totalEpisodes: number
  totalCollections: number
  totalFavorites: number
  duplicateLibraryCount: number
  duplicateProgressCount: number
}

export interface ImportSummaryData {
  importedCount: number
  skippedCount: number
  failedCount: number
  report: string
  importedShows?: number
  importedEpisodes?: number
  importedHistory?: number
  importedCollections?: number
  importedFavorites?: number
  tmdbMatches?: number
  tmdbNotFound?: number
  duplicatesSkipped?: number
  importedMovies?: number
  importedRatings?: number
  importedReactions?: number
  mappedAchievements?: number
  elapsedTime?: number
  verificationStatus?: "Verified" | "Mismatch"
  verificationReport?: string
}
