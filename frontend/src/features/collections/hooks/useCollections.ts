import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { CollectionsService } from "../services/collections.service"
import { queryKeys } from "@/lib/queryKeys"
import type { Collection } from "../types/collections"

export function useCollections() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.collections.list(userId),
    queryFn: () => CollectionsService.getCollections(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCollection(collectionId: string) {
  return useQuery({
    queryKey: queryKeys.collections.detail(collectionId),
    queryFn: () => CollectionsService.getCollection(collectionId),
    enabled: !!collectionId,
    staleTime: 30 * 1000,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      name: string
      description: string | null
      color: string | null
      icon: string | null
    }) =>
      CollectionsService.createCollection(
        userId,
        variables.name,
        variables.description,
        variables.color,
        variables.icon
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list(userId) })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      collectionId: string
      updates: Partial<
        Pick<
          Collection,
          "name" | "description" | "color" | "icon" | "cover_media_id" | "cover_media_type"
        >
      >
    }) => CollectionsService.updateCollection(variables.collectionId, variables.updates),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list(userId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.detail(variables.collectionId),
      })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (collectionId: string) => CollectionsService.deleteCollection(collectionId),

    onSuccess: (_data, collectionId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.detail(collectionId) })
    },
  })
}

export function useAddToCollection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: {
      collectionId: string
      mediaId: number
      mediaType: "movie" | "tv"
      title: string
      posterPath: string | null
    }) =>
      CollectionsService.addItem(
        variables.collectionId,
        variables.mediaId,
        variables.mediaType,
        variables.title,
        variables.posterPath
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list(userId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.detail(variables.collectionId),
      })
      queryClient.invalidateQueries({
        queryKey: ["collections", "mediaStatus", variables.mediaId, variables.mediaType],
      })
    },
  })
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (variables: { collectionId: string; mediaId: number; mediaType: "movie" | "tv" }) =>
      CollectionsService.removeItem(variables.collectionId, variables.mediaId, variables.mediaType),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list(userId) })
      queryClient.invalidateQueries({
        queryKey: queryKeys.collections.detail(variables.collectionId),
      })
      queryClient.invalidateQueries({
        queryKey: ["collections", "mediaStatus", variables.mediaId, variables.mediaType],
      })
    },
  })
}

export function useDuplicateCollection() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (collectionId: string) =>
      CollectionsService.duplicateCollection(collectionId, userId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.list(userId) })
    },
  })
}

export function useMediaCollections(mediaId: number, mediaType: "movie" | "tv") {
  return useQuery({
    queryKey: ["collections", "mediaStatus", mediaId, mediaType],
    queryFn: () => CollectionsService.getMediaCollections(mediaId, mediaType),
    enabled: !!mediaId,
    staleTime: 10 * 1000,
  })
}
