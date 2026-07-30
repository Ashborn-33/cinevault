import { supabase } from "@/lib/supabase"
import type { ActivityItem, ActivityFilters } from "../types/activity"
import type { WatchHistoryEntry } from "@/features/tracking/types/tracking"
import type { Collection } from "@/features/collections/types/collections"
import { differenceInCalendarDays, parseISO, isToday, isYesterday } from "date-fns"

export interface CollectionItemWithCollection {
  id: string
  collection_id: string
  media_id: number
  media_type: string
  title: string
  poster_path: string | null
  added_at: string
  collections: {
    user_id: string
    name: string
  } | null
}

export const ActivityService = {
  // getTimeline: Fetches, merges, filters, and paginates user activities
  async getTimeline(
    userId: string,
    page = 1,
    limit = 20,
    filters?: ActivityFilters
  ): Promise<{ data: ActivityItem[]; hasMore: boolean }> {
    try {
      const fetchLimit = page * limit

      // 1. Fetch tables in parallel
      const [watchHistoryRes, collectionsRes, collectionItemsRes] = await Promise.all([
        supabase
          .from("watch_history")
          .select("*")
          .eq("user_id", userId)
          .order("watch_date", { ascending: false })
          .limit(fetchLimit),
        supabase
          .from("collections")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(fetchLimit),
        supabase
          .from("collection_items")
          .select("*, collections!inner(user_id, name)")
          .eq("collections.user_id", userId)
          .order("added_at", { ascending: false })
          .limit(fetchLimit),
      ])

      if (watchHistoryRes.error) throw watchHistoryRes.error
      if (collectionsRes.error) throw collectionsRes.error
      if (collectionItemsRes.error) throw collectionItemsRes.error

      const watchHistory = watchHistoryRes.data || []
      const collections = collectionsRes.data || []
      const collectionItems = collectionItemsRes.data || []

      // 2. Map and Merge into ActivityItems
      let merged = this.mergeActivities(watchHistory, collections, collectionItems)

      // 3. Apply Filters
      if (filters) {
        // Filter Category
        if (filters.category !== "all") {
          if (filters.category === "movie") {
            merged = merged.filter((item) => item.mediaType === "movie")
          } else if (filters.category === "tv") {
            merged = merged.filter((item) => item.mediaType === "tv")
          } else if (filters.category === "collection") {
            merged = merged.filter((item) => item.type.startsWith("collection_"))
          } else if (filters.category === "completed") {
            merged = merged.filter(
              (item) =>
                item.type === "movie_completed" ||
                item.type === "tv_completed" ||
                item.type === "tv_season_completed"
            )
          } else if (filters.category === "started") {
            merged = merged.filter(
              (item) => item.type === "movie_started" || item.type === "tv_started"
            )
          } else if (filters.category === "progress") {
            merged = merged.filter(
              (item) => item.type === "movie_continued" || item.type === "tv_episode"
            )
          }
        }

        // Filter Search
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase()
          merged = merged.filter(
            (item) =>
              item.title.toLowerCase().includes(q) ||
              item.details?.collectionName?.toLowerCase().includes(q) ||
              item.details?.episodeName?.toLowerCase().includes(q)
          )
        }

        // Sort
        const isNewest = filters.sort === "newest"
        merged.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime()
          const timeB = new Date(b.timestamp).getTime()
          return isNewest ? timeB - timeA : timeA - timeB
        })
      } else {
        // Default Sort: Newest First
        merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      }

      // 4. Paginate
      const startIndex = (page - 1) * limit
      const paginatedSlice = merged.slice(startIndex, startIndex + limit)
      const hasMore = merged.length > startIndex + limit

      const result = {
        data: paginatedSlice,
        hasMore,
      }

      if (page === 1 && (!filters || filters.category === "all")) {
        localStorage.setItem(`cinevault_activity_timeline_${userId}`, JSON.stringify(result))
      }

      return result
    } catch (err) {
      console.warn("Offline fallback for getTimeline:", err)
      const cached = localStorage.getItem(`cinevault_activity_timeline_${userId}`)
      if (cached) return JSON.parse(cached)
      throw err
    }
  },

  // getRecentActivity: Shorthand helper for limited recent feed items
  async getRecentActivity(userId: string, limit = 5): Promise<ActivityItem[]> {
    const res = await this.getTimeline(userId, 1, limit)
    return res.data
  },

  // getActivityByDate: Filters activities matching a target date
  async getActivityByDate(userId: string, dateStr: string): Promise<ActivityItem[]> {
    const { data } = await this.getTimeline(userId, 1, 100)
    return data.filter((item) => item.timestamp.startsWith(dateStr))
  },

  // mergeActivities: Formats rows from all tables into typed ActivityItems
  mergeActivities(
    watchHistory: WatchHistoryEntry[],
    collections: Collection[],
    collectionItems: CollectionItemWithCollection[]
  ): ActivityItem[] {
    const items: ActivityItem[] = []

    // 1. Process Watch History
    watchHistory.forEach((h) => {
      let type: ActivityItem["type"] = "movie_started"

      if (h.media_type === "movie") {
        if (h.action === "started") type = "movie_started"
        else if (h.action === "continued") type = "movie_continued"
        else if (h.action === "completed") type = "movie_completed"
        else if (h.action === "rewatched") type = "movie_rewatched"
      } else if (h.media_type === "tv") {
        if (h.action === "started") {
          type = "tv_started"
        } else if (
          h.episode_name &&
          h.episode_name.includes("Season") &&
          h.episode_name.includes("Completed")
        ) {
          type = "tv_season_completed"
        } else if (h.action === "completed" && h.episode_number === null) {
          type = "tv_completed"
        } else {
          type = "tv_episode"
        }
      }

      items.push({
        id: `history-${h.id}`,
        type,
        timestamp: h.watch_date,
        title: h.title,
        posterPath: h.poster_path,
        mediaType: h.media_type,
        mediaId: h.media_id,
        details: {
          seasonNumber: h.season_number || undefined,
          episodeNumber: h.episode_number || undefined,
          episodeName: h.episode_name || undefined,
          progress: h.new_progress || undefined,
          previousProgress: h.previous_progress || undefined,
        },
      })
    })

    // 2. Process Collections (Created & Updated)
    collections.forEach((c) => {
      // Collection Created
      items.push({
        id: `col-created-${c.id}`,
        type: "collection_created",
        timestamp: c.created_at,
        title: c.name,
        posterPath: null,
        details: {
          collectionId: c.id,
          collectionName: c.name,
        },
      })

      // Collection Updated (If updated_at differs by more than 5 seconds)
      const createdTime = new Date(c.created_at).getTime()
      const updatedTime = new Date(c.updated_at).getTime()
      if (Math.abs(updatedTime - createdTime) > 5000) {
        items.push({
          id: `col-updated-${c.id}-${updatedTime}`,
          type: "collection_updated",
          timestamp: c.updated_at,
          title: c.name,
          posterPath: null,
          details: {
            collectionId: c.id,
            collectionName: c.name,
          },
        })
      }
    })

    // 3. Process Collection Items Added
    collectionItems.forEach((ci) => {
      const colName = ci.collections?.name || "Collection"
      items.push({
        id: `col-item-${ci.id}`,
        type: "collection_added",
        timestamp: ci.added_at,
        title: ci.title,
        posterPath: ci.poster_path,
        mediaType: ci.media_type as "movie" | "tv",
        mediaId: ci.media_id,
        details: {
          collectionId: ci.collection_id,
          collectionName: colName,
        },
      })
    })

    return items
  },

  // groupTimelineByDate: Segments timeline items into date sections
  groupTimelineByDate(activities: ActivityItem[]) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sections = {
      today: [] as ActivityItem[],
      yesterday: [] as ActivityItem[],
      thisWeek: [] as ActivityItem[],
      thisMonth: [] as ActivityItem[],
      older: [] as ActivityItem[],
    }

    activities.forEach((item) => {
      const date = parseISO(item.timestamp)
      const diff = differenceInCalendarDays(date, today)

      if (diff === 0 || isToday(date)) {
        sections.today.push(item)
      } else if (diff === -1 || isYesterday(date)) {
        sections.yesterday.push(item)
      } else if (diff < -1 && diff >= -7) {
        sections.thisWeek.push(item)
      } else if (diff < -7 && diff >= -30) {
        sections.thisMonth.push(item)
      } else {
        sections.older.push(item)
      }
    })

    return sections
  },
}
export default ActivityService
