import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { TrackingService } from "../services/tracking.service"
import { queryKeys } from "@/lib/queryKeys"
import type { LibraryItem } from "@/features/library"

export function useContinueWatching() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.tracking.continueWatching(userId),
    queryFn: () => TrackingService.getContinueWatching(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
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

      // Optimistic item setup
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
