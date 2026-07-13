import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { TrackingService } from "../services/tracking.service"
import { queryKeys } from "@/lib/queryKeys"
import type { LibraryItem } from "@/features/library"
import type { EpisodeProgress } from "../types/tracking"

// ----------------------------------------------------
// GENERAL / MOVIE HOOKS (CV-032A - UNCHANGED)
// ----------------------------------------------------
export function useContinueWatching() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.tracking.continueWatching(userId),
    queryFn: () => TrackingService.getContinueWatching(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useWatchHistory(page = 1, limit = 20) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.tracking.watchHistory(userId, page, limit),
    queryFn: () => TrackingService.getWatchHistory(userId, page, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStartWatching() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      mediaId: number
      title: string
      posterPath: string | null
      backdropPath: string | null
      overview: string | null
      releaseDate: string | null
      genres: string[] | null
      runtimeMinutes: number
    }) =>
      TrackingService.startWatching(
        userId,
        variables.mediaId,
        variables.title,
        variables.posterPath,
        variables.backdropPath,
        variables.overview,
        variables.releaseDate,
        variables.genres,
        variables.runtimeMinutes
      ),

    onMutate: async (variables) => {
      const itemKey = ["library", "item", userId, String(variables.mediaId), "movie"]
      const listKey = ["library", "list", userId]
      const continueKey = queryKeys.tracking.continueWatching(userId)

      await queryClient.cancelQueries({ queryKey: itemKey })
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: continueKey })

      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)
      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousContinue = queryClient.getQueryData<LibraryItem[]>(continueKey)

      const nowStr = new Date().toISOString()
      const updatedItem: LibraryItem = previousItem
        ? {
            ...previousItem,
            status: "watching",
            progress: 1,
            started_at: nowStr,
            last_watched_at: nowStr,
            updated_progress_at: nowStr,
            runtime_minutes: variables.runtimeMinutes,
            updated_at: nowStr,
          }
        : {
            id: `temp-id-${Date.now()}`,
            user_id: userId,
            media_id: String(variables.mediaId),
            media_type: "movie",
            title: variables.title,
            poster_path: variables.posterPath,
            backdrop_path: variables.backdropPath,
            overview: variables.overview,
            release_date: variables.releaseDate,
            genres: variables.genres,
            status: "watching",
            progress: 1,
            runtime_minutes: variables.runtimeMinutes,
            times_watched: 0,
            started_at: nowStr,
            last_watched_at: nowStr,
            completed_at: null,
            updated_progress_at: nowStr,
            favorite: false,
            watchlist: false,
            rating: null,
            notes: null,
            created_at: nowStr,
            updated_at: nowStr,
          }

      queryClient.setQueryData(itemKey, updatedItem)

      if (previousList) {
        queryClient.setQueryData(
          listKey,
          previousList.some((item) => item.media_id === String(variables.mediaId))
            ? previousList.map((item) =>
                item.media_id === String(variables.mediaId) ? updatedItem : item
              )
            : [updatedItem, ...previousList]
        )
      }

      if (previousContinue) {
        queryClient.setQueryData(
          continueKey,
          previousContinue.some((item) => item.media_id === String(variables.mediaId))
            ? previousContinue.map((item) =>
                item.media_id === String(variables.mediaId) ? updatedItem : item
              )
            : [updatedItem, ...previousContinue]
        )
      }

      return { previousItem, previousList, previousContinue, mediaId: variables.mediaId }
    },

    onError: (err, _variables, context) => {
      alert(`Couldn't update watch progress: ${err.message}`)
      if (context) {
        queryClient.setQueryData(
          ["library", "item", userId, String(context.mediaId), "movie"],
          context.previousItem
        )
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          queryKeys.tracking.continueWatching(userId),
          context.previousContinue
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, String(variables.mediaId), "movie"],
      })
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.continueWatching(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.watchHistory(userId) })
    },
  })
}

