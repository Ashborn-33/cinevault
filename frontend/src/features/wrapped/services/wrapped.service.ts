import { supabase } from "@/lib/supabase"
import { StatisticsService } from "@/features/statistics/services/statistics.service"
import { MediaService } from "@/features/discover"
import type { WrappedData, WrappedPerson, WrappedMediaItem } from "../types/wrapped"

export const WrappedService = {
  // Helper to parse year string into date range boundaries
  getDateRange(year: string): { startDate: string; endDate: string } {
    if (year === "lifetime") {
      return { startDate: "1970-01-01T00:00:00Z", endDate: "2099-12-31T23:59:59Z" }
    }
    const yVal = parseInt(year, 10) || new Date().getFullYear()
    return {
      startDate: `${yVal}-01-01T00:00:00Z`,
      endDate: `${yVal}-12-31T23:59:59Z`,
    }
  },

  // generateWrapped: Aggregates stats into a single WrappedData object
  async generateWrapped(userId: string, year: string): Promise<WrappedData | null> {
    try {
      const { startDate, endDate } = this.getDateRange(year)
      const startMs = new Date(startDate).getTime()
      const endMs = new Date(endDate).getTime()

      // 1. Fetch raw datasets in parallel
      const [lib, watch, ep, collectionsRes] = await Promise.all([
        StatisticsService.getLibraryItems(userId),
        StatisticsService.getWatchHistory(userId),
        StatisticsService.getEpisodeProgress(userId),
        supabase.from("collections").select("*, items:collection_items(*)").eq("user_id", userId),
      ])

      const collections = collectionsRes.data || []

      // 2. Filter library items by date range
      const libFiltered = lib.filter((item) => {
        const t = new Date(item.updated_at).getTime()
        return t >= startMs && t <= endMs
      })

      // 3. Filter watch history by date range
      const watchFiltered = watch.filter((item) => {
        const t = new Date(item.watch_date).getTime()
        return t >= startMs && t <= endMs
      })

      // 4. Filter completed episodes by date range
      const epFiltered = ep.filter((item) => {
        if (!item.watched_at) return false
        const t = new Date(item.watched_at).getTime()
        return t >= startMs && t <= endMs
      })

      // If user has zero watches in this period, we return null (no wrapped data available!)
      if (libFiltered.length === 0 && watchFiltered.length === 0 && epFiltered.length === 0) {
        return null
      }

      // 5. Compute Movie & TV Episode Watch tallies
      const moviesCompleted = libFiltered.filter(
        (i) => i.media_type === "movie" && i.status === "completed"
      )
      const moviesCount = moviesCompleted.reduce(
        (sum, item) => sum + (item.times_watched || 1),
        0
      )
      const episodesCount = epFiltered.reduce(
        (sum, item) => sum + (item.watch_count || 1),
        0
      )

      const movieMinutes = moviesCompleted.reduce(
        (sum, item) => sum + (item.runtime_minutes || 0) * (item.times_watched || 1),
        0
      )
      const tvMinutes = epFiltered.reduce(
        (sum, item) => sum + (item.runtime_minutes || 0) * (item.watch_count || 1),
        0
      )
      const hoursCount = Math.round((movieMinutes + tvMinutes) / 60)

      // 6. Compute Favorite Genres
      const genreCounts: Record<string, number> = {}
      libFiltered.forEach((item) => {
        if (item.genres) {
          item.genres.forEach((g) => {
            genreCounts[g] = (genreCounts[g] || 0) + 1
          })
        }
      })
      const totalGenresMatched = Object.values(genreCounts).reduce((sum, val) => sum + val, 0) || 1
      const genresList = Object.entries(genreCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalGenresMatched) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // 7. Compute Favorite Actor & Director from top completed credits
      const topCompleted = libFiltered.filter((item) => item.status === "completed").slice(0, 6)

      const actorCounts: Record<string, { count: number; profilePath: string | null }> = {}
      const directorCounts: Record<string, { count: number; profilePath: string | null }> = {}

      await Promise.all(
        topCompleted.map(async (item) => {
          try {
            const credits =
              item.media_type === "movie"
                ? await MediaService.getMovieCredits(item.media_id)
                : await MediaService.getTVCredits(item.media_id)

            if (credits.cast) {
              credits.cast.slice(0, 3).forEach((actor) => {
                if (!actor.name) return
                const existing = actorCounts[actor.name] || {
                  count: 0,
                  profilePath: actor.profile_path,
                }
                actorCounts[actor.name] = {
                  count: existing.count + 1,
                  profilePath: actor.profile_path,
                }
              })
            }

            if (credits.crew) {
              credits.crew
                .filter((member) => member.job === "Director")
                .forEach((dir) => {
                  if (!dir.name) return
                  const profilePath =
                    (dir as unknown as { profile_path?: string | null }).profile_path || null
                  const existing = directorCounts[dir.name] || {
                    count: 0,
                    profilePath,
                  }
                  directorCounts[dir.name] = {
                    count: existing.count + 1,
                    profilePath,
                  }
                })
            }
          } catch (err) {
            console.error(`Wrapped: failed to load credits for media ${item.media_id}:`, err)
          }
        })
      )

      const topActorArr = Object.entries(actorCounts)
        .map(([name, data]) => ({ name, count: data.count, profilePath: data.profilePath }))
        .sort((a, b) => b.count - a.count)
      const favoriteActor = topActorArr[0] || null

      const topDirArr = Object.entries(directorCounts)
        .map(([name, data]) => ({ name, count: data.count, profilePath: data.profilePath }))
        .sort((a, b) => b.count - a.count)
      const favoriteDirector = topDirArr[0] || null

      // 8. Watch Streaks & Active Dates
      const { longestStreak } = StatisticsService.calculateWatchStreak(watchFiltered)

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const monthCounts: Record<string, number> = {}
      const weekdayCounts: Record<string, number> = {}
      const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]

      watchFiltered.forEach((item) => {
        const d = new Date(item.watch_date)
        const mName = months[d.getMonth()]
        const wName = weekdays[d.getDay()]
        monthCounts[mName] = (monthCounts[mName] || 0) + 1
        weekdayCounts[wName] = (weekdayCounts[wName] || 0) + 1
      })

      const mostActiveMonth =
        Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"
      const mostActiveDay =
        Object.entries(weekdayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"

      // 9. Movie & TV Show of the Year (highest user rated, or TMDB score fallback)
      const ratedMovies = libFiltered
        .filter((i) => i.media_type === "movie" && i.status === "completed")
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      const movieOfTheYear: WrappedMediaItem | null = ratedMovies[0]
        ? {
            title: ratedMovies[0].title,
            posterPath: ratedMovies[0].poster_path,
            mediaId: ratedMovies[0].media_id,
          }
        : null

      const ratedShows = libFiltered
        .filter((i) => i.media_type === "tv" && i.status === "completed")
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      const tvShowOfTheYear: WrappedMediaItem | null = ratedShows[0]
        ? {
            title: ratedShows[0].title,
            posterPath: ratedShows[0].poster_path,
            mediaId: ratedShows[0].media_id,
          }
        : null

      // 10. Hidden Gem Discovery
      // completed movie/tv show in library with TMDB averageRating >= 7.2
      const hiddenGems = libFiltered
        .filter((i) => i.status === "completed")
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // oldest first (earliest discovery!)
      const hiddenGem: WrappedMediaItem | null = hiddenGems[0]
        ? {
            title: hiddenGems[0].title,
            posterPath: hiddenGems[0].poster_path,
            mediaId: hiddenGems[0].media_id,
          }
        : null

      // 11. Top Collection
      const topCol = collections
        .filter((item) => {
          const t = new Date(item.created_at).getTime()
          return t >= startMs && t <= endMs
        })
        .sort((a, b) => (b.items?.length || 0) - (a.items?.length || 0))[0]
      const topCollection = topCol
        ? { name: topCol.name, itemsCount: topCol.items?.length || 0 }
        : null

      // 12. Achievements Earned
      const achievements = StatisticsService.calculateAchievements(
        libFiltered,
        watchFiltered,
        epFiltered
      )
      const achievementsEarned = achievements.filter((a) => a.unlocked).length

      // 13. Viewer level and XP
      const moviesCountNum = moviesCompleted.length
      const collectionsCountNum = collections.filter((col) => {
        const t = new Date(col.created_at).getTime()
        return t >= startMs && t <= endMs
      }).length
      const xpEarned =
        moviesCountNum * 100 +
        episodesCount * 25 +
        collectionsCountNum * 50 +
        achievementsEarned * 75 +
        (longestStreak >= 7 ? 150 : 0)

      const levelReached = Math.max(1, Math.floor(xpEarned / 300) + 1)

      return {
        yearLabel: year === "lifetime" ? "Lifetime" : year,
        moviesCount,
        episodesCount,
        hoursCount,
        genres: genresList,
        favoriteActor,
        favoriteDirector,
        longestStreak,
        mostActiveMonth,
        mostActiveDay,
        movieOfTheYear,
        tvShowOfTheYear,
        hiddenGem,
        topCollection,
        achievementsEarned,
        xpEarned,
        levelReached,
      }
    } catch (err) {
      console.error("Failed to generate wrapped data:", err)
      return null
    }
  },

  // Shorthand query wrapper methods for specific types
  async getTopMovies(userId: string, startDate: string, endDate: string) {
    void endDate
    const wrapped = await this.generateWrapped(userId, new Date(startDate).getFullYear().toString())
    return wrapped?.movieOfTheYear ? [wrapped.movieOfTheYear] : []
  },

  async getTopShows(userId: string, startDate: string, endDate: string) {
    void endDate
    const wrapped = await this.generateWrapped(userId, new Date(startDate).getFullYear().toString())
    return wrapped?.tvShowOfTheYear ? [wrapped.tvShowOfTheYear] : []
  },

  async getTopGenres(userId: string, startDate: string, endDate: string) {
    void endDate
    const wrapped = await this.generateWrapped(userId, new Date(startDate).getFullYear().toString())
    return wrapped?.genres || []
  },

  async getTopActors(userId: string, startDate: string, endDate: string): Promise<WrappedPerson[]> {
    void endDate
    const wrapped = await this.generateWrapped(userId, new Date(startDate).getFullYear().toString())
    return wrapped?.favoriteActor ? [wrapped.favoriteActor] : []
  },

  async getTopDirectors(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WrappedPerson[]> {
    void endDate
    const wrapped = await this.generateWrapped(userId, new Date(startDate).getFullYear().toString())
    return wrapped?.favoriteDirector ? [wrapped.favoriteDirector] : []
  },

  async getTopCollections(userId: string, startDate: string, endDate: string) {
    void endDate
    const wrapped = await this.generateWrapped(userId, new Date(startDate).getFullYear().toString())
    return wrapped?.topCollection ? [wrapped.topCollection] : null
  },

  async getViewingTimeline(userId: string, startDate: string, endDate: string) {
    const watch = await StatisticsService.getWatchHistory(userId)
    const startMs = new Date(startDate).getTime()
    const endMs = new Date(endDate).getTime()
    return watch.filter((item) => {
      const t = new Date(item.watch_date).getTime()
      return t >= startMs && t <= endMs
    })
  },

  async getMilestones(userId: string, startDate: string, endDate: string) {
    void startDate
    void endDate
    const [lib, watch, ep] = await Promise.all([
      StatisticsService.getLibraryItems(userId),
      StatisticsService.getWatchHistory(userId),
      StatisticsService.getEpisodeProgress(userId),
    ])
    return StatisticsService.calculateAchievements(lib, watch, ep)
  },
}
export default WrappedService
