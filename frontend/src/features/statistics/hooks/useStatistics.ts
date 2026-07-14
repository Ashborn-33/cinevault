import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { StatisticsService } from "../services/statistics.service"
import { useMemo } from "react"

export function useRawStatistics() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const libraryQuery = useQuery({
    queryKey: ["library", "list", userId],
    queryFn: () => StatisticsService.getLibraryItems(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  })

  const historyQuery = useQuery({
    queryKey: ["tracking", "watchHistoryAll", userId],
    queryFn: () => StatisticsService.getWatchHistory(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  })

  const episodesQuery = useQuery({
    queryKey: ["tracking", "episodeProgressAll", userId],
    queryFn: () => StatisticsService.getEpisodeProgress(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  })

  const isLoading = libraryQuery.isLoading || historyQuery.isLoading || episodesQuery.isLoading
  const isError = libraryQuery.isError || historyQuery.isError || episodesQuery.isError
  const error = libraryQuery.error || historyQuery.error || episodesQuery.error

  return {
    libraryItems: libraryQuery.data || [],
    watchHistory: historyQuery.data || [],
    episodeProgress: episodesQuery.data || [],
    isLoading,
    isError,
    error,
    refetch: () => {
      libraryQuery.refetch()
      historyQuery.refetch()
      episodesQuery.refetch()
    },
  }
}

export function useOverview() {
  const { libraryItems, watchHistory, episodeProgress, isLoading, isError, refetch } =
    useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return null
    return StatisticsService.calculateOverview(libraryItems, watchHistory, episodeProgress)
  }, [libraryItems, watchHistory, episodeProgress, isLoading, isError])

  return { data, isLoading, isError, refetch }
}

export function useGenreStats() {
  const { libraryItems, watchHistory, isLoading, isError, refetch } = useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return []
    return StatisticsService.calculateGenreStats(libraryItems, watchHistory)
  }, [libraryItems, watchHistory, isLoading, isError])

  return { data, isLoading, isError, refetch }
}

export function useActivity() {
  const { watchHistory, isLoading, isError, refetch } = useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return null
    return StatisticsService.calculateActivity(watchHistory)
  }, [watchHistory, isLoading, isError])

  return { data, isLoading, isError, refetch }
}

export function useInsights() {
  const { libraryItems, watchHistory, isLoading, isError, refetch } = useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return []
    return StatisticsService.calculateViewingInsights(libraryItems, watchHistory)
  }, [libraryItems, watchHistory, isLoading, isError])

  return { data, isLoading, isError, refetch }
}

export function useAchievements() {
  const { libraryItems, watchHistory, episodeProgress, isLoading, isError, refetch } =
    useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return []
    return StatisticsService.calculateAchievements(libraryItems, watchHistory, episodeProgress)
  }, [libraryItems, watchHistory, episodeProgress, isLoading, isError])

  return { data, isLoading, isError, refetch }
}

export function useWatchStreak() {
  const { watchHistory, isLoading, isError, refetch } = useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return null
    return StatisticsService.calculateWatchStreak(watchHistory)
  }, [watchHistory, isLoading, isError])

  return { data, isLoading, isError, refetch }
}

export function useRecentlyCompleted() {
  const { libraryItems, isLoading, isError, refetch } = useRawStatistics()
  const data = useMemo(() => {
    if (isLoading || isError) return []
    return StatisticsService.calculateRecentlyCompleted(libraryItems)
  }, [libraryItems, isLoading, isError])

  return { data, isLoading, isError, refetch }
}
