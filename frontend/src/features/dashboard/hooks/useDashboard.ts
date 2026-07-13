import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { DashboardService } from "../services/dashboard.service"
import { queryKeys } from "@/lib/queryKeys"

export function useContinueWatching() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.dashboard.continueWatching(userId),
    queryFn: () => DashboardService.getContinueWatching(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useUpcomingEpisodes() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: queryKeys.dashboard.upcomingEpisodes(userId),
    queryFn: () => DashboardService.getUpcomingEpisodes(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
