import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { LibraryService } from "../services/library.service"
import type { LibraryItem, AddLibraryItemInput, LibraryStatus } from "../types/library"

export function useLibrary() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["library", "list", userId],
    queryFn: () => LibraryService.getLibrary(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLibraryItem(mediaId: string, mediaType: "movie" | "tv") {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["library", "item", userId, mediaId, mediaType],
    queryFn: () => LibraryService.getLibraryItem(userId, mediaId, mediaType),
    enabled: !!userId && !!mediaId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAddToLibrary() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (input: AddLibraryItemInput) => LibraryService.addToLibrary(userId, input),

    onMutate: async (newItemInput) => {
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, newItemInput.media_id, newItemInput.media_type]

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })

      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)

      const optimisticItem: LibraryItem = {
        id: `temp-id-${Date.now()}`,
        user_id: userId,
        media_id: newItemInput.media_id,
        media_type: newItemInput.media_type,
        title: newItemInput.title,
        poster_path: newItemInput.poster_path,
        backdrop_path: newItemInput.backdrop_path,
        overview: newItemInput.overview,
        release_date: newItemInput.release_date,
        genres: newItemInput.genres,
        status: newItemInput.status || "planning",
        favorite: newItemInput.favorite || false,
        watchlist: newItemInput.watchlist || false,
        rating: newItemInput.rating || null,
        notes: newItemInput.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: null,
        runtime_minutes: null,
        times_watched: 0,
        started_at: null,
        last_watched_at: null,
        completed_at: null,
        updated_progress_at: null,
      }

      if (previousList) {
        queryClient.setQueryData(listKey, [optimisticItem, ...previousList])
      } else {
        queryClient.setQueryData(listKey, [optimisticItem])
      }

      queryClient.setQueryData(itemKey, optimisticItem)

      return { previousList, previousItem, newItemInput }
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          [
            "library",
            "item",
            userId,
            context.newItemInput.media_id,
            context.newItemInput.media_type,
          ],
          context.previousItem
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, variables.media_id, variables.media_type],
      })
    },
  })
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: { mediaId: string; mediaType: "movie" | "tv" }) =>
      LibraryService.removeFromLibrary(userId, variables.mediaId, variables.mediaType),

    onMutate: async ({ mediaId, mediaType }) => {
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, mediaId, mediaType]

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })

      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)

      if (previousList) {
        queryClient.setQueryData(
          listKey,
          previousList.filter(
            (item) => !(item.media_id === mediaId && item.media_type === mediaType)
          )
        )
      }

      queryClient.setQueryData(itemKey, null)

      return { previousList, previousItem, mediaId, mediaType }
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          ["library", "item", userId, context.mediaId, context.mediaType],
          context.previousItem
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, variables.mediaId, variables.mediaType],
      })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: { mediaId: string; mediaType: "movie" | "tv"; favorite: boolean }) =>
      LibraryService.toggleFavorite(
        userId,
        variables.mediaId,
        variables.mediaType,
        variables.favorite
      ),

    onMutate: async ({ mediaId, mediaType, favorite }) => {
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, mediaId, mediaType]

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })

      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)

      if (previousList) {
        queryClient.setQueryData(
          listKey,
          previousList.map((item) =>
            item.media_id === mediaId && item.media_type === mediaType
              ? { ...item, favorite }
              : item
          )
        )
      }

      if (previousItem) {
        queryClient.setQueryData(itemKey, { ...previousItem, favorite })
      }

      return { previousList, previousItem, mediaId, mediaType }
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          ["library", "item", userId, context.mediaId, context.mediaType],
          context.previousItem
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, variables.mediaId, variables.mediaType],
      })
    },
  })
}

export function useToggleWatchlist() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: { mediaId: string; mediaType: "movie" | "tv"; watchlist: boolean }) =>
      LibraryService.toggleWatchlist(
        userId,
        variables.mediaId,
        variables.mediaType,
        variables.watchlist
      ),

    onMutate: async ({ mediaId, mediaType, watchlist }) => {
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, mediaId, mediaType]

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })

      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)

      if (previousList) {
        queryClient.setQueryData(
          listKey,
          previousList.map((item) =>
            item.media_id === mediaId && item.media_type === mediaType
              ? { ...item, watchlist }
              : item
          )
        )
      }

      if (previousItem) {
        queryClient.setQueryData(itemKey, { ...previousItem, watchlist })
      }

      return { previousList, previousItem, mediaId, mediaType }
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          ["library", "item", userId, context.mediaId, context.mediaType],
          context.previousItem
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, variables.mediaId, variables.mediaType],
      })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      mediaId: string
      mediaType: "movie" | "tv"
      status: LibraryStatus
    }) =>
      LibraryService.changeStatus(userId, variables.mediaId, variables.mediaType, variables.status),

    onMutate: async ({ mediaId, mediaType, status }) => {
      const listKey = ["library", "list", userId]
      const itemKey = ["library", "item", userId, mediaId, mediaType]

      await queryClient.cancelQueries({ queryKey: listKey })
      await queryClient.cancelQueries({ queryKey: itemKey })

      const previousList = queryClient.getQueryData<LibraryItem[]>(listKey)
      const previousItem = queryClient.getQueryData<LibraryItem | null>(itemKey)

      if (previousList) {
        queryClient.setQueryData(
          listKey,
          previousList.map((item) =>
            item.media_id === mediaId && item.media_type === mediaType ? { ...item, status } : item
          )
        )
      }

      if (previousItem) {
        queryClient.setQueryData(itemKey, { ...previousItem, status })
      }

      return { previousList, previousItem, mediaId, mediaType }
    },

    onError: (_err, _variables, context) => {
      if (context) {
        queryClient.setQueryData(["library", "list", userId], context.previousList)
        queryClient.setQueryData(
          ["library", "item", userId, context.mediaId, context.mediaType],
          context.previousItem
        )
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: ["library", "list", userId] })
      queryClient.invalidateQueries({
        queryKey: ["library", "item", userId, variables.mediaId, variables.mediaType],
      })
    },
  })
}
