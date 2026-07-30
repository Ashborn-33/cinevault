export interface RecommendationItem {
  id: string // unique id e.g. rec-movie-1234
  mediaId: string
  mediaType: "movie" | "tv"
  title: string
  posterPath: string | null
  backdropPath: string | null
  rating: number
  releaseDate: string | null
  reason: string
  score: number
  genres: string[]
}
