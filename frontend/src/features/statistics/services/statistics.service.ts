import { supabase } from "@/lib/supabase"
import type { LibraryItem } from "@/features/library"
import type { WatchHistoryEntry, EpisodeProgress } from "@/features/tracking/types/tracking"
import type {
  OverviewData,
  GenreStatEntry,
  ActivityEntry,
  RuntimeRatioEntry,
  ViewingInsight,
  Achievement,
  RecentCompletion,
} from "../types/statistics"

// Helper to get local date string YYYY-MM-DD
function getLocalDateString(dateInput: string | Date): string {
  const d = new Date(dateInput)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const StatisticsService = {
  // Raw Data Fetchers
  async getLibraryItems(userId: string): Promise<LibraryItem[]> {
    try {
      let allData: LibraryItem[] = []
      let from = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from("library")
          .select("*")
          .eq("user_id", userId)
          .range(from, from + limit - 1)
        if (error) throw error
        if (!data || data.length === 0) {
          hasMore = false
        } else {
          allData = [...allData, ...data]
          from += limit
          if (data.length < limit) {
            hasMore = false
          }
        }
      }

      localStorage.setItem(`cinevault_lib_items_${userId}`, JSON.stringify(allData))
      return allData as LibraryItem[]
    } catch (err) {
      console.warn("Offline fallback for getLibraryItems:", err)
      const cached = localStorage.getItem(`cinevault_lib_items_${userId}`)
      if (cached) return JSON.parse(cached) as LibraryItem[]
      throw err
    }
  },

  async getWatchHistory(userId: string): Promise<WatchHistoryEntry[]> {
    try {
      let allData: WatchHistoryEntry[] = []
      let from = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from("watch_history")
          .select("*")
          .eq("user_id", userId)
          .order("watch_date", { ascending: true })
          .range(from, from + limit - 1)
        if (error) throw error
        if (!data || data.length === 0) {
          hasMore = false
        } else {
          allData = [...allData, ...data]
          from += limit
          if (data.length < limit) {
            hasMore = false
          }
        }
      }

      localStorage.setItem(`cinevault_watch_history_${userId}`, JSON.stringify(allData))
      return allData as WatchHistoryEntry[]
    } catch (err) {
      console.warn("Offline fallback for getWatchHistory:", err)
      const cached = localStorage.getItem(`cinevault_watch_history_${userId}`)
      if (cached) return JSON.parse(cached) as WatchHistoryEntry[]
      throw err
    }
  },

  async getEpisodeProgress(userId: string): Promise<EpisodeProgress[]> {
    try {
      let allData: EpisodeProgress[] = []
      let from = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from("episode_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("watch_status", "completed")
          .range(from, from + limit - 1)
        if (error) throw error
        if (!data || data.length === 0) {
          hasMore = false
        } else {
          allData = [...allData, ...data]
          from += limit
          if (data.length < limit) {
            hasMore = false
          }
        }
      }

      const sumWatchCount = allData.reduce((sum, ep) => sum + (ep.watch_count || 1), 0)
      console.log("[STAGE 1 DEBUG] getEpisodeProgress: rows returned =", allData.length, "SUM(watch_count) =", sumWatchCount)

      localStorage.setItem(`cinevault_episode_progress_${userId}`, JSON.stringify(allData))
      return allData as EpisodeProgress[]
    } catch (err) {
      console.warn("Offline fallback for getEpisodeProgress:", err)
      const cached = localStorage.getItem(`cinevault_episode_progress_${userId}`)
      if (cached) return JSON.parse(cached) as EpisodeProgress[]
      throw err
    }
  },

  // Calculations & Selectors
  // Calculations & Selectors
  calculateWatchStreak(watchHistory: WatchHistoryEntry[]) {
    if (!watchHistory || watchHistory.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        heatmapData: {} as Record<string, number>,
        lastActivity: null,
      }
    }

    const heatmapData: Record<string, number> = {}
    watchHistory.forEach((item) => {
      const dateStr = getLocalDateString(item.watch_date)
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1
    })

    const daysMs = watchHistory.map((h) => {
      const date = new Date(h.watch_date)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })

    const uniqueDaysMs = Array.from(new Set(daysMs))
    uniqueDaysMs.sort((a, b) => a - b)

    let longestStreak = 0
    if (uniqueDaysMs.length > 0) {
      longestStreak = 1
      let currentTempStreak = 1
      const oneDayMs = 24 * 60 * 60 * 1000

      for (let i = 1; i < uniqueDaysMs.length; i++) {
        const diff = uniqueDaysMs[i] - uniqueDaysMs[i - 1]
        const diffDays = Math.round(diff / oneDayMs)
        if (diffDays === 1) {
          currentTempStreak++
          longestStreak = Math.max(longestStreak, currentTempStreak)
        } else if (diffDays > 1) {
          currentTempStreak = 1
        }
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayMs = today.getTime()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const yesterdayMs = yesterday.getTime()

    const daysSet = new Set(uniqueDaysMs)
    let currentStreak = 0

    if (daysSet.has(todayMs) || daysSet.has(yesterdayMs)) {
      currentStreak = 1
      let checkMs = daysSet.has(todayMs) ? todayMs : yesterdayMs
      const oneDayMs = 24 * 60 * 60 * 1000

      while (true) {
        checkMs -= oneDayMs
        const checkDate = new Date(checkMs)
        checkDate.setHours(0, 0, 0, 0)
        const normalizedCheckMs = checkDate.getTime()
        if (daysSet.has(normalizedCheckMs)) {
          currentStreak++
        } else {
          break
        }
      }
    }

    const lastActivity =
      watchHistory.length > 0 ? watchHistory[watchHistory.length - 1].watch_date : null

    return { currentStreak, longestStreak, heatmapData, lastActivity }
  },

  calculateLibraryStats(libraryItems: LibraryItem[]) {
    const movies = libraryItems.filter((i) => i.media_type === "movie").length
    const tvShows = libraryItems.filter((i) => i.media_type === "tv").length
    const completedMovies = libraryItems.filter(
      (i) => i.media_type === "movie" && i.status === "completed"
    ).length
    const completedShows = libraryItems.filter(
      (i) => i.media_type === "tv" && i.status === "completed"
    ).length
    const watching = libraryItems.filter((i) => i.status === "watching").length
    const planning = libraryItems.filter((i) => i.status === "planning").length
    const dropped = libraryItems.filter((i) => i.status === "dropped").length
    const rewatches = libraryItems.reduce(
      (sum, item) => sum + Math.max(0, (item.times_watched || 1) - 1),
      0
    )
    const continueWatching = libraryItems.filter(
      (i) => i.status === "watching" || (i.progress !== null && i.progress > 0 && i.progress < 100)
    ).length
    const completionRate =
      libraryItems.length > 0
        ? Math.round(
            (libraryItems.filter((i) => i.status === "completed").length / libraryItems.length) *
              100
          )
        : 0
    return {
      movies,
      tvShows,
      completedMovies,
      completedShows,
      watching,
      planning,
      dropped,
      rewatches,
      continueWatching,
      completionRate,
    }
  },

  calculateWatchTime(libraryItems: LibraryItem[], episodeProgress: EpisodeProgress[]) {
    let movieMinutes = 0
    libraryItems.forEach((item) => {
      if (item.media_type === "movie") {
        const runtime = item.runtime_minutes || 0
        const completedTime = runtime * (item.times_watched || 0)
        const partialTime = runtime * ((item.progress || 0) / 100)
        movieMinutes += Math.max(completedTime, partialTime)
      }
    })

    const showRuntimeMap = new Map<string, number>()
    libraryItems.forEach((item) => {
      if (item.media_type === "tv" && item.runtime_minutes) {
        showRuntimeMap.set(String(item.media_id), item.runtime_minutes)
      }
    })

    let tvMinutes = 0
    episodeProgress.forEach((ep) => {
      if (ep.watch_status === "completed") {
        const count = ep.watch_count || 1
        if (ep.runtime_minutes && ep.runtime_minutes > 0) {
          tvMinutes += ep.runtime_minutes * count
        } else {
          tvMinutes += (showRuntimeMap.get(String(ep.media_id)) || 0) * count
        }
      }
    })

    const watchMinutes = movieMinutes + tvMinutes
    const watchHours = Math.round((watchMinutes / 60) * 10) / 10

    return { watchMinutes, watchHours }
  },

  calculateRatings(libraryItems: LibraryItem[]) {
    const ratedItems = libraryItems.filter(
      (i) => i.rating !== null && i.rating !== undefined && !isNaN(i.rating)
    )
    const averageRating =
      ratedItems.length > 0
        ? Math.round((ratedItems.reduce((sum, i) => sum + i.rating!, 0) / ratedItems.length) * 10) /
          10
        : 0
    return { averageRating }
  },

  calculateGenres(libraryItems: LibraryItem[], episodeProgress: EpisodeProgress[]) {
    const genreMinutes: Record<string, number> = {}

    libraryItems.forEach((item) => {
      if (item.media_type === "movie" && item.genres) {
        const runtime = item.runtime_minutes || 0
        const completedTime = runtime * (item.times_watched || 0)
        const partialTime = runtime * ((item.progress || 0) / 100)
        const watchMins = Math.max(completedTime, partialTime)

        item.genres.forEach((g) => {
          genreMinutes[g] = (genreMinutes[g] || 0) + watchMins
        })
      }
    })

    const showRuntimeMap = new Map<string, number>()
    const showGenresMap = new Map<string, string[]>()
    libraryItems.forEach((item) => {
      if (item.media_type === "tv") {
        if (item.runtime_minutes) showRuntimeMap.set(String(item.media_id), item.runtime_minutes)
        if (item.genres) showGenresMap.set(String(item.media_id), item.genres)
      }
    })

    episodeProgress.forEach((ep) => {
      if (ep.watch_status === "completed") {
        const count = ep.watch_count || 1
        const runtime =
          ep.runtime_minutes && ep.runtime_minutes > 0
            ? ep.runtime_minutes
            : showRuntimeMap.get(String(ep.media_id)) || 0

        const genres = showGenresMap.get(String(ep.media_id)) || []
        genres.forEach((g) => {
          genreMinutes[g] = (genreMinutes[g] || 0) + runtime * count
        })
      }
    })

    const sortedGenres = Object.entries(genreMinutes).sort((a, b) => b[1] - a[1])
    const topGenre = sortedGenres[0]?.[0] || "None"

    return {
      favoriteGenre: topGenre,
      mostWatchedGenre: topGenre,
    }
  },

  calculateOverview(
    libraryItems: LibraryItem[],
    watchHistory: WatchHistoryEntry[],
    episodeProgress: EpisodeProgress[]
  ): OverviewData {
    const libStats = this.calculateLibraryStats(libraryItems)
    const timeStats = this.calculateWatchTime(libraryItems, episodeProgress)
    const streakStats = this.calculateWatchStreak(watchHistory)
    const ratingStats = this.calculateRatings(libraryItems)
    const genreStats = this.calculateGenres(libraryItems, episodeProgress)

    const totalEpisodesWatched = episodeProgress
      .filter((ep) => ep.watch_status === "completed")
      .reduce((sum, ep) => sum + (ep.watch_count || 1), 0)

    const result = {
      // Legacy compatibility
      totalWatchTime: timeStats.watchMinutes,
      moviesCompleted: libStats.completedMovies,
      episodesCompleted: totalEpisodesWatched,
      tvShowsCompleted: libStats.completedShows,
      continueWatchingCount: libStats.continueWatching,
      currentStreak: streakStats.currentStreak,
      longestStreak: streakStats.longestStreak,
      completionRate: libStats.completionRate,

      // New properties
      movies: libStats.movies,
      tvShows: libStats.tvShows,
      episodes: totalEpisodesWatched,
      watchMinutes: timeStats.watchMinutes,
      watchHours: timeStats.watchHours,
      completedMovies: libStats.completedMovies,
      completedShows: libStats.completedShows,
      watching: libStats.watching,
      planning: libStats.planning,
      dropped: libStats.dropped,
      rewatches: libStats.rewatches,
      averageRating: ratingStats.averageRating,
      favoriteGenre: genreStats.favoriteGenre,
      mostWatchedGenre: genreStats.mostWatchedGenre,
      lastActivity: streakStats.lastActivity,
      continueWatching: libStats.continueWatching,
    }

    console.log("[STAGE 2 DEBUG] calculateOverview: episodesWatched =", result.episodes, "totalEpisodes =", result.episodes, "watchHours =", result.watchHours)
    return result
  },

  calculateGenreStats(
    libraryItems: LibraryItem[],
    watchHistory: WatchHistoryEntry[]
  ): GenreStatEntry[] {
    const mediaGenresMap: Record<string, string[]> = {}
    libraryItems.forEach((item) => {
      mediaGenresMap[`${item.media_type}-${item.media_id}`] = item.genres || []
    })

    const genreCounts: Record<string, number> = {}
    const genreMinutes: Record<string, number> = {}

    watchHistory.forEach((historyItem) => {
      const key = `${historyItem.media_type}-${historyItem.media_id}`
      const genres = mediaGenresMap[key] || []
      const runtime = historyItem.runtime_minutes || 0

      genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
        genreMinutes[genre] = (genreMinutes[genre] || 0) + runtime
      })
    })

    const entries = Object.keys(genreCounts).map((g) => ({
      genre: g,
      count: genreCounts[g],
      hours: Math.round((genreMinutes[g] / 60) * 10) / 10,
    }))

    // Sort descending by hours
    return entries.sort((a, b) => b.hours - a.hours)
  },

  calculateActivity(watchHistory: WatchHistoryEntry[]) {
    // 1. Monthly Watch Activity
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    const monthlyData: Record<string, { count: number; minutes: number }> = {}
    months.forEach((m) => {
      monthlyData[m] = { count: 0, minutes: 0 }
    })

    // 2. Weekly Watch Activity (Days of Week)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weeklyData: Record<string, { count: number; minutes: number }> = {}
    days.forEach((d) => {
      weeklyData[d] = { count: 0, minutes: 0 }
    })

    // 3. Movie vs TV Ratio
    let movieMinutes = 0
    let movieCount = 0
    let tvMinutes = 0
    let tvCount = 0

    watchHistory.forEach((item) => {
      const date = new Date(item.watch_date)
      const mLabel = months[date.getMonth()]
      const dLabel = days[date.getDay()]
      const runtime = item.runtime_minutes || 0

      if (monthlyData[mLabel]) {
        monthlyData[mLabel].count++
        monthlyData[mLabel].minutes += runtime
      }

      if (weeklyData[dLabel]) {
        weeklyData[dLabel].count++
        weeklyData[dLabel].minutes += runtime
      }

      if (item.media_type === "movie") {
        movieMinutes += runtime
        movieCount++
      } else {
        tvMinutes += runtime
        tvCount++
      }
    })

    const monthlyActivity: ActivityEntry[] = months.map((m) => ({
      label: m,
      count: monthlyData[m].count,
      hours: Math.round((monthlyData[m].minutes / 60) * 10) / 10,
    }))

    const weeklyActivity: ActivityEntry[] = days.map((d) => ({
      label: d,
      count: weeklyData[d].count,
      hours: Math.round((weeklyData[d].minutes / 60) * 10) / 10,
    }))

    const ratio: RuntimeRatioEntry[] = [
      { name: "Movies", value: movieCount, hours: Math.round(movieMinutes / 60) },
      { name: "TV Shows", value: tvCount, hours: Math.round(tvMinutes / 60) },
    ]

    return { monthlyActivity, weeklyActivity, ratio }
  },

  calculateViewingInsights(
    libraryItems: LibraryItem[],
    watchHistory: WatchHistoryEntry[]
  ): ViewingInsight[] {
    const insights: ViewingInsight[] = []

    const totalMinutes = watchHistory.reduce((sum, item) => sum + (item.runtime_minutes || 0), 0)
    const hours = Math.round(totalMinutes / 60)

    // Insight 1: Total Watch Time
    if (hours > 0) {
      insights.push({
        id: "insight-watchtime",
        text: `You watched ${hours} hours of entertainment in total.`,
        type: "info",
      })
    }

    // Insight 2: Favorite Genre
    const genreStats = this.calculateGenreStats(libraryItems, watchHistory)
    if (genreStats.length > 0) {
      insights.push({
        id: "insight-genre",
        text: `Your favorite genre is ${genreStats[0].genre}, totaling ${genreStats[0].hours} hours of playback.`,
        type: "accent",
      })
    }

    // Insight 3: Movies completed count
    const completedMovies = libraryItems.filter(
      (i) => i.media_type === "movie" && i.status === "completed"
    ).length
    if (completedMovies > 0) {
      insights.push({
        id: "insight-movies",
        text: `You have successfully completed ${completedMovies} movie${completedMovies === 1 ? "" : "s"}.`,
        type: "success",
      })
    }

    // Insight 4: Average movie completion time
    const completedItems = libraryItems.filter(
      (i) => i.media_type === "movie" && i.status === "completed" && i.started_at && i.completed_at
    )
    if (completedItems.length > 0) {
      const totalDays = completedItems.reduce((sum, item) => {
        const start = new Date(item.started_at!)
        const end = new Date(item.completed_at!)
        const diff = end.getTime() - start.getTime()
        return sum + diff / (1000 * 60 * 60 * 24)
      }, 0)
      const avgDays = Math.round((totalDays / completedItems.length) * 10) / 10
      insights.push({
        id: "insight-completiontime",
        text: `Your average movie completion time is ${avgDays} days.`,
        type: "info",
      })
    }

    // Insight 5: Weekend Warrior check
    let weekendEvents = 0
    let weekdayEvents = 0
    watchHistory.forEach((item) => {
      const day = new Date(item.watch_date).getDay()
      if (day === 0 || day === 6) {
        weekendEvents++
      } else {
        weekdayEvents++
      }
    })
    if (weekendEvents > weekdayEvents && weekendEvents > 0) {
      insights.push({
        id: "insight-weekend",
        text: "Most of your watching happens on weekends.",
        type: "warning",
      })
    }

    // Default insight if empty
    if (insights.length === 0) {
      insights.push({
        id: "insight-default",
        text: "Log watch progress for movies and episodes to unlock dynamic insights here.",
        type: "info",
      })
    }

    return insights.slice(0, 5)
  },

  calculateAchievements(
    libraryItems: LibraryItem[],
    watchHistory: WatchHistoryEntry[],
    episodeProgress: EpisodeProgress[]
  ): Achievement[] {
    const moviesCompleted = libraryItems.filter(
      (i) => i.media_type === "movie" && i.status === "completed"
    ).length
    const episodesCompleted = episodeProgress.length

    const completedCount = libraryItems.filter((i) => i.status === "completed").length
    const totalCount = libraryItems.length
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    const { longestStreak } = this.calculateWatchStreak(watchHistory)

    // Calculate maximum episodes watched in a single day
    const dayEpisodesCount: Record<string, number> = {}
    episodeProgress.forEach((ep) => {
      if (ep.watched_at) {
        const dateStr = getLocalDateString(ep.watched_at)
        dayEpisodesCount[dateStr] = (dayEpisodesCount[dateStr] || 0) + 1
      }
    })
    const maxEpisodesInDay = Object.values(dayEpisodesCount).reduce(
      (max, val) => Math.max(max, val),
      0
    )

    // Calculate maximum movies watched/completed in a single day
    const dayMoviesCount: Record<string, number> = {}
    watchHistory.forEach((item) => {
      if (item.action === "completed" && item.media_type === "movie") {
        const dateStr = getLocalDateString(item.watch_date)
        dayMoviesCount[dateStr] = (dayMoviesCount[dateStr] || 0) + 1
      }
    })
    const maxMoviesInDay = Object.values(dayMoviesCount).reduce((max, val) => Math.max(max, val), 0)

    // Check night owl watches (between 11 PM and 5 AM)
    let nightOwlCount = 0
    watchHistory.forEach((item) => {
      const hour = new Date(item.watch_date).getHours()
      if (hour >= 23 || hour < 5) {
        nightOwlCount++
      }
    })

    // Check weekend warrior watches
    let weekendCount = 0
    watchHistory.forEach((item) => {
      const day = new Date(item.watch_date).getDay()
      if (day === 0 || day === 6) {
        weekendCount++
      }
    })

    const achievementsList = [
      {
        id: "first-movie",
        title: "First Movie",
        description: "Completed at least one movie",
        icon: "🎬",
        unlocked: moviesCompleted >= 1,
      },
      {
        id: "first-tv",
        title: "First TV Show",
        description: "Watched at least one TV show episode",
        icon: "📺",
        unlocked: episodesCompleted >= 1,
      },
      {
        id: "movie-marathon",
        title: "Movie Marathon",
        description: "Completed 3 or more movies in a single day",
        icon: "🍿",
        unlocked: maxMoviesInDay >= 3,
      },
      {
        id: "binge-watcher",
        title: "Binge Watcher",
        description: "Watched 5 or more TV episodes in a single day",
        icon: "📚",
        unlocked: maxEpisodesInDay >= 5,
      },
      {
        id: "seven-streak",
        title: "7-Day Streak",
        description: "Maintained a 7-day watch streak",
        icon: "🔥",
        unlocked: longestStreak >= 7,
      },
      {
        id: "hundred-episodes",
        title: "100 Episodes",
        description: "Completed 100 total TV show episodes",
        icon: "💯",
        unlocked: episodesCompleted >= 100,
      },
      {
        id: "fifty-movies",
        title: "50 Movies",
        description: "Completed 50 total movies in library",
        icon: "🎖",
        unlocked: moviesCompleted >= 50,
      },
      {
        id: "night-owl",
        title: "Night Owl",
        description: "Logged 5 or more watch entries between 11 PM and 5 AM",
        icon: "🌙",
        unlocked: nightOwlCount >= 5,
      },
      {
        id: "weekend-warrior",
        title: "Weekend Warrior",
        description: "Logged 10 or more watch entries on Saturdays or Sundays",
        icon: "☀",
        unlocked: weekendCount >= 10,
      },
      {
        id: "completionist",
        title: "Completionist",
        description: "Reached a 90% completion rate on 10 or more library items",
        icon: "🏆",
        unlocked: completionRate >= 90 && totalCount >= 10,
      },
    ]

    return achievementsList.map((ach) => ({
      ...ach,
      unlockedAt: ach.unlocked ? new Date().toISOString() : null,
    }))
  },

  calculateRecentlyCompleted(libraryItems: LibraryItem[]): RecentCompletion[] {
    const completed = libraryItems.filter((i) => i.status === "completed" && i.completed_at)
    completed.sort(
      (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
    )

    return completed.slice(0, 5).map((item) => ({
      id: item.id,
      mediaId: item.media_id,
      mediaType: item.media_type as "movie" | "tv",
      title: item.title,
      posterPath: item.poster_path,
      completedAt: item.completed_at!,
    }))
  },
}
export default StatisticsService
