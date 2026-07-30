export interface WrappedGenre {
  name: string
  count: number
  percentage: number
}

export interface WrappedMediaItem {
  title: string
  posterPath: string | null
  mediaId: string
}

export interface WrappedPerson {
  name: string
  count: number
  profilePath: string | null
}

export interface WrappedData {
  yearLabel: string
  moviesCount: number
  episodesCount: number
  hoursCount: number
  genres: WrappedGenre[]
  favoriteActor: WrappedPerson | null
  favoriteDirector: WrappedPerson | null
  longestStreak: number
  mostActiveMonth: string
  mostActiveDay: string
  movieOfTheYear: WrappedMediaItem | null
  tvShowOfTheYear: WrappedMediaItem | null
  hiddenGem: WrappedMediaItem | null
  topCollection: { name: string; itemsCount: number } | null
  achievementsEarned: number
  xpEarned: number
  levelReached: number
}
