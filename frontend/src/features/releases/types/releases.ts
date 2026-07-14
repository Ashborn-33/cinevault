export interface ReleaseEvent {
  id: string
  mediaId: number
  mediaType: "movie" | "tv"
  title: string
  airDate: string // YYYY-MM-DD
  posterPath: string | null
  details?: {
    seasonNumber?: number
    episodeNumber?: number
    episodeTitle?: string
    runtime?: number
  }
}

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  events: ReleaseEvent[]
}

export interface ReleaseFilters {
  type: "all" | "movie" | "tv"
  scope: "all" | "library"
  time: "all" | "upcoming" | "today"
  search: string
}
