import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { ProfileService } from "../services/profile.service"
import { StatisticsService } from "@/features/statistics/services/statistics.service"
import { MediaService } from "@/features/discover"
import type { UserProfile } from "../types/profile"

export function useProfile() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => ProfileService.getProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const xpQuery = useQuery({
    queryKey: ["profile", "xp", userId],
    queryFn: () => ProfileService.calculateXP(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  })

  const viewerLevel = ProfileService.calculateViewerLevel(xpQuery.data || 0)

  return {
    profile: profileQuery.data || null,
    isLoading: profileQuery.isLoading || xpQuery.isLoading,
    isError: profileQuery.isError || xpQuery.isError,
    error: profileQuery.error || xpQuery.error,
    viewerLevel,
    refetch: () => {
      profileQuery.refetch()
      xpQuery.refetch()
    },
  }
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id || ""

  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => ProfileService.updateProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] })
      queryClient.invalidateQueries({ queryKey: ["profile", "pinned", userId] })
      queryClient.invalidateQueries({ queryKey: ["statistics"] })
      queryClient.invalidateQueries({ queryKey: ["collections"] })
      queryClient.invalidateQueries({ queryKey: ["activity"] })
    },
  })
}

export function usePinnedCollections() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["profile", "pinned", userId],
    queryFn: () => ProfileService.getPinnedCollections(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProfileFavorites() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["profile", "favorites", userId],
    queryFn: async () => {
      const items = await StatisticsService.getLibraryItems(userId)
      const completed = items
        .filter((i) => i.status === "completed")
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 8) // Limit to top 8 completed items for performance

      const actorCounts: Record<string, { count: number; profilePath: string | null }> = {}
      const directorCounts: Record<string, { count: number; profilePath: string | null }> = {}

      await Promise.all(
        completed.map(async (item) => {
          try {
            const credits =
              item.media_type === "movie"
                ? await MediaService.getMovieCredits(item.media_id)
                : await MediaService.getTVCredits(item.media_id)

            if (credits.cast) {
              credits.cast.slice(0, 4).forEach((actor) => {
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
            console.error(`Failed to load credits for media ${item.media_id}:`, err)
          }
        })
      )

      // Sort and get top 5
      const topActors = Object.entries(actorCounts)
        .map(([name, data]) => ({ name, count: data.count, profilePath: data.profilePath }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      const topDirectors = Object.entries(directorCounts)
        .map(([name, data]) => ({ name, count: data.count, profilePath: data.profilePath }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return { topActors, topDirectors }
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  })
}
