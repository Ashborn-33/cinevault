export type ActivityType =
  | "movie_started"
  | "movie_continued"
  | "movie_completed"
  | "movie_rewatched"
  | "tv_started"
  | "tv_episode"
  | "tv_season_completed"
  | "tv_completed"
  | "collection_created"
  | "collection_updated"
  | "collection_added"
  | "collection_removed"

export interface ActivityItem {
  id: string
  type: ActivityType
  timestamp: string // ISO Timestamp
  title: string // Media Title or Collection Name
  posterPath: string | null
  mediaType?: "movie" | "tv"
  mediaId?: number
  details?: {
    seasonNumber?: number
    episodeNumber?: number
    episodeName?: string
    collectionId?: string
    collectionName?: string
    progress?: number
    previousProgress?: number
  }
}

export interface ActivityFilters {
  category: "all" | "movie" | "tv" | "collection" | "completed" | "started" | "progress"
  search: string
  sort: "newest" | "oldest"
}

export interface PaginatedActivities {
  data: ActivityItem[]
  hasMore: boolean
}
