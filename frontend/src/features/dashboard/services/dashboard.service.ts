import { supabase } from "@/lib/supabase"
import { MediaService } from "@/features/discover"
import type { LibraryItem } from "@/features/library"
import type { UpcomingEpisodeEntry, UpcomingEpisodesGrouped } from "../types/dashboard"

export const DashboardService = {
  // getContinueWatching: Fetches active in-progress titles with smart filtering
  async getContinueWatching(userId: string): Promise<LibraryItem[]> {
    const { data: libraryItems, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .gt("progress", 0)
      .lt("progress", 100)
      .order("last_watched_at", { ascending: false })

    if (error) throw error
    return (libraryItems || []) as LibraryItem[]
  },

  // getUpcomingEpisodes: Fetches next airing episodes for user's library TV shows
  async getUpcomingEpisodes(userId: string): Promise<UpcomingEpisodesGrouped> {
    // 1. Fetch TV shows in the user's library
    const { data: libraryItems, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_type", "tv")

    if (error) throw error
    if (!libraryItems || libraryItems.length === 0) {
      return { today: [], tomorrow: [], thisWeek: [] }
    }

    // 2. Fetch TMDB TV details in parallel
    const showsDetails = await Promise.all(
      libraryItems.map(async (item) => {
        try {
          return await MediaService.getTVDetails(item.media_id)
        } catch (err) {
          console.error(`Failed to load TMDB TV Details for show ID ${item.media_id}:`, err)
          return null
        }
      })
    )

    // 3. Extract and map episodes to air
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowTime = tomorrow.getTime()

    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)
    const weekEndTime = weekEnd.getTime()

    const todayList: UpcomingEpisodeEntry[] = []
    const tomorrowList: UpcomingEpisodeEntry[] = []
    const thisWeekList: UpcomingEpisodeEntry[] = []

    showsDetails.forEach((detail) => {
      if (!detail || !detail.next_episode_to_air) return

      const nextEp = detail.next_episode_to_air
      if (!nextEp.air_date) return

      // Compare dates using midnight bounds
      const epDate = new Date(nextEp.air_date + "T00:00:00")
      const epTime = epDate.getTime()

      const entry: UpcomingEpisodeEntry = {
        id: String(nextEp.id),
        showId: detail.id,
        showName: detail.name,
        seasonNumber: nextEp.season_number,
        episodeNumber: nextEp.episode_number,
        episodeTitle: nextEp.name || `Episode ${nextEp.episode_number}`,
        airDate: nextEp.air_date,
        stillPath: nextEp.still_path,
        posterPath: detail.poster_path,
      }

      if (epTime === todayTime) {
        todayList.push(entry)
      } else if (epTime === tomorrowTime) {
        tomorrowList.push(entry)
      } else if (epTime > tomorrowTime && epTime <= weekEndTime) {
        thisWeekList.push(entry)
      }
    })

    // Sort by air date ascending
    const sortByDate = (a: UpcomingEpisodeEntry, b: UpcomingEpisodeEntry) =>
      new Date(a.airDate).getTime() - new Date(b.airDate).getTime()

    todayList.sort(sortByDate)
    tomorrowList.sort(sortByDate)
    thisWeekList.sort(sortByDate)

    return {
      today: todayList.slice(0, 20),
      tomorrow: tomorrowList.slice(0, 20),
      thisWeek: thisWeekList.slice(0, 20),
    }
  },
}
