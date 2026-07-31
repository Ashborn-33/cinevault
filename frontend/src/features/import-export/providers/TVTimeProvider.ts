import { supabase } from "@/lib/supabase"
import type { ImportProvider } from "./ImportProvider"
import { parseCSV } from "../utils/csvParser"
import { tmdbClient } from "@/features/discover/api/tmdb.client"
import { TMDB_ENDPOINTS } from "@/config/api"
import { fetchGenreMap } from "@/features/discover/services/media.service"
import type { TMDBMediaItem } from "@/features/discover/types/discover"
import type {
  ImportParsedData,
  ImportPreviewData,
  ImportSummaryData,
  ImportOptions,
  ParsedLibraryItem,
  ParsedEpisodeProgress,
  ParsedWatchHistory,
  ParsedCollection,
  ParsedContinueWatching,
  ParsedSpecialStatus,
  ParsedRating,
  ParsedReaction,
  ParsedBadge,
  ParsedStatistics,
} from "../types/import-export"
import type { LibraryStatus } from "@/features/library/types/library"

// Helper to validate and sanitize Library payloads before insertion
function validateAndCleanLibraryItem(
  item: ParsedLibraryItem,
  userId: string
): ParsedLibraryItem | null {
  if (!userId || !item.media_id || !item.media_type || !item.title) {
    return null
  }

  if (item.media_type !== "movie" && item.media_type !== "tv") {
    return null
  }

  const validStatuses: LibraryStatus[] = [
    "planning",
    "watching",
    "completed",
    "on_hold",
    "dropped",
    "rewatching",
  ]
  let status: LibraryStatus = item.status
  if (!validStatuses.includes(status)) {
    status = "planning"
  }

  const cleanDate = (d: string | null | undefined): string | null => {
    if (!d || d.trim() === "" || d.trim().toLowerCase() === "null") return null
    const dateObj = new Date(d)
    return isNaN(dateObj.getTime()) ? null : dateObj.toISOString()
  }

  const cleanInt = (
    n: number | string | null | undefined,
    defaultValue: number | null = null
  ): number | null => {
    if (n === undefined || n === null || String(n).trim() === "") return defaultValue
    const parsed = parseInt(String(n), 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  const rating = cleanInt(item.rating)
  const cleanRating = rating !== null ? Math.min(Math.max(rating, 0), 10) : null

  return {
    media_id: String(item.media_id).trim(),
    media_type: item.media_type,
    title: String(item.title).trim(),
    status,
    favorite: !!item.favorite,
    watchlist: status === "planning" ? true : !!item.watchlist,
    rating: cleanRating,
    poster_path: item.poster_path ? String(item.poster_path).trim() : null,
    backdrop_path: item.backdrop_path ? String(item.backdrop_path).trim() : null,
    overview: item.overview ? String(item.overview).trim() : null,
    genres: Array.isArray(item.genres)
      ? item.genres.map((g) => String(g).trim()).filter(Boolean)
      : [],
    release_date: item.release_date ? String(item.release_date).trim() : null,
    current_season: cleanInt(item.current_season),
    current_episode: cleanInt(item.current_episode),
    last_episode_name: item.last_episode_name ? String(item.last_episode_name).trim() : null,
    last_watched_at: cleanDate(item.last_watched_at),
    times_watched: cleanInt(item.times_watched, 0),
    notes: item.notes ? String(item.notes).trim() : null,
    progress:
      item.progress !== undefined && item.progress !== null
        ? Math.min(Math.max(cleanInt(item.progress) || 0, 0), 100)
        : null,
    started_at: cleanDate(item.started_at),
    updated_progress_at: cleanDate(item.updated_progress_at),
    runtime_minutes: cleanInt(item.runtime_minutes),
  }
}

interface EnrichedParsedLibraryItem extends ParsedLibraryItem {
  _originalTvTimeId?: string
  _totalEpisodes?: number
}

export const TVTimeProvider: ImportProvider = {
  id: "tvtime",
  name: "TV Time GDPR Export",
  description:
    "Import your TV show history, episode logs, ratings, collections, and movie tracking from a TV Time GDPR ZIP folder.",

  async validate(files: Record<string, string>): Promise<boolean> {
    const hasSeenEpisode = "seen_episode.csv" in files
    const hasShowData = "user_tv_show_data.csv" in files
    return hasSeenEpisode || hasShowData
  },

  async parse(files: Record<string, string>): Promise<ImportParsedData> {
    const libraryItems: ParsedLibraryItem[] = []
    const watchHistory: ParsedWatchHistory[] = []
    const episodeProgress: ParsedEpisodeProgress[] = []
    const collections: ParsedCollection[] = []
    const continueWatching: ParsedContinueWatching[] = []
    const specialStatuses: ParsedSpecialStatus[] = []
    const ratings: ParsedRating[] = []
    const reactions: ParsedReaction[] = []
    const badges: ParsedBadge[] = []
    let userStats: ParsedStatistics | undefined = undefined

    const safeParse = (filename: string, handler: (rows: Record<string, string>[]) => void) => {
      if (filename in files) {
        try {
          const rows = parseCSV(files[filename])
          handler(rows)
        } catch (e) {
          console.error(`Failed parsing CSV file ${filename}:`, e)
        }
      }
    }

    const tvTimeShowNames = new Map<string, string>()

    // Helper to ensure a library item exists
    const ensureLibraryItem = (
      mediaId: string,
      mediaType: "movie" | "tv",
      title: string,
      defaults: Partial<ParsedLibraryItem> = {}
    ) => {
      const exists = libraryItems.find(
        (item) => item.media_type === mediaType && item.media_id === mediaId
      )
      if (!exists) {
        libraryItems.push({
          media_id: mediaId,
          media_type: mediaType,
          title: title || (mediaType === "movie" ? "Movie" : "TV Show"),
          status: defaults.status || "watching",
          favorite: !!defaults.favorite,
          watchlist: !!defaults.watchlist,
          rating: defaults.rating ?? null,
          times_watched: defaults.times_watched ?? 0,
          last_watched_at: defaults.last_watched_at ?? null,
        })
      } else {
        if (defaults.status) exists.status = defaults.status
        if (defaults.favorite !== undefined) exists.favorite = defaults.favorite
        if (defaults.watchlist !== undefined) exists.watchlist = defaults.watchlist
        if (defaults.rating !== undefined) exists.rating = defaults.rating
        if (defaults.times_watched !== undefined) exists.times_watched = defaults.times_watched
        if (defaults.last_watched_at) exists.last_watched_at = defaults.last_watched_at
      }
    }

    const showNameToIdMap = new Map<string, string>()
    const episodeIdToInfoMap = new Map<string, { season: number; episode: number }>()

    const parseObjectsField = (objectsStr: string): { id: string; type: "tv" | "movie" }[] => {
      if (!objectsStr || objectsStr.trim() === "" || objectsStr === "[]") return []

      const matches = objectsStr.match(/map\[[^\]]+\]/g) || []
      const items: { id: string; type: "tv" | "movie" }[] = []

      matches.forEach((m) => {
        const idMatch = m.match(/\bid:([a-zA-Z0-9_-]+)/)
        const typeMatch = m.match(/\btype:([a-zA-Z0-9_-]+)/)

        if (idMatch) {
          const tvTimeId = idMatch[1]
          const rawType = typeMatch ? typeMatch[1] : ""
          const mediaType =
            rawType === "series" || rawType === "show" || rawType === "tv" ? "tv" : "movie"
          items.push({ id: tvTimeId, type: mediaType })
        }
      })

      return items
    }

    // 1. Build Show Names Registry from primary files
    safeParse("user_tv_show_data.csv", (rows) => {
      rows.forEach((row) => {
        const showId = row["tv_show_id"] || row["show_id"] || ""
        const title = row["tv_show_name"] || row["show_name"] || ""
        if (showId && title) {
          tvTimeShowNames.set(showId, title)
          showNameToIdMap.set(title.toLowerCase().trim(), showId)
        }
      })
    })

    safeParse("followed_tv_show.csv", (rows) => {
      rows.forEach((row) => {
        const showId = row["tv_show_id"] || row["show_id"] || ""
        const title = row["tv_show_name"] || row["show_name"] || ""
        if (showId && title) {
          tvTimeShowNames.set(showId, title)
          showNameToIdMap.set(title.toLowerCase().trim(), showId)
        }
      })
    })

    safeParse("tracking-prod-records-v2.csv", (rows) => {
      rows.forEach((row) => {
        const showId = row["s_id"] || ""
        const title = row["series_name"] || ""
        if (showId && title) {
          tvTimeShowNames.set(showId, title)
          showNameToIdMap.set(title.toLowerCase().trim(), showId)
        }

        const epId = row["episode_id"] || row["ep_id"] || ""
        const seasonNum = parseInt(row["season_number"] || row["s_no"] || "", 10)
        const episodeNum = parseInt(row["episode_number"] || row["ep_no"] || "", 10)
        if (epId && !isNaN(seasonNum) && !isNaN(episodeNum)) {
          episodeIdToInfoMap.set(epId, { season: seasonNum, episode: episodeNum })
        }
      })
    })

    const parseListsForNames = (rows: Record<string, string>[]) => {
      rows.forEach((row) => {
        const objectsStr = row["objects"] || ""
        if (!objectsStr || objectsStr === "[]") return

        const items = parseObjectsField(objectsStr)
        items.forEach((item) => {
          if (item.type === "tv") {
            const title = row["series_name"] || row["show_name"] || ""
            if (title) {
              tvTimeShowNames.set(item.id, title)
              showNameToIdMap.set(title.toLowerCase().trim(), item.id)
            }
          }
        })
      })
    }
    safeParse("lists-prod-lists.csv", parseListsForNames)

    // 2. Parse TV Library
    safeParse("user_tv_show_data.csv", (rows) => {
      rows.forEach((row) => {
        const showId = row["tv_show_id"] || row["show_id"] || ""
        if (!showId) return
        const title = tvTimeShowNames.get(showId) || row["tv_show_name"] || "TV Show"

        const tvTimeStatus = (row["status"] || "").toLowerCase()
        let status: LibraryStatus = "planning"
        if (tvTimeStatus.includes("watching") || tvTimeStatus.includes("current")) {
          status = "watching"
        } else if (tvTimeStatus.includes("archived") || tvTimeStatus.includes("completed")) {
          status = "completed"
        }

        const ratingVal = parseFloat(row["rating"] || "")
        const rating = isNaN(ratingVal) ? null : ratingVal

        ensureLibraryItem(showId, "tv", title, {
          status,
          favorite: row["favorite"] === "1" || row["favorite"] === "true",
          watchlist: status === "planning",
          rating,
        })
      })
    })

    safeParse("followed_tv_show.csv", (rows) => {
      rows.forEach((row) => {
        const showId = row["tv_show_id"] || row["show_id"] || ""
        if (!showId) return
        const title = tvTimeShowNames.get(showId) || row["tv_show_name"] || "TV Show"

        const isArchived = row["archived"] === "1" || row["archived"] === "true"
        const status: LibraryStatus = isArchived ? "completed" : "watching"

        ensureLibraryItem(showId, "tv", title, {
          status,
          favorite: false,
          watchlist: false,
        })
      })
    })

    // 3. Parse Movie Tracking
    const parseMovieTracking = (rows: Record<string, string>[]) => {
      rows.forEach((row) => {
        const movieId = row["movie_id"] || row["media_id"] || row["uuid"] || ""
        const title = row["movie_title"] || row["movie_name"] || row["title"] || "Movie"
        const mediaType = row["media_type"] || row["entity_type"] || "movie"
        if (!movieId || mediaType !== "movie") return

        const rewatchCount = parseInt(row["rewatch_count"] || row["rewatched"] || "0", 10)
        const lastWatched =
          row["watch_date"] ||
          row["watch_timestamp"] ||
          row["updated_at"] ||
          row["created_at"] ||
          new Date().toISOString()

        tvTimeShowNames.set(movieId, title)

        ensureLibraryItem(movieId, "movie", title, {
          status: "completed",
          favorite: false,
          watchlist: false,
          rating: null,
          times_watched: rewatchCount + 1,
          last_watched_at: lastWatched,
        })

        watchHistory.push({
          media_id: movieId,
          media_type: "movie",
          title,
          watch_date: lastWatched,
          action: "completed",
          progress: 100,
        })
      })
    }
    safeParse("tracking-prod-records.csv", parseMovieTracking)

    // 4. Parse TV watch history actions
    safeParse("tracking-prod-records-v2.csv", (rows) => {
      rows.forEach((row) => {
        const mediaId = row["media_id"] || row["tv_show_id"] || row["s_id"] || ""
        const mediaType = (row["media_type"] || row["entity_type"] || "tv") as "movie" | "tv"
        if (!mediaId) return
        const title =
          tvTimeShowNames.get(mediaId) ||
          row["title"] ||
          row["show_name"] ||
          row["series_name"] ||
          "Untitled Media"

        const lastWatched =
          row["watch_date"] ||
          row["watch_timestamp"] ||
          row["updated_at"] ||
          row["created_at"] ||
          new Date().toISOString()

        ensureLibraryItem(mediaId, mediaType, title, {
          status: mediaType === "tv" ? "watching" : "completed",
          last_watched_at: lastWatched,
        })

        const seasonNum = parseInt(row["season_number"] || row["s_no"] || "", 10)
        const episodeNum = parseInt(row["episode_number"] || row["ep_no"] || "", 10)

        const historyItem: ParsedWatchHistory = {
          media_id: mediaId,
          media_type: mediaType,
          title,
          watch_date: lastWatched,
          action: row["action"] || "completed",
          progress: parseInt(row["progress"] || "100", 10),
        }

        if (mediaType === "tv" && !isNaN(seasonNum) && !isNaN(episodeNum)) {
          historyItem.season_number = seasonNum
          historyItem.episode_number = episodeNum
          historyItem.episode_name = row["episode_name"] || row["ep_name"] || row["name"] || null
          historyItem.still_path = row["still_path"] || null
          historyItem.air_date = row["air_date"] || null

          episodeProgress.push({
            show_id: mediaId,
            season_number: seasonNum,
            episode_number: episodeNum,
            watch_status: "completed",
            watched_at: lastWatched,
            runtime_minutes: parseInt(row["runtime"] || "0", 10) / 60 || 45,
          })
        }

        watchHistory.push(historyItem)
      })
    })

    // 5. Parse Episode Watch Progress
    safeParse("seen_episode.csv", (rows) => {
      rows.forEach((row) => {
        let showId = row["tv_show_id"] || row["show_id"] || ""
        if (!showId && row["tv_show_name"]) {
          showId = showNameToIdMap.get(row["tv_show_name"].toLowerCase().trim()) || ""
        }
        const seasonNum = parseInt(row["episode_season_number"] || row["season_number"] || "", 10)
        const episodeNum = parseInt(row["episode_number"] || "", 10)
        if (!showId || isNaN(seasonNum) || isNaN(episodeNum)) return

        const title = tvTimeShowNames.get(showId) || row["tv_show_name"] || `TV Show ${showId}`
        ensureLibraryItem(showId, "tv", title)

        episodeProgress.push({
          show_id: showId,
          season_number: seasonNum,
          episode_number: episodeNum,
          watch_status: "completed",
          watched_at: row["updated_at"] || row["created_at"] || new Date().toISOString(),
          runtime_minutes: 45,
        })
      })
    })

    // 6. Parse Continue Watching
    const parseCW = (rows: Record<string, string>[]) => {
      rows.forEach((row) => {
        let showId = row["tv_show_id"] || row["show_id"] || ""
        if (!showId && row["tv_show_name"]) {
          showId = showNameToIdMap.get(row["tv_show_name"].toLowerCase().trim()) || ""
        }
        let seasonNum = parseInt(row["episode_season_number"] || row["season_number"] || "", 10)
        let episodeNum = parseInt(row["episode_number"] || "", 10)

        const epId = row["episode_id"] || ""
        if ((isNaN(seasonNum) || isNaN(episodeNum)) && epId) {
          const info = episodeIdToInfoMap.get(epId)
          if (info) {
            seasonNum = info.season
            episodeNum = info.episode
          }
        }

        if (!showId || isNaN(seasonNum) || isNaN(episodeNum)) return

        const title = tvTimeShowNames.get(showId) || row["tv_show_name"] || `TV Show ${showId}`
        ensureLibraryItem(showId, "tv", title)

        continueWatching.push({
          show_id: showId,
          season_number: seasonNum,
          episode_number: episodeNum,
          episode_name: row["episode_name"] || row["name"] || null,
          last_watched_at:
            row["updated_at"] ||
            row["last_watched_at"] ||
            row["created_at"] ||
            new Date().toISOString(),
        })
      })
    }
    safeParse("seen_episode_latest.csv", parseCW)
    safeParse("show_seen_episode_latest.csv", parseCW)

    // 7. Parse Collections
    const parseLists = (rows: Record<string, string>[]) => {
      const listGroups: Record<string, ParsedCollection> = {}

      rows.forEach((row) => {
        const listName = row["name"] || row["s_key"] || "My Playlist"
        const desc = row["description"] || null
        const objectsStr = row["objects"] || ""

        if (!objectsStr || objectsStr === "[]") return

        const items = parseObjectsField(objectsStr)
        if (items.length === 0) return

        if (!listGroups[listName]) {
          listGroups[listName] = {
            name: listName,
            description: desc,
            color: "#7C3AED",
            icon: "Layers",
            items: [],
          }
        }

        items.forEach((item) => {
          const title = tvTimeShowNames.get(item.id) || `Title ${item.id}`
          ensureLibraryItem(item.id, item.type, title, { status: "planning", watchlist: true })

          listGroups[listName].items.push({
            media_id: item.id,
            media_type: item.type,
            title,
            poster_path: null,
          })
        })
      })

      Object.values(listGroups).forEach((newCol) => {
        const existing = collections.find(
          (c) => c.name.toLowerCase().trim() === newCol.name.toLowerCase().trim()
        )
        if (existing) {
          newCol.items.forEach((newItem) => {
            if (
              !existing.items.some(
                (i) => i.media_id === newItem.media_id && i.media_type === newItem.media_type
              )
            ) {
              existing.items.push(newItem)
            }
          })
        } else {
          collections.push(newCol)
        }
      })
    }
    safeParse("lists-prod-lists.csv", parseLists)

    // 8. Parse Special Status
    safeParse("user_show_special_status.csv", (rows) => {
      rows.forEach((row) => {
        const showId = row["tv_show_id"] || row["show_id"] || ""
        const status = row["special_status"] || row["status"] || ""
        if (!showId || !status) return

        const title = tvTimeShowNames.get(showId) || `TV Show ${showId}`
        ensureLibraryItem(showId, "tv", title)

        specialStatuses.push({
          show_id: showId,
          status: status.toLowerCase().trim(),
        })
      })
    })

    // 9. Ratings
    safeParse("ratings-live-votes.csv", (rows) => {
      rows.forEach((row) => {
        const movieId = row["movie_id"] || row["media_id"] || row["uuid"] || ""
        let ratingValStr = row["rating"] || row["vote"] || ""
        if (!ratingValStr && row["vote_key"]) {
          const parts = row["vote_key"].split("-")
          ratingValStr = parts[parts.length - 1]
        }
        const ratingVal = parseFloat(ratingValStr)
        if (!movieId || isNaN(ratingVal)) return

        const title = tvTimeShowNames.get(movieId) || row["movie_name"] || "Movie"
        ensureLibraryItem(movieId, "movie", title)

        const rating = Math.round(ratingVal * (ratingVal <= 5 ? 2 : 1))
        ratings.push({
          media_id: movieId,
          media_type: "movie",
          rating,
        })
      })
    })

    safeParse("ratings-3-prod-episode_votes.csv", (rows) => {
      rows.forEach((row) => {
        let showId = row["tv_show_id"] || row["show_id"] || ""
        if (!showId && row["series_name"]) {
          showId = showNameToIdMap.get(row["series_name"].toLowerCase().trim()) || ""
        }
        const seasonNum = parseInt(row["season_number"] || "", 10)
        const episodeNum = parseInt(row["episode_number"] || "", 10)
        let ratingValStr = row["rating"] || row["vote"] || ""
        if (!ratingValStr && row["vote_key"]) {
          const parts = row["vote_key"].split("-")
          ratingValStr = parts[parts.length - 1]
        }
        const ratingVal = parseFloat(ratingValStr)
        if (!showId || isNaN(seasonNum) || isNaN(episodeNum) || isNaN(ratingVal)) return

        const title = tvTimeShowNames.get(showId) || row["series_name"] || `TV Show ${showId}`
        ensureLibraryItem(showId, "tv", title)

        const rating = Math.round(ratingVal * (ratingVal <= 5 ? 2 : 1))
        ratings.push({
          media_id: showId,
          media_type: "tv",
          rating,
          season_number: seasonNum,
          episode_number: episodeNum,
        })
      })
    })

    // 10. Reactions
    safeParse("emotions-live-votes.csv", (rows) => {
      rows.forEach((row) => {
        const movieId = row["movie_id"] || row["media_id"] || row["uuid"] || ""
        let reaction = row["emotion"] || row["emotion_id"] || row["reaction"] || ""
        if (!reaction && row["vote_key"]) {
          const parts = row["vote_key"].split("-")
          reaction = parts[parts.length - 1]
        }
        if (!movieId || !reaction) return

        const title = tvTimeShowNames.get(movieId) || row["movie_name"] || "Movie"
        ensureLibraryItem(movieId, "movie", title)

        reactions.push({
          media_id: movieId,
          media_type: "movie",
          reaction,
        })
      })
    })

    safeParse("emotions-3-prod-episode_votes.csv", (rows) => {
      rows.forEach((row) => {
        let showId = row["tv_show_id"] || row["show_id"] || ""
        if (!showId && row["series_name"]) {
          showId = showNameToIdMap.get(row["series_name"].toLowerCase().trim()) || ""
        }
        const seasonNum = parseInt(row["season_number"] || "", 10)
        const episodeNum = parseInt(row["episode_number"] || "", 10)
        let reaction = row["emotion"] || row["emotion_id"] || row["reaction"] || ""
        if (!reaction && row["vote_key"]) {
          const parts = row["vote_key"].split("-")
          reaction = parts[parts.length - 1]
        }
        if (!showId || isNaN(seasonNum) || isNaN(episodeNum) || !reaction) return

        const title = tvTimeShowNames.get(showId) || row["series_name"] || `TV Show ${showId}`
        ensureLibraryItem(showId, "tv", title)

        reactions.push({
          media_id: showId,
          media_type: "tv",
          reaction,
          season_number: seasonNum,
          episode_number: episodeNum,
        })
      })
    })

    // 11. Badges
    safeParse("user_badge.csv", (rows) => {
      rows.forEach((row) => {
        const badgeName = row["badge_name"] || row["title"] || ""
        if (!badgeName) return

        badges.push({
          badge_name: badgeName,
          unlocked_at: row["unlocked_at"] || row["date_unlocked"] || null,
        })
      })
    })

    // 12. Statistics
    safeParse("user_statistics.csv", (rows) => {
      if (rows.length > 0) {
        const r = rows[0]
        userStats = {
          shows_count: parseInt(r["shows_count"] || r["shows"] || "0", 10),
          episodes_count: parseInt(r["episodes_count"] || r["episodes"] || "0", 10),
          movies_count: parseInt(r["movies_count"] || r["movies"] || "0", 10),
          watch_count: parseInt(r["watch_count"] || r["watches"] || "0", 10),
        }
      }
    })

    return {
      libraryItems,
      watchHistory,
      episodeProgress,
      collections,
      continueWatching,
      specialStatuses,
      ratings,
      reactions,
      badges,
      userStats,
    }
  },

  async preview(userId: string, data: ImportParsedData): Promise<ImportPreviewData> {
    const [libRes, epRes] = await Promise.all([
      supabase.from("library").select("media_id, media_type, favorite").eq("user_id", userId),
      supabase
        .from("episode_progress")
        .select("media_id, season_number, episode_number")
        .eq("user_id", userId),
    ])

    const existingLib = libRes.data || []
    const existingEp = epRes.data || []

    const existingLibKeys = new Set(
      existingLib.map((item) => `${item.media_type}_${item.media_id}`)
    )
    const existingEpKeys = new Set(
      existingEp.map((item) => `${item.media_id}_${item.season_number}_${item.episode_number}`)
    )

    let duplicateLibraryCount = 0
    data.libraryItems.forEach((item) => {
      if (existingLibKeys.has(`${item.media_type}_${item.media_id}`)) {
        duplicateLibraryCount++
      }
    })

    let duplicateProgressCount = 0
    data.episodeProgress.forEach((item) => {
      if (existingEpKeys.has(`${item.show_id}_${item.season_number}_${item.episode_number}`)) {
        duplicateProgressCount++
      }
    })

    const totalFavorites = data.libraryItems.filter((i) => i.favorite).length

    return {
      totalShows: data.libraryItems.filter((i) => i.media_type === "tv").length,
      totalEpisodes: data.episodeProgress.length,
      totalCollections: data.collections.length,
      totalFavorites,
      duplicateLibraryCount,
      duplicateProgressCount,
    }
  },

  async import(
    userId: string,
    data: ImportParsedData,
    options: ImportOptions,
    onProgress?: (taskName: string, pct: number) => void
  ): Promise<ImportSummaryData> {
    const startTime = Date.now()
    let importedShows = 0
    let importedMovies = 0
    let importedEpisodes = 0
    let importedHistory = 0
    let importedCollections = 0
    let importedFavorites = 0
    let importedRatings = 0
    let importedReactions = 0
    let tmdbMatches = 0
    let tmdbNotFound = 0
    let duplicatesSkipped = 0
    let failedCount = 0

    const stageTrace = {
      library: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
      progress: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
      history: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
      collections: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
      collectionItems: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
      ratings: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
      reactions: { parsed: 0, mapped: 0, skipped: 0, inserted: 0, failed: 0 },
    }

    stageTrace.library.parsed = data.libraryItems.length
    stageTrace.progress.parsed = data.episodeProgress.length
    stageTrace.history.parsed = data.watchHistory.length
    stageTrace.collections.parsed = data.collections.length

    let totalColItems = 0
    data.collections.forEach((c) => (totalColItems += c.items.length))
    stageTrace.collectionItems.parsed = totalColItems
    stageTrace.ratings.parsed = data.ratings?.length || 0
    stageTrace.reactions.parsed = data.reactions?.length || 0

    const logs: string[] = []
    logs.push("Starting TV Time GDPR import pipeline...")

    // Pre-process: Apply special statuses to library items
    if (data.specialStatuses && data.specialStatuses.length > 0) {
      const statusMap = new Map(data.specialStatuses.map((s) => [s.show_id, s.status]))
      data.libraryItems.forEach((item) => {
        const specStatus = statusMap.get(item.media_id)
        if (specStatus) {
          let status: LibraryStatus = "planning"
          if (specStatus.includes("watching")) status = "watching"
          else if (specStatus.includes("complete")) status = "completed"
          else if (specStatus.includes("drop")) status = "dropped"
          else if (specStatus.includes("pause") || specStatus.includes("hold")) status = "on_hold"
          item.status = status
          item.watchlist = status === "planning"
        }
      })
    }

    // Pre-process: Apply movie ratings
    if (data.ratings && data.ratings.length > 0) {
      const movieRatingsMap = new Map(
        data.ratings.filter((r) => r.media_type === "movie").map((r) => [r.media_id, r.rating])
      )
      data.libraryItems.forEach((item) => {
        if (item.media_type === "movie") {
          const rVal = movieRatingsMap.get(item.media_id)
          if (rVal !== undefined) {
            item.rating = rVal
            importedRatings++
          }
        }
      })
    }

    // Pre-process: Format episode ratings as library notes metadata
    if (data.ratings && data.ratings.length > 0) {
      const episodeRatingsMap = new Map<string, string[]>()
      data.ratings
        .filter((r) => r.media_type === "tv" && r.season_number && r.episode_number)
        .forEach((r) => {
          const showId = r.media_id
          const ratingStr = `S${r.season_number}E${r.episode_number}: ${r.rating}/10`
          const list = episodeRatingsMap.get(showId) || []
          list.push(ratingStr)
          episodeRatingsMap.set(showId, list)
          importedRatings++
        })

      data.libraryItems.forEach((item) => {
        if (item.media_type === "tv") {
          const ratingsList = episodeRatingsMap.get(item.media_id)
          if (ratingsList && ratingsList.length > 0) {
            const ratingsSection = `Episode Ratings:\n${ratingsList.map((str) => `- ${str}`).join("\n")}`
            item.notes = item.notes ? `${item.notes}\n\n${ratingsSection}` : ratingsSection
          }
        }
      })
    }

    // Pre-process: Format reactions/emotions as library notes metadata
    if (data.reactions && data.reactions.length > 0) {
      const reactionsMap = new Map<string, string[]>()
      data.reactions.forEach((r) => {
        const key = `${r.media_type}_${r.media_id}`
        const str =
          r.season_number && r.episode_number
            ? `S${r.season_number}E${r.episode_number}: ${r.reaction}`
            : `Reaction: ${r.reaction}`
        const list = reactionsMap.get(key) || []
        list.push(str)
        reactionsMap.set(key, list)
        importedReactions++
      })

      data.libraryItems.forEach((item) => {
        const key = `${item.media_type}_${item.media_id}`
        const list = reactionsMap.get(key)
        if (list && list.length > 0) {
          const section = `Reactions:\n${list.map((str) => `- ${str}`).join("\n")}`
          item.notes = item.notes ? `${item.notes}\n\n${section}` : section
        }
      })
    }

    // Pre-process: Apply continue watching parameters
    if (data.continueWatching && data.continueWatching.length > 0) {
      const latestCW = new Map<string, ParsedContinueWatching>()
      data.continueWatching.forEach((cw) => {
        const existing = latestCW.get(cw.show_id)
        if (
          !existing ||
          new Date(cw.last_watched_at || 0) > new Date(existing.last_watched_at || 0)
        ) {
          latestCW.set(cw.show_id, cw)
        }
      })

      data.libraryItems.forEach((item) => {
        if (item.media_type === "tv") {
          const cw = latestCW.get(item.media_id)
          if (cw) {
            item.current_season = cw.season_number
            item.current_episode = cw.episode_number
            item.last_episode_name = cw.episode_name
            item.last_watched_at = cw.last_watched_at
          }
        }
      })
    }

    // 1. TMDB Enrichment & ID Mapping
    const tvTimeIdMap = new Map<string, string>()
    onProgress?.("Querying TMDB for metadata enrichment...", 5)

    const genresMap = await fetchGenreMap()
    const allMediaToSearch = [...data.libraryItems]
    const searchBatchSize = 5

    for (let k = 0; k < allMediaToSearch.length; k += searchBatchSize) {
      const batch = allMediaToSearch.slice(k, k + searchBatchSize)
      await Promise.all(
        batch.map(async (item) => {
          const originalId = item.media_id
          try {
            const res = await tmdbClient.request<{ results: TMDBMediaItem[] }>(
              TMDB_ENDPOINTS.SEARCH,
              { query: item.title }
            )
            const match = res.results.find((r) => r.media_type === item.media_type)
            if (match) {
              tvTimeIdMap.set(originalId, String(match.id))
              item.media_id = String(match.id)
              item.poster_path = match.poster_path
              item.backdrop_path = match.backdrop_path
              item.overview = match.overview
              item.genres = match.genre_ids.map((id) => genresMap[id] || "").filter(Boolean)
              item.release_date = match.release_date || match.first_air_date || null
              item.rating =
                item.rating || (match.vote_average ? Math.round(match.vote_average / 2) : null)
              const enriched = item as EnrichedParsedLibraryItem
              enriched._originalTvTimeId = originalId
              tmdbMatches++

              // Get TMDB show details to fetch total episodes count and episode runtime
              if (item.media_type === "tv") {
                try {
                  const tvDetails = await tmdbClient.request<{
                    number_of_episodes?: number
                    episode_run_time?: number[]
                  }>(TMDB_ENDPOINTS.TV_DETAILS(match.id))
                  if (tvDetails) {
                    if (tvDetails.number_of_episodes) {
                      enriched._totalEpisodes = tvDetails.number_of_episodes
                    }
                    if (tvDetails.episode_run_time && tvDetails.episode_run_time.length > 0) {
                      item.runtime_minutes = tvDetails.episode_run_time[0]
                    }
                  }
                } catch (tvErr) {
                  console.warn(`Failed fetching TV details for ${item.title}:`, tvErr)
                }
              }

              // Get TMDB movie details to fetch movie runtime
              if (item.media_type === "movie") {
                try {
                  const movieDetails = await tmdbClient.request<{ runtime?: number }>(
                    TMDB_ENDPOINTS.MOVIE_DETAILS(match.id)
                  )
                  if (movieDetails && movieDetails.runtime) {
                    item.runtime_minutes = movieDetails.runtime
                  }
                } catch (movieErr) {
                  console.warn(`Failed fetching movie details for ${item.title}:`, movieErr)
                }
              }
            } else {
              tmdbNotFound++
            }
          } catch (err) {
            console.warn(`TMDB lookup failed for ${item.title}:`, err)
            tmdbNotFound++
          }
        })
      )
      onProgress?.(
        "Querying TMDB for metadata enrichment...",
        Math.round(5 + (k / allMediaToSearch.length) * 15)
      )
    }

    logs.push(`TMDB Enrichment complete: ${tmdbMatches} matched, ${tmdbNotFound} not found.`)

    // Pre-calculate TV show progress, started_at, and updated_progress_at before insertion
    const tvShowWatchedCounts = new Map<string, number>()
    const tvShowWatchDates = new Map<string, string[]>()

    data.episodeProgress.forEach((ep) => {
      const count = tvShowWatchedCounts.get(ep.show_id) || 0
      tvShowWatchedCounts.set(ep.show_id, count + 1)

      const dates = tvShowWatchDates.get(ep.show_id) || []
      if (ep.watched_at) {
        dates.push(ep.watched_at)
      }
      tvShowWatchDates.set(ep.show_id, dates)
    })

    data.libraryItems.forEach((item) => {
      const enriched = item as EnrichedParsedLibraryItem
      const originalTvTimeId = enriched._originalTvTimeId || item.media_id

      if (item.media_type === "tv") {
        const watchedCount = tvShowWatchedCounts.get(originalTvTimeId) || 0
        const total = enriched._totalEpisodes || 0

        const progress = total > 0 ? Math.round((watchedCount / total) * 100) : 0
        item.progress = progress

        if (progress === 100) {
          item.status = "completed"
        }

        const dates = tvShowWatchDates.get(originalTvTimeId) || []
        if (dates.length > 0) {
          const parsedDates = dates.map((d) => new Date(d).getTime()).filter((t) => !isNaN(t))
          if (parsedDates.length > 0) {
            const minDate = new Date(Math.min(...parsedDates)).toISOString()
            const maxDate = new Date(Math.max(...parsedDates)).toISOString()
            item.started_at = minDate
            item.updated_progress_at = maxDate
            item.last_watched_at = item.last_watched_at || maxDate
          }
        }
      } else {
        if (item.status === "completed") {
          item.progress = 100
        }
      }
    })

    // Rewrite mapped IDs in other parsed items
    data.episodeProgress.forEach((ep) => {
      const mapped = tvTimeIdMap.get(ep.show_id)
      if (mapped) ep.show_id = mapped
    })

    data.watchHistory.forEach((wh) => {
      const mapped = tvTimeIdMap.get(wh.media_id)
      if (mapped) wh.media_id = mapped
    })

    data.collections.forEach((col) => {
      col.items.forEach((item) => {
        const mapped = tvTimeIdMap.get(item.media_id)
        if (mapped) item.media_id = mapped
      })
    })

    // Step 1: Audit authentication
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Current User Audit:", {
      currentUser: authUser ? "Detected" : "None",
      userId: authUser?.id || "None",
      passedUserId: userId,
      email: authUser?.email || "None",
      authError: authError?.message || "None",
    })

    if (!authUser) {
      logs.push("Import failed: No authenticated user found.")
      throw new Error(
        "Import failed: No authenticated user session found. Please re-authenticate and try again."
      )
    }

    const activeUserId = authUser.id

    // 2. Library import (Merge duplicate handling)
    const tmdbToLibraryIdMap = new Map<string, string>()

    // Load initial user library records to populate the map
    let initialLib: any[] = []
    let fromLib = 0
    let hasMoreLib = true
    while (hasMoreLib) {
      const { data: pageData, error: libErr } = await supabase
        .from("library")
        .select("id, media_id, media_type")
        .eq("user_id", activeUserId)
        .range(fromLib, fromLib + 999)
      if (libErr) throw libErr
      if (!pageData || pageData.length === 0) {
        hasMoreLib = false
      } else {
        initialLib = [...initialLib, ...pageData]
        fromLib += 1000
        if (pageData.length < 1000) {
          hasMoreLib = false
        }
      }
    }

    initialLib.forEach((row) => {
      tmdbToLibraryIdMap.set(`${row.media_type}_${row.media_id}`, row.id)
    })

    const getLibraryId = (tvTimeId: string, mediaType: "movie" | "tv"): string | undefined => {
      const tmdbId = tvTimeIdMap.get(tvTimeId) || tvTimeId
      return tmdbToLibraryIdMap.get(`${mediaType}_${tmdbId}`)
    }

    if (options.importLibrary && data.libraryItems.length > 0) {
      onProgress?.("Importing library statuses...", 25)
      
      let dbLib: any[] = []
      let fromDbLib = 0
      let hasMoreDbLib = true
      while (hasMoreDbLib) {
        const { data: pageData, error: dbLibErr } = await supabase
          .from("library")
          .select("*")
          .eq("user_id", activeUserId)
          .range(fromDbLib, fromDbLib + 999)
        if (dbLibErr) throw dbLibErr
        if (!pageData || pageData.length === 0) {
          hasMoreDbLib = false
        } else {
          dbLib = [...dbLib, ...pageData]
          fromDbLib += 1000
          if (pageData.length < 1000) {
            hasMoreDbLib = false
          }
        }
      }
      const libMap = new Map((dbLib || []).map((i) => [`${i.media_type}_${i.media_id}`, i]))

      const chunks = chunkArray(data.libraryItems, 50)
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const inserts: Record<string, unknown>[] = []
        const updates: Record<string, unknown>[] = []

        chunk.forEach((rawItem) => {
          const item = validateAndCleanLibraryItem(rawItem, activeUserId)
          if (!item) {
            logs.push(`Skipped library item (failed validation): "${rawItem.title || "Unknown"}"`)
            duplicatesSkipped++
            stageTrace.library.skipped++
            return
          }

          const key = `${item.media_type}_${item.media_id}`
          const dbItem = libMap.get(key)

          if (dbItem) {
            // Step 5: Verify existing library row owner
            if (dbItem.user_id !== activeUserId) {
              logs.push(
                `Security mismatch: Library row ID ${dbItem.id} owner (${dbItem.user_id}) does not match authenticated user (${activeUserId}). Skipping.`
              )
              duplicatesSkipped++
              stageTrace.library.skipped++
              return
            }

            stageTrace.library.mapped++

            updates.push({
              id: dbItem.id,
              user_id: activeUserId,
              media_id: item.media_id,
              media_type: item.media_type,
              rating: dbItem.rating ?? item.rating,
              favorite: dbItem.favorite || item.favorite,
              status: item.status,
              watchlist: item.watchlist,
              poster_path: dbItem.poster_path || item.poster_path,
              backdrop_path: dbItem.backdrop_path || item.backdrop_path,
              overview: dbItem.overview || item.overview,
              genres: dbItem.genres || item.genres,
              release_date: dbItem.release_date || item.release_date,
              current_season: dbItem.current_season ?? item.current_season,
              current_episode: dbItem.current_episode ?? item.current_episode,
              last_episode_name: dbItem.last_episode_name ?? item.last_episode_name,
              last_watched_at: dbItem.last_watched_at ?? item.last_watched_at,
              times_watched: dbItem.times_watched ?? item.times_watched,
              notes: dbItem.notes ? `${dbItem.notes}\n\n${item.notes || ""}`.trim() : item.notes,
              progress: dbItem.progress ?? item.progress,
              started_at: dbItem.started_at ?? item.started_at,
              updated_progress_at: dbItem.updated_progress_at ?? item.updated_progress_at,
              runtime_minutes: dbItem.runtime_minutes ?? item.runtime_minutes,
              updated_at: new Date().toISOString(),
            })
            if (item.favorite) importedFavorites++
            if (item.media_type === "movie") importedMovies++
            else importedShows++
          } else {
            stageTrace.library.mapped++
            inserts.push({
              user_id: activeUserId,
              media_id: item.media_id,
              media_type: item.media_type,
              title: item.title,
              status: item.status,
              favorite: item.favorite,
              watchlist: item.watchlist,
              rating: item.rating,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: item.overview,
              genres: item.genres,
              release_date: item.release_date,
              current_season: item.current_season,
              current_episode: item.current_episode,
              last_episode_name: item.last_episode_name,
              last_watched_at: item.last_watched_at,
              times_watched: item.times_watched,
              notes: item.notes,
              progress: item.progress,
              started_at: item.started_at,
              updated_progress_at: item.updated_progress_at,
              runtime_minutes: item.runtime_minutes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            if (item.favorite) importedFavorites++
            if (item.media_type === "movie") importedMovies++
            else importedShows++
          }
        })

        // Step 2: Audit library payload before insert
        inserts.forEach((item) => {
          const tmdbId = tvTimeIdMap.get(item.media_id as string) || (item.media_id as string)
          console.log("Auditing Insert Payload:", {
            user_id: item.user_id,
            media_id: item.media_id,
            media_type: item.media_type,
            title: item.title,
            status: item.status,
            progress: item.progress,
            tmdb_id: tmdbId,
          })
          if (!item.user_id) throw new Error("Validation Error: user_id is null on insert")
          if (item.user_id !== activeUserId)
            throw new Error(
              "Security Error: user_id does not match authenticated user ID on insert"
            )
          if (!item.media_id) throw new Error("Validation Error: media_id is missing on insert")
          if (!item.media_type) throw new Error("Validation Error: media_type is missing on insert")
        })

        // Chunk Insert Stability with One-by-One fallback and select mapping retention
        try {
          if (inserts.length > 0) {
            const { data: insertedData, error } = await supabase
              .from("library")
              .insert(inserts)
              .select("id, media_id, media_type")
            if (error) throw error
            insertedData?.forEach((row) => {
              tmdbToLibraryIdMap.set(`${row.media_type}_${row.media_id}`, row.id)
            })
            stageTrace.library.inserted += inserts.length
          }
        } catch (bulkErr: unknown) {
          const bulkMsg = bulkErr instanceof Error ? bulkErr.message : String(bulkErr)
          logs.push(
            `Library bulk insert chunk ${i} failed (${bulkMsg}). Retrying one-by-one fallback...`
          )
          for (const item of inserts) {
            try {
              const tmdbId = tvTimeIdMap.get(item.media_id as string) || (item.media_id as string)
              console.log("Auditing Individual Insert Retry Payload:", {
                user_id: item.user_id,
                media_id: item.media_id,
                media_type: item.media_type,
                title: item.title,
                status: item.status,
                progress: item.progress,
                tmdb_id: tmdbId,
              })
              // Retry with upsert to avoid unique key violation (23505) and update instead
              const { data: insertedData, error } = await supabase
                .from("library")
                .upsert([item], { onConflict: "user_id,media_id,media_type" })
                .select("id, media_id, media_type")
              if (error) throw error
              if (insertedData && insertedData[0]) {
                const row = insertedData[0]
                tmdbToLibraryIdMap.set(`${row.media_type}_${row.media_id}`, row.id)
              }
              stageTrace.library.inserted++
            } catch (e: unknown) {
              stageTrace.library.failed++
              failedCount++
              importedShows--
              if (item.media_type === "movie") importedMovies--
              const errObj = e as {
                message?: string
                details?: string
                hint?: string
                code?: string
              }
              const errDetail = errObj
                ? `Message: ${errObj.message || "Unknown"}, Details: ${errObj.details || "None"}, Hint: ${errObj.hint || "None"}, Code: ${errObj.code || "None"}`
                : String(e)
              logs.push(`Failed to insert library item "${item.title}": ${errDetail}`)

              // Step 6: Improved Error Logging
              console.error("Library Upsert Failed", {
                title: item.title || "",
                user_id: item.user_id,
                media_id: item.media_id,
                media_type: item.media_type,
                message: errObj?.message || "Unknown error",
                details: errObj?.details || "None",
                hint: errObj?.hint || "None",
                code: errObj?.code || "None",
              })
            }
          }
        }

        // Step 2: Audit library payload before update
        updates.forEach((item) => {
          const tmdbId = tvTimeIdMap.get(item.media_id as string) || (item.media_id as string)
          console.log("Auditing Update Payload:", {
            user_id: item.user_id,
            media_id: item.media_id,
            media_type: item.media_type,
            title: item.title,
            status: item.status,
            progress: item.progress,
            tmdb_id: tmdbId,
          })
          if (!item.user_id) throw new Error("Validation Error: user_id is null on update")
          if (item.user_id !== activeUserId)
            throw new Error(
              "Security Error: user_id does not match authenticated user ID on update"
            )
          if (!item.media_id) throw new Error("Validation Error: media_id is missing on update")
          if (!item.media_type) throw new Error("Validation Error: media_type is missing on update")
        })

        try {
          if (updates.length > 0) {
            // Step 4: Conflict target user-scoped (user_id, media_id, media_type)
            const { data: updatedData, error } = await supabase
              .from("library")
              .upsert(updates, { onConflict: "user_id,media_id,media_type" })
              .select("id, media_id, media_type")
            if (error) throw error
            updatedData?.forEach((row) => {
              tmdbToLibraryIdMap.set(`${row.media_type}_${row.media_id}`, row.id)
            })
            stageTrace.library.inserted += updates.length
          }
        } catch (bulkErr: unknown) {
          const bulkMsg = bulkErr instanceof Error ? bulkErr.message : String(bulkErr)
          logs.push(
            `Library bulk upsert chunk ${i} failed (${bulkMsg}). Retrying one-by-one fallback...`
          )
          for (const item of updates) {
            try {
              const tmdbId = tvTimeIdMap.get(item.media_id as string) || (item.media_id as string)
              console.log("Auditing Individual Update Retry Payload:", {
                user_id: item.user_id,
                media_id: item.media_id,
                media_type: item.media_type,
                title: item.title,
                status: item.status,
                progress: item.progress,
                tmdb_id: tmdbId,
              })
              const { data: updatedData, error } = await supabase
                .from("library")
                .upsert([item], { onConflict: "user_id,media_id,media_type" })
                .select("id, media_id, media_type")
              if (error) throw error
              if (updatedData && updatedData[0]) {
                const row = updatedData[0]
                tmdbToLibraryIdMap.set(`${row.media_type}_${row.media_id}`, row.id)
              }
              stageTrace.library.inserted++
            } catch (e: unknown) {
              stageTrace.library.failed++
              failedCount++
              importedShows--
              const errObj = e as {
                message?: string
                details?: string
                hint?: string
                code?: string
              }
              const errDetail = errObj
                ? `Message: ${errObj.message || "Unknown"}, Details: ${errObj.details || "None"}, Hint: ${errObj.hint || "None"}, Code: ${errObj.code || "None"}`
                : String(e)
              logs.push(`Failed to update library item ID "${item.id}": ${errDetail}`)

              // Step 6: Improved Error Logging
              console.error("Library Upsert Failed", {
                title: item.title || "",
                user_id: item.user_id,
                media_id: item.media_id,
                media_type: item.media_type,
                message: errObj?.message || "Unknown error",
                details: errObj?.details || "None",
                hint: errObj?.hint || "None",
                code: errObj?.code || "None",
              })
            }
          }
        }
        onProgress?.("Importing library statuses...", Math.round(25 + (i / chunks.length) * 20))
      }

      console.log("Library Import Stage Trace:", stageTrace.library)
      logs.push(
        `Library Import Stage Details: Parsed: ${stageTrace.library.parsed}, Mapped: ${stageTrace.library.mapped}, Skipped: ${stageTrace.library.skipped}, Inserted: ${stageTrace.library.inserted}, Failed: ${stageTrace.library.failed}`
      )
      if (stageTrace.library.parsed > 0 && stageTrace.library.inserted === 0) {
        console.error("Pipeline stopped: Library import inserted 0 rows.", {
          tmdbToLibraryIdMapSize: tmdbToLibraryIdMap.size,
          first10Keys: Array.from(tmdbToLibraryIdMap.keys()).slice(0, 10),
          first10Values: Array.from(tmdbToLibraryIdMap.keys())
            .slice(0, 10)
            .map((k) => tmdbToLibraryIdMap.get(k)),
          tvTimeIdMapSize: tvTimeIdMap.size,
        })
        throw new Error(
          `Import Pipeline Stopped: Library import stage inserted 0 rows out of ${stageTrace.library.parsed} parsed. ` +
            `Reason: All parsed items were skipped or failed database writes. ` +
            `tmdbToLibraryIdMap size: ${tmdbToLibraryIdMap.size}, tvTimeIdMap size: ${tvTimeIdMap.size}`
        )
      }
    }

    // 3. Episode progress import (Merge: skip if exists, else insert)
    if (options.importProgress && data.episodeProgress.length > 0) {
      onProgress?.("Importing episode watched records...", 50)
      let dbEp: any[] = []
      let fromDbEp = 0
      let hasMoreDbEp = true
      while (hasMoreDbEp) {
        const { data: pageData, error: dbEpErr } = await supabase
          .from("episode_progress")
          .select("*")
          .eq("user_id", activeUserId)
          .range(fromDbEp, fromDbEp + 999)
        if (dbEpErr) throw dbEpErr
        if (!pageData || pageData.length === 0) {
          hasMoreDbEp = false
        } else {
          dbEp = [...dbEp, ...pageData]
          fromDbEp += 1000
          if (pageData.length < 1000) {
            hasMoreDbEp = false
          }
        }
      }
      const epSet = new Set(
        (dbEp || []).map((i) => `${i.media_id}_${i.season_number}_${i.episode_number}`)
      )

      // Group episode progress to calculate watch_count, first_watched_at, last_watched_at
      const groupedEpisodes = new Map<
        string,
        {
          show_id: string
          season_number: number
          episode_number: number
          watches: string[]
          runtime_minutes: number
        }
      >()

      data.episodeProgress.forEach((item) => {
        const key = `${item.show_id}_${item.season_number}_${item.episode_number}`
        if (!groupedEpisodes.has(key)) {
          groupedEpisodes.set(key, {
            show_id: item.show_id,
            season_number: item.season_number,
            episode_number: item.episode_number,
            watches: [],
            runtime_minutes: item.runtime_minutes || 45,
          })
        }
        groupedEpisodes.get(key)!.watches.push(item.watched_at || new Date().toISOString())
      })

      const uniqueGroupedList = Array.from(groupedEpisodes.values())
      const chunks = chunkArray(uniqueGroupedList, 100)
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const inserts: Record<string, unknown>[] = []

        chunk.forEach((item) => {
          const tmdbId = tvTimeIdMap.get(item.show_id) || item.show_id
          const key = `${tmdbId}_${item.season_number}_${item.episode_number}`
          if (epSet.has(key)) {
            logs.push(
              `Skipped duplicate episode progress: Show ${item.show_id} (TMDB: ${tmdbId}) S${item.season_number}E${item.episode_number}`
            )
            duplicatesSkipped++
            stageTrace.progress.skipped++
            return
          }

          const libId = getLibraryId(item.show_id, "tv")
          if (libId) {
            stageTrace.progress.mapped++

            // Sort watches ascending to find first and last watched date
            const watchesSorted = [...item.watches].sort(
              (a, b) => new Date(a).getTime() - new Date(b).getTime()
            )
            const watch_count = watchesSorted.length
            const first_watched_at = watchesSorted[0]
            const last_watched_at = watchesSorted[watchesSorted.length - 1]
            const watched_at = last_watched_at

            inserts.push({
              user_id: activeUserId,
              library_id: libId,
              media_id: parseInt(tmdbId, 10),
              season_number: item.season_number,
              episode_number: item.episode_number,
              watch_status: "completed",
              watched_at,
              runtime_minutes: item.runtime_minutes || 45,
              watch_count,
              first_watched_at,
              last_watched_at,
            })
            epSet.add(key) // Prevent duplicate inserts inside the same batch!
            importedEpisodes++
          } else {
            logs.push(
              `Skipped episode progress: No library ID found in database for Show ${item.show_id} (TMDB ID: ${tmdbId})`
            )
            duplicatesSkipped++
            stageTrace.progress.skipped++
          }
        })

        try {
          if (inserts.length > 0) {
            const { error } = await supabase
              .from("episode_progress")
              .upsert(inserts, { onConflict: "user_id,media_id,season_number,episode_number" })
            if (error) throw error
            stageTrace.progress.inserted += inserts.length
          }
        } catch (bulkErr: unknown) {
          const bulkMsg = bulkErr instanceof Error ? bulkErr.message : String(bulkErr)
          logs.push(
            `Episode progress bulk insert chunk ${i} failed (${bulkMsg}). Retrying one-by-one...`
          )
          for (const item of inserts) {
            try {
              const { error } = await supabase
                .from("episode_progress")
                .upsert([item], { onConflict: "user_id,media_id,season_number,episode_number" })
              if (error) throw error
              stageTrace.progress.inserted++
            } catch (e: unknown) {
              stageTrace.progress.failed++
              failedCount++
              importedEpisodes--
              const errObj = e as {
                message?: string
                details?: string
                hint?: string
                code?: string
              }
              const errDetail = errObj
                ? `Message: ${errObj.message || "Unknown"}, Details: ${errObj.details || "None"}, Hint: ${errObj.hint || "None"}, Code: ${errObj.code || "None"}`
                : String(e)
              logs.push(
                `Failed to insert episode progress (Show: ${item.media_id}, S${item.season_number}E${item.episode_number}): ${errDetail}`
              )
            }
          }
        }
        onProgress?.(
          "Importing episode watched records...",
          Math.round(50 + (i / chunks.length) * 20)
        )
      }

      console.log("Episode Progress Import Stage Trace:", stageTrace.progress)
      logs.push(
        `Episode Progress Import Stage Details: Parsed: ${stageTrace.progress.parsed}, Mapped: ${stageTrace.progress.mapped}, Skipped: ${stageTrace.progress.skipped}, Inserted: ${stageTrace.progress.inserted}, Failed: ${stageTrace.progress.failed}`
      )
      if (stageTrace.progress.parsed > 0 && stageTrace.progress.inserted === 0) {
        console.error("Pipeline stopped: Episode progress import inserted 0 rows.", {
          tmdbToLibraryIdMapSize: tmdbToLibraryIdMap.size,
          first10Keys: Array.from(tmdbToLibraryIdMap.keys()).slice(0, 10),
          first10Values: Array.from(tmdbToLibraryIdMap.keys())
            .slice(0, 10)
            .map((k) => tmdbToLibraryIdMap.get(k)),
          tvTimeIdMapSize: tvTimeIdMap.size,
          first10TvTimeKeys: Array.from(tvTimeIdMap.keys()).slice(0, 10),
        })
        throw new Error(
          `Import Pipeline Stopped: Episode progress import stage inserted 0 rows out of ${stageTrace.progress.parsed} parsed. ` +
            `Reason: All parsed items were skipped (e.g. libraryId lookup failed) or failed database writes. ` +
            `tmdbToLibraryIdMap size: ${tmdbToLibraryIdMap.size}, tvTimeIdMap size: ${tvTimeIdMap.size}`
        )
      }
    }

    // 4. Watch history import (Skip duplicates)
    if (options.importWatchHistory && data.watchHistory.length > 0) {
      onProgress?.("Importing tracking history timeline...", 75)
      let dbHistory: any[] = []
      let fromDbHistory = 0
      let hasMoreDbHistory = true
      while (hasMoreDbHistory) {
        const { data: pageData, error: dbHistoryErr } = await supabase
          .from("watch_history")
          .select("media_id, media_type, watch_date")
          .eq("user_id", activeUserId)
          .range(fromDbHistory, fromDbHistory + 999)
        if (dbHistoryErr) throw dbHistoryErr
        if (!pageData || pageData.length === 0) {
          hasMoreDbHistory = false
        } else {
          dbHistory = [...dbHistory, ...pageData]
          fromDbHistory += 1000
          if (pageData.length < 1000) {
            hasMoreDbHistory = false
          }
        }
      }
      const historySet = new Set(
        (dbHistory || []).map((i) => `${i.media_type}_${i.media_id}_${i.watch_date}`)
      )

      const mapWatchAction = (act: string): "started" | "continued" | "completed" | "rewatched" => {
        const a = (act || "").toLowerCase()
        if (a.includes("start")) return "started"
        if (a.includes("rewatch")) return "rewatched"
        if (a.includes("continu")) return "continued"
        return "completed"
      }

      const chunks = chunkArray(data.watchHistory, 100)
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const inserts: Record<string, unknown>[] = []

        chunk.forEach((item) => {
          const tmdbId = tvTimeIdMap.get(item.media_id) || item.media_id
          const key = `${item.media_type}_${tmdbId}_${item.watch_date}`
          if (historySet.has(key)) {
            logs.push(
              `Skipped duplicate watch history: ${item.media_type} ${tmdbId} Date: ${item.watch_date}`
            )
            duplicatesSkipped++
            stageTrace.history.skipped++
            return
          }

          const libId = getLibraryId(item.media_id, item.media_type)
          if (libId) {
            stageTrace.history.mapped++
            inserts.push({
              user_id: activeUserId,
              library_id: libId,
              media_id: parseInt(tmdbId, 10),
              media_type: item.media_type,
              action: mapWatchAction(item.action),
              title: item.title,
              watch_date: item.watch_date || new Date().toISOString(),
              new_progress:
                typeof item.progress === "number" ? Math.min(Math.max(item.progress, 0), 100) : 100,
              season_number: item.season_number || null,
              episode_number: item.episode_number || null,
              episode_name: item.episode_name || null,
              still_path: item.still_path || null,
              air_date: item.air_date || null,
            })
            historySet.add(key) // Prevent duplicate inserts inside the same batch!
            importedHistory++
          } else {
            logs.push(
              `Skipped watch history: No library ID found in database for ${item.media_type} ${item.media_id} (TMDB ID: ${tmdbId})`
            )
            duplicatesSkipped++
            stageTrace.history.skipped++
          }
        })

        try {
          if (inserts.length > 0) {
            const { error } = await supabase.from("watch_history").insert(inserts)
            if (error) throw error
            stageTrace.history.inserted += inserts.length
          }
        } catch (bulkErr: unknown) {
          const bulkMsg = bulkErr instanceof Error ? bulkErr.message : String(bulkErr)
          logs.push(
            `Watch history bulk insert chunk ${i} failed (${bulkMsg}). Retrying one-by-one...`
          )
          for (const item of inserts) {
            try {
              const { error } = await supabase.from("watch_history").insert([item])
              if (error) throw error
              stageTrace.history.inserted++
            } catch (e: unknown) {
              stageTrace.history.failed++
              failedCount++
              importedHistory--
              const errObj = e as {
                message?: string
                details?: string
                hint?: string
                code?: string
              }
              const errDetail = errObj
                ? `Message: ${errObj.message || "Unknown"}, Details: ${errObj.details || "None"}, Hint: ${errObj.hint || "None"}, Code: ${errObj.code || "None"}`
                : String(e)
              logs.push(`Failed to insert watch history (TMDB: ${item.media_id}): ${errDetail}`)
            }
          }
        }
        onProgress?.(
          "Importing tracking history timeline...",
          Math.round(75 + (i / chunks.length) * 15)
        )
      }

      console.log("Watch History Import Stage Trace:", stageTrace.history)
      logs.push(
        `Watch History Import Stage Details: Parsed: ${stageTrace.history.parsed}, Mapped: ${stageTrace.history.mapped}, Skipped: ${stageTrace.history.skipped}, Inserted: ${stageTrace.history.inserted}, Failed: ${stageTrace.history.failed}`
      )
      if (stageTrace.history.parsed > 0 && stageTrace.history.inserted === 0) {
        console.error("Pipeline stopped: Watch history import inserted 0 rows.", {
          tmdbToLibraryIdMapSize: tmdbToLibraryIdMap.size,
          first10Keys: Array.from(tmdbToLibraryIdMap.keys()).slice(0, 10),
          first10Values: Array.from(tmdbToLibraryIdMap.keys())
            .slice(0, 10)
            .map((k) => tmdbToLibraryIdMap.get(k)),
          tvTimeIdMapSize: tvTimeIdMap.size,
          first10TvTimeKeys: Array.from(tvTimeIdMap.keys()).slice(0, 10),
        })
        throw new Error(
          `Import Pipeline Stopped: Watch history import stage inserted 0 rows out of ${stageTrace.history.parsed} parsed. ` +
            `Reason: All parsed items were skipped (e.g. libraryId lookup failed) or failed database writes. ` +
            `tmdbToLibraryIdMap size: ${tmdbToLibraryIdMap.size}, tvTimeIdMap size: ${tvTimeIdMap.size}`
        )
      }
    }

    // 5. Collections import (Merge by name, Skip duplicate items)
    if (options.importCollections && data.collections.length > 0) {
      onProgress?.("Importing custom playlists & collections...", 90)
      const { data: dbCols } = await supabase
        .from("collections")
        .select("id, name, items:collection_items(media_id, media_type)")
        .eq("user_id", activeUserId)
      const colMap = new Map((dbCols || []).map((i) => [i.name.toLowerCase().trim(), i]))

      for (let i = 0; i < data.collections.length; i++) {
        const col = data.collections[i]
        try {
          const existingCol = colMap.get(col.name.toLowerCase().trim())
          let colId = ""
          stageTrace.collections.mapped++

          if (existingCol) {
            colId = existingCol.id
            logs.push(`Merged with existing collection: "${col.name}"`)
            stageTrace.collections.inserted++
          } else {
            const { data: insertedCol, error: colError } = await supabase
              .from("collections")
              .insert({
                user_id: activeUserId,
                name: col.name,
                description: col.description,
                color: col.color,
                icon: col.icon,
                is_smart: false,
              })
              .select()
              .single()

            if (colError) throw colError
            colId = insertedCol.id
            importedCollections++
            stageTrace.collections.inserted++
          }

          if (col.items.length > 0) {
            const existingMediaKeys = new Set(
              (existingCol?.items || []).map((item) => `${item.media_type}_${item.media_id}`)
            )
            const listItemsToInsert = col.items
              .filter((item) => {
                const tmdbId = tvTimeIdMap.get(item.media_id) || item.media_id
                const isDuplicate = existingMediaKeys.has(`${item.media_type}_${tmdbId}`)
                if (isDuplicate) {
                  logs.push(
                    `Skipped duplicate collection item: Collection "${col.name}" -> ${item.media_type} ${tmdbId}`
                  )
                  duplicatesSkipped++
                  stageTrace.collectionItems.skipped++
                  return false
                }
                return true
              })
              .map((item) => {
                const tmdbId = tvTimeIdMap.get(item.media_id) || item.media_id
                const libId = getLibraryId(item.media_id, item.media_type)
                if (!libId) {
                  logs.push(
                    `Skipped collection item: No library ID found in database for Collection "${col.name}" -> ${item.media_type} ${item.media_id} (TMDB ID: ${tmdbId})`
                  )
                  duplicatesSkipped++
                  stageTrace.collectionItems.skipped++
                  return null
                }
                stageTrace.collectionItems.mapped++
                // Note: library_id is omitted here because it does not exist in collection_items DB schema
                return {
                  collection_id: colId,
                  media_id: parseInt(tmdbId, 10),
                  media_type: item.media_type,
                  title: item.title,
                  poster_path: item.poster_path,
                }
              })
              .filter(Boolean) as Record<string, unknown>[]

            if (listItemsToInsert.length > 0) {
              const { error: itemsError } = await supabase
                .from("collection_items")
                .upsert(listItemsToInsert, { onConflict: "collection_id,media_id,media_type" })
              if (itemsError) throw itemsError
              stageTrace.collectionItems.inserted += listItemsToInsert.length
            } else {
              duplicatesSkipped += col.items.length
            }
          }
        } catch (err: unknown) {
          failedCount++
          stageTrace.collections.failed++
          const errObj = err as { message?: string; details?: string }
          const errDetail = errObj
            ? `Message: ${errObj.message || "Unknown"}, Details: ${errObj.details || "None"}`
            : String(err)
          logs.push(`Error building collection ${col.name}: ${errDetail}`)
        }
      }
      onProgress?.("Importing custom playlists & collections...", 98)

      console.log("Collections Import Stage Trace:", stageTrace.collections)
      console.log("Collection Items Import Stage Trace:", stageTrace.collectionItems)
      logs.push(
        `Collections Import Stage Details: Parsed: ${stageTrace.collections.parsed}, Mapped: ${stageTrace.collections.mapped}, Skipped: ${stageTrace.collections.skipped}, Inserted: ${stageTrace.collections.inserted}, Failed: ${stageTrace.collections.failed}`
      )
      logs.push(
        `Collection Items Import Stage Details: Parsed: ${stageTrace.collectionItems.parsed}, Mapped: ${stageTrace.collectionItems.mapped}, Skipped: ${stageTrace.collectionItems.skipped}, Inserted: ${stageTrace.collectionItems.inserted}, Failed: ${stageTrace.collectionItems.failed}`
      )

      if (stageTrace.collections.parsed > 0 && stageTrace.collections.inserted === 0) {
        throw new Error(
          `Import Pipeline Stopped: Collections import stage inserted 0 rows out of ${stageTrace.collections.parsed} parsed.`
        )
      }
      if (stageTrace.collectionItems.parsed > 0 && stageTrace.collectionItems.inserted === 0) {
        throw new Error(
          `Import Pipeline Stopped: Collection items import stage inserted 0 rows out of ${stageTrace.collectionItems.parsed} parsed.`
        )
      }
    }

    // Achievements calculation
    let mappedAchievements = 0
    if (data.badges && data.badges.length > 0) {
      mappedAchievements = data.badges.length
    }

    // Verification statistics check
    let verificationStatus: "Verified" | "Mismatch" = "Verified"
    let verificationReport = "No user_statistics.csv found. verification skipped."
    if (data.userStats) {
      const stats = data.userStats
      const mismatchReasons: string[] = []
      if (stats.shows_count !== undefined && Math.abs(importedShows - stats.shows_count) > 5) {
        mismatchReasons.push(
          `Shows mismatch: TV Time = ${stats.shows_count}, imported = ${importedShows}`
        )
      }
      if (
        stats.episodes_count !== undefined &&
        Math.abs(importedEpisodes - stats.episodes_count) > 10
      ) {
        mismatchReasons.push(
          `Episodes mismatch: TV Time = ${stats.episodes_count}, imported = ${importedEpisodes}`
        )
      }
      if (mismatchReasons.length > 0) {
        verificationStatus = "Mismatch"
        verificationReport = `Verification Mismatch:\n${mismatchReasons.join("\n")}`
      } else {
        verificationStatus = "Verified"
        verificationReport =
          "✔ Verified: Imported database counts successfully verified against TV Time export statistics."
      }
    }

    // Post-import: Invalidate LocalStorage Caches to force client refresh (Step 12)
    try {
      const cacheKeys = [
        `cinevault_activity_timeline_${activeUserId}`,
        `cinevault_collections_${activeUserId}`,
        `cinevault_library_${activeUserId}`,
        `cinevault_profile_${activeUserId}`,
        `cinevault_lib_items_${activeUserId}`,
        `cinevault_watch_history_${activeUserId}`,
        `cinevault_episode_progress_${activeUserId}`,
      ]
      cacheKeys.forEach((key) => localStorage.removeItem(key))

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("cinevault_collection_details_")) {
          localStorage.removeItem(key)
        }
      }
    } catch (cacheErr) {
      console.warn("Failed to clear localStorage caches:", cacheErr)
    }

    // Query exact row counts from the database (Source of Truth)
    const { count: dbLibCount } = await supabase
      .from("library")
      .select("*", { count: "exact", head: true })
      .eq("user_id", activeUserId)

    const { count: dbEpCount } = await supabase
      .from("episode_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", activeUserId)

    const { count: dbHistoryCount } = await supabase
      .from("watch_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", activeUserId)

    const { count: dbColCount } = await supabase
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", activeUserId)

    const { data: userCollections } = await supabase
      .from("collections")
      .select("id")
      .eq("user_id", activeUserId)
    const userCollectionIds = (userCollections || []).map((c) => c.id)

    let dbColItemsCount = 0
    if (userCollectionIds.length > 0) {
      const { count: dbCiCount } = await supabase
        .from("collection_items")
        .select("*", { count: "exact", head: true })
        .in("collection_id", userCollectionIds)
      dbColItemsCount = dbCiCount || 0
    }

    console.log("=== FINAL DATABASE ROW COUNTS (SOURCE OF TRUTH) ===")
    console.log("library row count:", dbLibCount || 0)
    console.log("episode_progress row count:", dbEpCount || 0)
    console.log("watch_history row count:", dbHistoryCount || 0)
    console.log("collections row count:", dbColCount || 0)
    console.log("collection_items row count:", dbColItemsCount)

    logs.push("=== FINAL DATABASE ROW COUNTS (SOURCE OF TRUTH) ===")
    logs.push(`library row count: ${dbLibCount || 0}`)
    logs.push(`episode_progress row count: ${dbEpCount || 0}`)
    logs.push(`watch_history row count: ${dbHistoryCount || 0}`)
    logs.push(`collections row count: ${dbColCount || 0}`)
    logs.push(`collection_items row count: ${dbColItemsCount}`)

    logs.push("Import pipeline completed successfully!")
    logs.push(
      `Summary: Imported Shows ${importedShows}, Movies ${importedMovies}, Episodes ${importedEpisodes}, Collections ${importedCollections}, History ${importedHistory}, Ratings ${importedRatings}, Reactions ${importedReactions}`
    )

    const elapsedTime = Math.round((Date.now() - startTime) / 1000)

    return {
      importedCount:
        importedShows + importedMovies + importedEpisodes + importedHistory + importedCollections,
      skippedCount: duplicatesSkipped,
      failedCount,
      report: logs.join("\n"),
      importedShows,
      importedMovies,
      importedEpisodes,
      importedHistory,
      importedCollections,
      importedFavorites,
      importedRatings,
      importedReactions,
      mappedAchievements,
      tmdbMatches,
      tmdbNotFound,
      duplicatesSkipped,
      elapsedTime,
      verificationStatus,
      verificationReport,
    }
  },
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export default TVTimeProvider
