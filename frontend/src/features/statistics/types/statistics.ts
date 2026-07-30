export interface OverviewData {
  // Legacy fields (deprecated but kept for compatibility)
  totalWatchTime: number // in minutes
  moviesCompleted: number
  episodesCompleted: number
  tvShowsCompleted: number
  continueWatchingCount: number
  currentStreak: number
  longestStreak: number
  completionRate: number

  // New unified fields (CV-045.1)
  movies: number
  tvShows: number
  episodes: number
  watchMinutes: number
  watchHours: number
  completedMovies: number
  completedShows: number
  watching: number
  planning: number
  dropped: number
  rewatches: number
  averageRating: number
  favoriteGenre: string
  mostWatchedGenre: string
  lastActivity: string | null
  continueWatching: number
}

export interface GenreStatEntry {
  genre: string
  count: number
  hours: number
}

export interface ActivityEntry {
  label: string // e.g. "Jan", "Feb" or "Mon", "Tue"
  count: number
  hours: number
}

export interface RuntimeRatioEntry {
  name: "Movies" | "TV Shows"
  value: number
  hours: number
}

export interface ViewingInsight {
  id: string
  text: string
  type: "info" | "success" | "warning" | "accent"
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string // lucide-react key or emoji
  unlocked: boolean
  unlockedAt: string | null
}

export interface RecentCompletion {
  id: string
  mediaId: string
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  completedAt: string
}
