import { supabase } from "@/lib/supabase"
import type { LibraryItem } from "@/features/library"
import type { WatchHistoryEntry, EpisodeProgress } from "../types/tracking"

export const TrackingService = {
  // ----------------------------------------------------
  // MOVIE METHODS (CV-032A - UNCHANGED)
  // ----------------------------------------------------
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

  async updateProgress(
    userId: string,
    mediaId: number,
    progress: number,
    expectedUpdatedAt: string | null
  ): Promise<void> {
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

  async rewatchMovie(userId: string, mediaId: number): Promise<void> {
    const { error } = await supabase.rpc("rewatch_movie", {
      p_user_id: userId,
      p_media_id: mediaId,
    })

    if (error) throw error
  },

  // ----------------------------------------------------
  // TV EPISODE METHODS (CV-032B)
  // ----------------------------------------------------
  async startTVShow(
    userId: string,
    mediaId: number,
    title: string,
    posterPath: string | null,
    backdropPath: string | null,
    overview: string | null,
    releaseDate: string | null,
    genres: string[] | null
  ): Promise<void> {
    const { error } = await supabase.rpc("start_watching_tv", {
      p_user_id: userId,
      p_media_id: mediaId,
      p_title: title,
      p_poster_path: posterPath,
      p_backdrop_path: backdropPath,
      p_overview: overview,
      p_release_date: releaseDate,
      p_genres: genres || [],
    })

    if (error) throw error
  },

  async recordEpisodeWatch(
    userId: string,
    mediaId: number,
    season: number,
    episode: number,
    name: string | null,
    stillPath: string | null,
    airDate: string | null,
    runtime: number | null,
    totalShowEpisodes: number,
    title: string,
    poster: string | null
  ): Promise<void> {
    // 1. Ensure the TV show is in the library
    let { data: libraryItem } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_id", String(mediaId))
      .eq("media_type", "tv")
      .maybeSingle()

    if (!libraryItem) {
      const { data: insertedLib, error: insertLibErr } = await supabase
        .from("library")
        .insert({
          user_id: userId,
          media_id: String(mediaId),
          media_type: "tv",
          title,
          poster_path: poster,
          status: "watching",
          progress: 0,
          times_watched: 0,
          started_at: new Date().toISOString(),
          last_watched_at: new Date().toISOString(),
          updated_progress_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertLibErr) throw insertLibErr
      libraryItem = insertedLib
    }

    // 2. Query the existing episode progress row
    const { data: epRow } = await supabase
      .from("episode_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("season_number", season)
      .eq("episode_number", episode)
      .maybeSingle()

    if (epRow) {
      const newCount = (epRow.watch_count || 1) + 1
      const first_watched_at =
        epRow.first_watched_at || epRow.watched_at || new Date().toISOString()

      const { error: updateEpErr } = await supabase
        .from("episode_progress")
        .update({
          watch_status: "completed",
          watch_count: newCount,
          first_watched_at,
          last_watched_at: new Date().toISOString(),
          watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", epRow.id)

      if (updateEpErr) throw updateEpErr
    } else {
      const { error: insertEpErr } = await supabase.from("episode_progress").insert({
        user_id: userId,
        library_id: libraryItem.id,
        media_id: mediaId,
        season_number: season,
        episode_number: episode,
        episode_name: name,
        still_path: stillPath,
        air_date: airDate,
        runtime_minutes: runtime || 0,
        watch_status: "completed",
        watched_at: new Date().toISOString(),
        watch_count: 1,
        first_watched_at: new Date().toISOString(),
        last_watched_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertEpErr) throw insertEpErr
    }

    // 3. Calculate total watched episodes for this TV show
    const { data: epList } = await supabase
      .from("episode_progress")
      .select("episode_number")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("watch_status", "completed")

    const watchedCount = epList?.length || 0
    let newProgress =
      totalShowEpisodes > 0 ? Math.round((watchedCount / totalShowEpisodes) * 100) : 0
    newProgress = Math.max(0, Math.min(100, newProgress))

    // 4. Update Library details
    const isCompleting = newProgress === 100 && libraryItem.status !== "completed"
    const { error: updateLibErr } = await supabase
      .from("library")
      .update({
        status: isCompleting ? "completed" : "watching",
        progress: newProgress,
        last_watched_at: new Date().toISOString(),
        updated_progress_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        current_season: season,
        current_episode: episode,
        last_episode_name: name,
        completed_at: isCompleting ? new Date().toISOString() : libraryItem.completed_at,
        times_watched: isCompleting
          ? (libraryItem.times_watched || 0) + 1
          : libraryItem.times_watched,
      })
      .eq("id", libraryItem.id)

    if (updateLibErr) throw updateLibErr

    // 5. Log watch history row (NEW record every watch, do not update existing history records)
    const { error: insertHistErr } = await supabase.from("watch_history").insert({
      user_id: userId,
      library_id: libraryItem.id,
      media_id: mediaId,
      media_type: "tv",
      action: "completed",
      previous_progress: libraryItem.progress || 0,
      new_progress: newProgress,
      title: libraryItem.title,
      poster_path: libraryItem.poster_path,
      watch_date: new Date().toISOString(),
      runtime_minutes: runtime || 0,
      season_number: season,
      episode_number: episode,
      episode_name: name,
      still_path: stillPath,
      air_date: airDate,
    })

    if (insertHistErr) throw insertHistErr
  },

  async markEpisodeWatched(
    userId: string,
    mediaId: number,
    season: number,
    episode: number,
    name: string | null,
    stillPath: string | null,
    airDate: string | null,
    runtime: number | null,
    totalShowEpisodes: number,
    title: string,
    poster: string | null,
    expectedUpdatedAt: string | null
  ): Promise<void> {
    // Perform optimistic concurrency check
    const { data: libraryItem } = await supabase
      .from("library")
      .select("updated_at")
      .eq("user_id", userId)
      .eq("media_id", String(mediaId))
      .eq("media_type", "tv")
      .maybeSingle()

    if (libraryItem && expectedUpdatedAt && libraryItem.updated_at) {
      if (
        Math.abs(
          new Date(libraryItem.updated_at).getTime() - new Date(expectedUpdatedAt).getTime()
        ) > 1000
      ) {
        throw new Error("CONCURRENCY_ERROR: The TV progress was updated elsewhere. Please refresh.")
      }
    }

    return this.recordEpisodeWatch(
      userId,
      mediaId,
      season,
      episode,
      name,
      stillPath,
      airDate,
      runtime,
      totalShowEpisodes,
      title,
      poster
    )
  },

  async markEpisodeUnwatched(
    userId: string,
    mediaId: number,
    season: number,
    episode: number,
    name: string | null,
    stillPath: string | null,
    airDate: string | null,
    runtime: number | null,
    totalShowEpisodes: number,
    _title: string,
    _poster: string | null,
    expectedUpdatedAt: string | null
  ): Promise<void> {
    const { data: libraryItem } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_id", String(mediaId))
      .eq("media_type", "tv")
      .maybeSingle()

    if (libraryItem && expectedUpdatedAt && libraryItem.updated_at) {
      if (
        Math.abs(
          new Date(libraryItem.updated_at).getTime() - new Date(expectedUpdatedAt).getTime()
        ) > 1000
      ) {
        throw new Error("CONCURRENCY_ERROR: The TV progress was updated elsewhere. Please refresh.")
      }
    }

    if (!libraryItem) return

    // Update episode progress to unwatched
    const { error: epError } = await supabase
      .from("episode_progress")
      .update({
        watch_status: "unwatched",
        watch_count: 0,
        watched_at: null,
        last_watched_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("season_number", season)
      .eq("episode_number", episode)

    if (epError) throw epError

    // Recalculate progress
    const { data: epList } = await supabase
      .from("episode_progress")
      .select("episode_number")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("watch_status", "completed")

    const watchedCount = epList?.length || 0
    let newProgress =
      totalShowEpisodes > 0 ? Math.round((watchedCount / totalShowEpisodes) * 100) : 0
    newProgress = Math.max(0, Math.min(100, newProgress))

    // Update library
    const { error: libError } = await supabase
      .from("library")
      .update({
        progress: newProgress,
        status: newProgress === 100 ? "completed" : "watching",
        updated_at: new Date().toISOString(),
      })
      .eq("id", libraryItem.id)

    if (libError) throw libError

    // Log to watch history
    await supabase.from("watch_history").insert({
      user_id: userId,
      library_id: libraryItem.id,
      media_id: mediaId,
      media_type: "tv",
      action: "completed",
      previous_progress: libraryItem.progress || 0,
      new_progress: newProgress,
      title: libraryItem.title,
      poster_path: libraryItem.poster_path,
      watch_date: new Date().toISOString(),
      runtime_minutes: runtime || 0,
      season_number: season,
      episode_number: episode,
      episode_name: name,
      still_path: stillPath,
      air_date: airDate,
    })
  },

  async markSeasonCompleted(
    userId: string,
    mediaId: number,
    season: number,
    episodesData: Array<{
      episode_number: number
      episode_name: string | null
      still_path: string | null
      air_date: string | null
      runtime_minutes: number
    }>,
    totalShowEpisodes: number,
    title: string,
    poster: string | null,
    expectedUpdatedAt: string | null
  ): Promise<void> {
    const { error } = await supabase.rpc("mark_season_completed", {
      p_user_id: userId,
      p_media_id: mediaId,
      p_season_number: season,
      p_episodes_data: episodesData,
      p_total_show_episodes: totalShowEpisodes,
      p_title: title,
      p_poster_path: poster,
      p_expected_updated_at: expectedUpdatedAt,
    })

    if (error) {
      if (error.message.includes("CONCURRENCY_ERROR")) {
        throw new Error("CONCURRENCY_ERROR: The TV progress was updated elsewhere. Please refresh.")
      }
      throw error
    }
  },

  async getEpisodeProgress(
    userId: string,
    mediaId: number,
    season: number
  ): Promise<EpisodeProgress[]> {
    const { data, error } = await supabase
      .from("episode_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("season_number", season)

    if (error) throw error
    return (data || []) as EpisodeProgress[]
  },

  async getSeasonProgress(
    userId: string,
    mediaId: number,
    season: number,
    totalEpisodes: number
  ): Promise<{ watched: number; remaining: number; percentage: number }> {
    const { data, error } = await supabase
      .from("episode_progress")
      .select("episode_number")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("season_number", season)
      .eq("watch_status", "completed")

    if (error) throw error
    const watched = data?.length || 0
    const remaining = Math.max(totalEpisodes - watched, 0)
    const percentage = totalEpisodes > 0 ? Math.round((watched / totalEpisodes) * 100) : 0

    return { watched, remaining, percentage }
  },

  async getShowProgress(
    userId: string,
    mediaId: number,
    totalEpisodes: number
  ): Promise<{ watched: number; remaining: number; percentage: number }> {
    const { data, error } = await supabase
      .from("episode_progress")
      .select("episode_number")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("watch_status", "completed")

    if (error) throw error
    const watched = data?.length || 0
    const remaining = Math.max(totalEpisodes - watched, 0)
    const percentage = totalEpisodes > 0 ? Math.round((watched / totalEpisodes) * 100) : 0

    return { watched, remaining, percentage }
  },

  async getContinueWatchingShows(userId: string): Promise<LibraryItem[]> {
    const { data, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_type", "tv")
      .eq("status", "watching")
      .order("last_watched_at", { ascending: false })
      .limit(20)

    if (error) throw error
    return (data || []) as LibraryItem[]
  },

  getNextEpisodeToWatch(
    currentSeason: number | null | undefined,
    currentEpisode: number | null | undefined
  ): { season: number; episode: number } | null {
    if (!currentSeason) return { season: 1, episode: 1 }
    const s = currentSeason
    const e = currentEpisode || 0
    return { season: s, episode: e + 1 }
  },

  // ----------------------------------------------------
  // GENERAL METHODS
  // ----------------------------------------------------
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
