import { supabase } from "@/lib/supabase"
import { MediaService } from "@/features/discover"
import { tmdbClient } from "@/features/discover/api/tmdb.client"
import { TMDB_ENDPOINTS } from "@/config/api"
import type { TMDBMovie } from "@/features/discover/types/discover"
import type { ReleaseEvent } from "../types/releases"
import { format, isToday, isTomorrow, differenceInCalendarDays, parseISO, addDays } from "date-fns"

// Helper to get local YYYY-MM-DD string
function getLocalDateString(dateInput: Date = new Date()): string {
  return format(dateInput, "yyyy-MM-dd")
}

export const ReleaseService = {
  // getUpcomingMovies: Fetches upcoming movie releases from TMDB
  async getUpcomingMovies(): Promise<ReleaseEvent[]> {
    try {
      const res = await tmdbClient.request<{ results: TMDBMovie[]; total_pages: number }>(
        TMDB_ENDPOINTS.UPCOMING,
        { page: 1 }
      )
      return (res.results || [])
        .filter((movie) => movie.release_date)
        .map((movie) => ({
          id: `movie-${movie.id}`,
          mediaId: Number(movie.id),
          mediaType: "movie",
          title: movie.title,
          airDate: movie.release_date!,
          posterPath: movie.poster_path,
        }))
    } catch (err) {
      console.error("Failed to load upcoming movies:", err)
      return []
    }
  },

  // getUpcomingEpisodes: Fetches future episode releases for user's library TV shows
  async getUpcomingEpisodes(userId: string): Promise<ReleaseEvent[]> {
    // 1. Fetch TV shows in the user's library (excluding dropped ones)
    const { data: libraryItems, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_type", "tv")
      .neq("status", "dropped")

    if (error) throw error
    if (!libraryItems || libraryItems.length === 0) return []

    // 2. Fetch TMDB show details to locate next airing season
    const showDetailsList = await Promise.all(
      libraryItems.map(async (item) => {
        try {
          return await MediaService.getTVDetails(item.media_id)
        } catch (err) {
          console.error(`Failed to fetch TV details for show ID ${item.media_id}:`, err)
          return null
        }
      })
    )

    // 3. For returning shows with an upcoming episode, fetch that season details
    const events: ReleaseEvent[] = []
    const todayStr = getLocalDateString(new Date())

    await Promise.all(
      showDetailsList.map(async (detail) => {
        if (!detail || !detail.next_episode_to_air) return

        const nextEp = detail.next_episode_to_air
        if (!nextEp.season_number) return

        try {
          // Fetch full details of the season containing upcoming episode
          const season = await MediaService.getTVSeasonDetails(detail.id, nextEp.season_number)
          if (!season || !season.episodes) return

          // Map all episodes airing today or in the future
          season.episodes.forEach((ep) => {
            if (!ep.air_date) return

            // Check if episode airs today or in the future
            if (ep.air_date >= todayStr) {
              events.push({
                id: `tv-${detail.id}-s${ep.season_number}e${ep.episode_number}`,
                mediaId: Number(detail.id),
                mediaType: "tv",
                title: detail.name,
                airDate: ep.air_date,
                posterPath: detail.poster_path,
                details: {
                  seasonNumber: ep.season_number,
                  episodeNumber: ep.episode_number,
                  episodeTitle: ep.name || `Episode ${ep.episode_number}`,
                  runtime: ep.runtime || undefined,
                },
              })
            }
          })
        } catch (err) {
          console.error(
            `Failed to load season details for show ${detail.name} S${nextEp.season_number}:`,
            err
          )
        }
      })
    )

    return events
  },

  // getCalendarEvents: Fetches and merges both movie and TV releases
  async getCalendarEvents(userId: string): Promise<ReleaseEvent[]> {
    const [movies, episodes] = await Promise.all([
      this.getUpcomingMovies(),
      this.getUpcomingEpisodes(userId),
    ])

    const merged = [...movies, ...episodes]

    // Sort chronologically by air date ascending
    return merged.sort((a, b) => new Date(a.airDate).getTime() - new Date(b.airDate).getTime())
  },

  // getTodayReleases: Filters events airing today
  async getTodayReleases(userId: string): Promise<ReleaseEvent[]> {
    const events = await this.getCalendarEvents(userId)
    const todayStr = getLocalDateString()
    return events.filter((e) => e.airDate === todayStr)
  },

  // getTomorrowReleases: Filters events airing tomorrow
  async getTomorrowReleases(userId: string): Promise<ReleaseEvent[]> {
    const events = await this.getCalendarEvents(userId)
    const tomorrowStr = getLocalDateString(addDays(new Date(), 1))
    return events.filter((e) => e.airDate === tomorrowStr)
  },

  // getWeeklyReleases: Returns releases grouped by weekday name for this week
  async getWeeklyReleases(userId: string): Promise<Record<string, ReleaseEvent[]>> {
    const events = await this.getCalendarEvents(userId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekEnd = addDays(today, 7)

    const weeklyGroup: Record<string, ReleaseEvent[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    }

    events.forEach((e) => {
      const date = parseISO(e.airDate)
      if (date >= today && date < weekEnd) {
        const dayName = format(date, "EEEE")
        if (weeklyGroup[dayName]) {
          weeklyGroup[dayName].push(e)
        }
      }
    })

    return weeklyGroup
  },

  // getReleaseTimeline: Groups events chronologically in sections
  async getReleaseTimeline(userId: string) {
    const events = await this.getCalendarEvents(userId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const groups = {
      today: [] as ReleaseEvent[],
      tomorrow: [] as ReleaseEvent[],
      thisWeek: [] as ReleaseEvent[],
      nextWeek: [] as ReleaseEvent[],
      later: [] as ReleaseEvent[],
    }

    events.forEach((e) => {
      const date = parseISO(e.airDate)
      const diff = differenceInCalendarDays(date, today)

      if (diff === 0 || isToday(date)) {
        groups.today.push(e)
      } else if (diff === 1 || isTomorrow(date)) {
        groups.tomorrow.push(e)
      } else if (diff >= 2 && diff <= 7) {
        groups.thisWeek.push(e)
      } else if (diff >= 8 && diff <= 14) {
        groups.nextWeek.push(e)
      } else if (diff >= 15 && diff <= 30) {
        groups.later.push(e)
      }
    })

    return groups
  },
}
export default ReleaseService
