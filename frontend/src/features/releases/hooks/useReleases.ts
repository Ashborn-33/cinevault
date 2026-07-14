import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { ReleaseService } from "../services/release.service"

export function useCalendar() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["releases", "calendar", userId],
    queryFn: () => ReleaseService.getCalendarEvents(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTodayReleases() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["releases", "today", userId],
    queryFn: () => ReleaseService.getTodayReleases(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTomorrowReleases() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["releases", "tomorrow", userId],
    queryFn: () => ReleaseService.getTomorrowReleases(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpcomingMovies() {
  return useQuery({
    queryKey: ["releases", "upcomingMovies"],
    queryFn: () => ReleaseService.getUpcomingMovies(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useUpcomingEpisodes() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["releases", "upcomingEpisodes", userId],
    queryFn: () => ReleaseService.getUpcomingEpisodes(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  })
}

export function useReleaseTimeline() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["releases", "timeline", userId],
    queryFn: () => ReleaseService.getReleaseTimeline(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
