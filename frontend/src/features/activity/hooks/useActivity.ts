import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { ActivityService } from "../services/activity.service"
import type { ActivityFilters } from "../types/activity"

export function useTimeline(filters?: ActivityFilters, limit = 20) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useInfiniteQuery({
    queryKey: ["activity", "timeline", userId, filters, limit],
    queryFn: ({ pageParam = 1 }) => ActivityService.getTimeline(userId, pageParam, limit, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    enabled: !!userId,
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useRecentActivity(limit = 5) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["activity", "recent", userId, limit],
    queryFn: () => ActivityService.getRecentActivity(userId, limit),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useActivityDate(dateStr: string) {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["activity", "date", userId, dateStr],
    queryFn: () => ActivityService.getActivityByDate(userId, dateStr),
    enabled: !!userId && !!dateStr,
    staleTime: 30 * 1000,
  })
}
