export interface UpcomingEpisodeEntry {
  id: string
  showId: number
  showName: string
  seasonNumber: number
  episodeNumber: number
  episodeTitle: string
  airDate: string
  stillPath: string | null
  posterPath: string | null
}

export interface UpcomingEpisodesGrouped {
  today: UpcomingEpisodeEntry[]
  tomorrow: UpcomingEpisodeEntry[]
  thisWeek: UpcomingEpisodeEntry[]
}