export function useProgress() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      mediaId: number
      progress: number
      expectedUpdatedAt: string | null
    }) =>
      TrackingService.updateProgress(
        userId,
        variables.mediaId,
        variables.progress,
        variables.expectedUpdatedAt
      ),

    onMutate: async (variables) => {
      const itemKey = ["library", "item", userId, String(variables.mediaId), "movie"]
      const listKey = ["library", "list", userId]
      const continueKey = queryKeys.tracking.continueWatching(userId)

      await queryClient.cancelQueries({ queryKey: itemKey })
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: continueKey })

      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)
      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousContinue = queryClient.getQueryData<LibraryItem[]>(continueKey)

      if (previousItem) {
        const nowStr = new Date().toISOString()
        const isCompleted = variables.progress === 100
        const updatedItem: LibraryItem = {
          ...previousItem,
          progress: variables.progress,
          status: isCompleted ? "completed" : "watching",
          last_watched_at: nowStr,
          updated_progress_at: nowStr,
          updated_at: nowStr,
          completed_at: isCompleted ? nowStr : previousItem.completed_at,
          times_watched: isCompleted
            ? (previousItem.times_watched || 0) + 1
            : previousItem.times_watched,
        }

        queryClient.setQueryData(itemKey, updatedItem)

        if (previousList) {
          queryClient.setQueryData(
            listKey,
            previousList.map((item) =>
              item.media_id === String(variables.mediaId) ? updatedItem : item
            )
          )
        }

        if (previousContinue) {
          queryClient.setQueryData(
            continueKey,
            isCompleted
              ? previousContinue.filter((item) => item.media_id !== String(variables.mediaId))
              : previousContinue.map((item) =>
                  item.media_id === String(variables.mediaId) ? updatedItem : item
                )
          )
        }
      }

      return { previousItem, previousList, previousContinue, mediaId: variables.mediaId }
    },

    onError: (err, _variables, context) => {
      alert(`Couldn't update watch progress: ${err.message}`)
      if (context) {
        queryClient.setQueryData(
          ["library", "item", userId, String(context.mediaId), "movie"],
          context.previousItem
        )
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          queryKeys.tracking.continueWatching(userId),
          context.previousContinue
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, String(variables.mediaId), "movie"],
      })
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.continueWatching(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.watchHistory(userId) })
    },
  })
}

export function useRewatchMovie() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: { mediaId: number }) =>
      TrackingService.rewatchMovie(userId, variables.mediaId),

    onMutate: async (variables) => {
      const itemKey = ["library", "item", userId, String(variables.mediaId), "movie"]
      const listKey = ["library", "list", userId]
      const continueKey = queryKeys.tracking.continueWatching(userId)

      await queryClient.cancelQueries({ queryKey: itemKey })
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: continueKey })

      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)
      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousContinue = queryClient.getQueryData<LibraryItem[]>(continueKey)

      if (previousItem) {
        const nowStr = new Date().toISOString()
        const updatedItem: LibraryItem = {
          ...previousItem,
          progress: 0,
          status: "watching",
          started_at: nowStr,
          completed_at: null,
          last_watched_at: nowStr,
          updated_progress_at: nowStr,
          updated_at: nowStr,
        }

        queryClient.setQueryData(itemKey, updatedItem)

        if (previousList) {
          queryClient.setQueryData(
            listKey,
            previousList.map((item) =>
              item.media_id === String(variables.mediaId) ? updatedItem : item
            )
          )
        }

        if (previousContinue) {
          queryClient.setQueryData(
            continueKey,
            previousContinue.some((item) => item.media_id === String(variables.mediaId))
              ? previousContinue.map((item) =>
                  item.media_id === String(variables.mediaId) ? updatedItem : item
                )
              : [updatedItem, ...previousContinue]
          )
        }
      }

      return { previousItem, previousList, previousContinue, mediaId: variables.mediaId }
    },

    onError: (err, _variables, context) => {
      alert(`Couldn't update watch progress: ${err.message}`)
      if (context) {
        queryClient.setQueryData(
          ["library", "item", userId, String(context.mediaId), "movie"],
          context.previousItem
        )
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          queryKeys.tracking.continueWatching(userId),
          context.previousContinue
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, String(variables.mediaId), "movie"],
      })
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.continueWatching(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.watchHistory(userId) })
    },
  })
}

// ----------------------------------------------------
// TV EPISODE TRACKING HOOKS (CV-032B)
// ----------------------------------------------------
export function useContinueWatchingShows() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.tracking.continueWatchingShows(userId),
    queryFn: () => TrackingService.getContinueWatchingShows(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useEpisodeProgress(mediaId: string, season: number) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.tracking.episodeProgress(mediaId, season),
    queryFn: () => TrackingService.getEpisodeProgress(userId, Number(mediaId), season),
    enabled: !!userId && !!mediaId && season > 0,
    staleTime: 1 * 60 * 1000,
  })
}

