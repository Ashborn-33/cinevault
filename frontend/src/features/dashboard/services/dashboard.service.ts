import { supabase } from "@/lib/supabase"
import { MediaService } from "@/features/discover"
import type { LibraryItem } from "@/features/library"
import type { UpcomingEpisodeEntry, UpcomingEpisodesGrouped } from "../types/dashboard"

export const DashboardService = {
  // getContinueWatching: Fetches active in-progress titles with smart filtering
  async getContinueWatching(userId: string): Promise<LibraryItem[]> {
    // 1. Fetch items that are potentially in progress from library
    const { data: libraryItems, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .or("status.eq.watching,status.eq.rewatching,progress.gt.0")
      .neq("status", "completed")
      .neq("status", "dropped")
      .neq("status", "planning")
      .neq("status", "on_hold")

    if (error) throw error
    const items = (libraryItems || []) as LibraryItem[]

    // 60-day boundary calculation
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const sixtyDaysAgoTime = sixtyDaysAgo.getTime()

    const activeItems: LibraryItem[] = []
    const inactiveItems: LibraryItem[] = []

    items.forEach((item) => {
      // Exclude titles with 100% progress
      if (item.progress === 100) return

      // Exclude Wishlist-only / Favorite-only without progress
      const isWishlistOnly =
        item.watchlist &&
        (!item.progress || item.progress === 0) &&
        item.status !== "watching" &&
        item.status !== "rewatching"
      const isFavoriteOnly =
        item.favorite &&
        (!item.progress || item.progress === 0) &&
        item.status !== "watching" &&
        item.status !== "rewatching"
      if (isWishlistOnly || isFavoriteOnly) return

      // Activity inside 60 days check
      const lastWatchedTime = item.last_watched_at ? new Date(item.last_watched_at).getTime() : 0
      const hasActivityIn60Days = lastWatchedTime >= sixtyDaysAgoTime

      // Started tracking exists and progress > 0
      const hasProgressAndStarted =
        !!item.started_at &&
        item.progress !== null &&
        item.progress !== undefined &&
        item.progress > 0

      if (hasActivityIn60Days || hasProgressAndStarted) {
        activeItems.push(item)
      } else if (item.last_watched_at) {
        inactiveItems.push(item)
      }
    })

    // Multi-key sorting function
    const sortItems = (a: LibraryItem, b: LibraryItem) => {
      const timeA = a.last_watched_at ? new Date(a.last_watched_at).getTime() : 0
      const timeB = b.last_watched_at ? new Date(b.last_watched_at).getTime() : 0
      if (timeB !== timeA) return timeB - timeA

      const progA = a.updated_progress_at ? new Date(a.updated_progress_at).getTime() : 0
      const progB = b.updated_progress_at ? new Date(b.updated_progress_at).getTime() : 0
      if (progB !== progA) return progB - progA

      const startA = a.started_at ? new Date(a.started_at).getTime() : 0
      const startB = b.started_at ? new Date(b.started_at).getTime() : 0
      return startB - startA
    }

    activeItems.sort(sortItems)
    inactiveItems.sort(sortItems)

    let result = [...activeItems]

    // Fallback: If fewer than 5 active items, fill remaining slots with inactive items (recently watched)
    if (result.length < 5) {
      const needed = 5 - result.length
      const fallback = inactiveItems.slice(0, needed)
      result = [...result, ...fallback]
      result.sort(sortItems)
    }

    return result.slice(0, 10)
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
