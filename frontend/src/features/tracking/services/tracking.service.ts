import { supabase } from "@/lib/supabase"
import type { LibraryItem } from "@/features/library"
import type { WatchHistoryEntry } from "../types/tracking"

export const TrackingService = {
  // startWatching: Calls the atomic database function to start tracking progress
  async startWatching(
    userId: string,
    mediaId: number,
    title: string,
    posterPath: string | null,
    backdropPath: string | null,
    overview: string | null,
    releaseDate: string | null,
    genres: string[] | null,
    runtimeMinutes: number
  ): Promise<void> {
    const { error } = await supabase.rpc("start_watching_movie", {
      p_user_id: userId,
      p_media_id: mediaId,
      p_title: title,
      p_poster_path: posterPath,
      p_backdrop_path: backdropPath,
      p_overview: overview,
      p_release_date: releaseDate,
      p_genres: genres || [],
      p_runtime_minutes: runtimeMinutes,
    })

    if (error) throw error
  },

  // updateProgress: Updates progress (0-100) and automatically marks completed at 100
  async updateProgress(
    userId: string,
    mediaId: number,
    progress: number,
    expectedUpdatedAt: string | null
  ): Promise<void> {
    // 1. Validation Constraints
    const roundedProgress = Math.round(progress)
    if (roundedProgress < 0 || roundedProgress > 100) {
      throw new Error("Progress must be between 0 and 100.")
    }

    const { error } = await supabase.rpc("update_movie_progress", {
      p_user_id: userId,
      p_media_id: mediaId,
      p_progress: roundedProgress,
      p_expected_updated_at: expectedUpdatedAt,
    })

    if (error) {
      if (error.message.includes("CONCURRENCY_ERROR")) {
        throw new Error(
          "CONCURRENCY_ERROR: The movie progress was updated elsewhere. Please refresh."
        )
      }
      throw error
    }
  },

  // rewatchMovie: Resets progress to 0% and begins a new watch loop
  async rewatchMovie(userId: string, mediaId: number): Promise<void> {
    const { error } = await supabase.rpc("rewatch_movie", {
      p_user_id: userId,
      p_media_id: mediaId,
    })

    if (error) throw error
  },

  // getWatchHistory: Paginated watch timeline queries
  async getWatchHistory(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ data: WatchHistoryEntry[]; count: number }> {
    const from = (page - 1) * limit
    const to = page * limit - 1

    const { data, error, count } = await supabase
      .from("watch_history")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("watch_date", { ascending: false })
      .range(from, to)

    if (error) throw error
    return {
      data: (data || []) as WatchHistoryEntry[],
      count: count || 0,
    }
  },

  // getContinueWatching: Retrieves active watching records, ordered by last watched timestamp
  async getContinueWatching(userId: string): Promise<LibraryItem[]> {
    const { data, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_type", "movie")
      .eq("status", "watching")
      .gt("progress", 0)
      .lt("progress", 100)
      .order("last_watched_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return (data || []) as LibraryItem[]
  },

  // State Transition Helpers
  canStartWatching(item: LibraryItem | null): boolean {
    if (!item) return true
    return item.status !== "completed" && (item.progress || 0) === 0 && item.status !== "watching"
  },

  canContinueWatching(item: LibraryItem | null): boolean {
    if (!item) return false
    return item.status === "watching" && (item.progress || 0) >= 0 && (item.progress || 0) < 100
  },

  canRewatch(item: LibraryItem | null): boolean {
    if (!item) return false
    return item.status === "completed" || (item.progress || 0) === 100
  },

  isWatching(item: LibraryItem | null): boolean {
    if (!item) return false
    return item.status === "watching"
  },

  isCompleted(item: LibraryItem | null): boolean {
    if (!item) return false
    return item.status === "completed"
  },

  getProgressPercentage(item: LibraryItem | null): number {
    return item?.progress || 0
  },
}