export function useSeasonProgress(mediaId: string, season: number, totalEpisodes: number) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["tracking", "seasonProgress", mediaId, season, totalEpisodes],
    queryFn: () =>
      TrackingService.getSeasonProgress(userId, Number(mediaId), season, totalEpisodes),
    enabled: !!userId && !!mediaId && season > 0 && totalEpisodes > 0,
    staleTime: 30 * 1000,
  })
}

export function useShowProgress(mediaId: string, totalEpisodes: number) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["tracking", "showProgress", mediaId, totalEpisodes],
    queryFn: () => TrackingService.getShowProgress(userId, Number(mediaId), totalEpisodes),
    enabled: !!userId && !!mediaId && totalEpisodes > 0,
    staleTime: 30 * 1000,
  })
}

export function useStartTVShow() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      mediaId: number
      title: string
      posterPath: string | null
      backdropPath: string | null
      overview: string | null
      releaseDate: string | null
      genres: string[] | null
    }) =>
      TrackingService.startTVShow(
        userId,
        variables.mediaId,
        variables.title,
        variables.posterPath,
        variables.backdropPath,
        variables.overview,
        variables.releaseDate,
        variables.genres
      ),

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, String(variables.mediaId), "tv"],
      })
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.continueWatchingShows(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.watchHistory(userId) })
    },
  })
}

export function useMarkEpisode() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      mediaId: number
      season: number
      episode: number
      name: string | null
      stillPath: string | null
      airDate: string | null
      runtime: number | null
      totalShowEpisodes: number
      totalSeasonEpisodes: number
      title: string
      poster: string | null
      watched: boolean
      expectedUpdatedAt: string | null
    }) => {
      if (variables.watched) {
        return TrackingService.markEpisodeWatched(
          userId,
          variables.mediaId,
          variables.season,
          variables.episode,
          variables.name,
          variables.stillPath,
          variables.airDate,
          variables.runtime,
          variables.totalShowEpisodes,
          variables.title,
          variables.poster,
          variables.expectedUpdatedAt
        )
      } else {
        return TrackingService.markEpisodeUnwatched(
          userId,
          variables.mediaId,
          variables.season,
          variables.episode,
          variables.name,
          variables.stillPath,
          variables.airDate,
          variables.runtime,
          variables.totalShowEpisodes,
          variables.title,
          variables.poster,
          variables.expectedUpdatedAt
        )
      }
    },

    onMutate: async (variables) => {
      const episodeKey = queryKeys.tracking.episodeProgress(
        String(variables.mediaId),
        variables.season
      )
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, String(variables.mediaId), "tv"]
      const continueKey = queryKeys.tracking.continueWatchingShows(userId)

      await queryClient.cancelQueries({ queryKey: episodeKey })
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })
      await queryClient.cancelQueries({ queryKey: continueKey })

      const previousEpisodes = queryClient.getQueryData<EpisodeProgress[]>(episodeKey)
      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)
      const previousContinue = queryClient.getQueryData<LibraryItem[]>(continueKey)

      if (previousEpisodes) {
        const nowStr = new Date().toISOString()
        const match = previousEpisodes.some((ep) => ep.episode_number === variables.episode)
        const updated = match
          ? previousEpisodes.map((ep) =>
              ep.episode_number === variables.episode
                ? {
                    ...ep,
                    watch_status: (variables.watched ? "completed" : "unwatched") as
                      "unwatched" | "watching" | "completed",
                    watched_at: variables.watched ? nowStr : null,
                    updated_at: nowStr,
                  }
                : ep
            )
          : [
              ...previousEpisodes,
              {
                id: `temp-ep-${Date.now()}`,
                user_id: userId,
                library_id: previousItem?.id || `temp-lib-${Date.now()}`,
                media_id: variables.mediaId,
                season_number: variables.season,
                episode_number: variables.episode,
                episode_name: variables.name,
                still_path: variables.stillPath,
                air_date: variables.airDate,
                runtime_minutes: variables.runtime,
                watch_status: (variables.watched ? "completed" : "unwatched") as
                  "unwatched" | "watching" | "completed",
                watched_at: variables.watched ? nowStr : null,
                created_at: nowStr,
                updated_at: nowStr,
              },
            ]
        queryClient.setQueryData(episodeKey, updated)
      }

      return {
        previousEpisodes,
        previousList,
        previousItem,
        previousContinue,
        mediaId: variables.mediaId,
        season: variables.season,
      }
    },

    onError: (err, _variables, context) => {
      alert(`Couldn't update episode progress: ${err.message}`)
      if (context) {
        queryClient.setQueryData(
          queryKeys.tracking.episodeProgress(String(context.mediaId), context.season),
          context.previousEpisodes
        )
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          ["library", "item", userId, String(context.mediaId), "tv"],
          context.previousItem
        )
        queryClient.setQueryData(
          queryKeys.tracking.continueWatchingShows(userId),
          context.previousContinue
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.episodeProgress(String(variables.mediaId), variables.season),
      })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, String(variables.mediaId), "tv"],
      })
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.continueWatchingShows(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.watchHistory(userId) })
      queryClient.invalidateQueries({
        queryKey: [
          "tracking",
          "seasonProgress",
          String(variables.mediaId),
          variables.season,
          variables.totalSeasonEpisodes,
        ],
      })
      queryClient.invalidateQueries({
        queryKey: [
          "tracking",
          "showProgress",
          String(variables.mediaId),
          variables.totalShowEpisodes,
        ],
      })
    },
  })
}

export function useMarkSeasonCompleted() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      mediaId: number
      season: number
      episodesData: Array<{
        episode_number: number
        episode_name: string | null
        still_path: string | null
        air_date: string | null
        runtime_minutes: number
      }>
      totalShowEpisodes: number
      totalSeasonEpisodes: number
      title: string
      poster: string | null
      expectedUpdatedAt: string | null
    }) =>
      TrackingService.markSeasonCompleted(
        userId,
        variables.mediaId,
        variables.season,
        variables.episodesData,
        variables.totalShowEpisodes,
        variables.title,
        variables.poster,
        variables.expectedUpdatedAt
      ),

    onMutate: async (variables) => {
      const episodeKey = queryKeys.tracking.episodeProgress(
        String(variables.mediaId),
        variables.season
      )
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, String(variables.mediaId), "tv"]
      const continueKey = queryKeys.tracking.continueWatchingShows(userId)

      await queryClient.cancelQueries({ queryKey: episodeKey })
      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })
      await queryClient.cancelQueries({ queryKey: continueKey })

      const previousEpisodes = queryClient.getQueryData<EpisodeProgress[]>(episodeKey)
      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)
      const previousContinue = queryClient.getQueryData<LibraryItem[]>(continueKey)

      if (previousEpisodes) {
        const nowStr = new Date().toISOString()
        const updated = previousEpisodes.map((ep) => ({
          ...ep,
          watch_status: "completed" as const,
          watched_at: nowStr,
          updated_at: nowStr,
        }))
        queryClient.setQueryData(episodeKey, updated)
      }

      return {
        previousEpisodes,
        previousList,
        previousItem,
        previousContinue,
        mediaId: variables.mediaId,
        season: variables.season,
      }
    },

    onError: (err, _variables, context) => {
      alert(`Couldn't mark season completed: ${err.message}`)
      if (context) {
        queryClient.setQueryData(
          queryKeys.tracking.episodeProgress(String(context.mediaId), context.season),
          context.previousEpisodes
        )
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          ["library", "item", userId, String(context.mediaId), "tv"],
          context.previousItem
        )
        queryClient.setQueryData(
          queryKeys.tracking.continueWatchingShows(userId),
          context.previousContinue
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tracking.episodeProgress(String(variables.mediaId), variables.season),
      })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, String(variables.mediaId), "tv"],
      })
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.continueWatchingShows(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tracking.watchHistory(userId) })
      queryClient.invalidateQueries({
        queryKey: [
          "tracking",
          "seasonProgress",
          String(variables.mediaId),
          variables.season,
          variables.totalSeasonEpisodes,
        ],
      })
      queryClient.invalidateQueries({
        queryKey: [
          "tracking",
          "showProgress",
          String(variables.mediaId),
          variables.totalShowEpisodes,
        ],
      })
    },
  })
}
