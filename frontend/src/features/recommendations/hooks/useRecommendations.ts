import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/features/auth"
import { RecommendationService } from "../services/recommendation.service"

export function useRecommendations() {
  const { user } = useAuth()
  const userId = user?.id || ""

  const becauseYouWatched = useQuery({
    queryKey: ["recommendations", "because-watched", userId],
    queryFn: () => RecommendationService.getBecauseYouWatched(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const genreRecs = useQuery({
    queryKey: ["recommendations", "genre-recs", userId],
    queryFn: () => RecommendationService.getGenreRecommendations(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  })

  return {
    becauseYouWatched: becauseYouWatched.data || [],
    genreRecs: genreRecs.data || [],
    isLoading: becauseYouWatched.isLoading || genreRecs.isLoading,
    isError: becauseYouWatched.isError || genreRecs.isError,
    error: becauseYouWatched.error || genreRecs.error,
  }
}

export function useTrendingForYou() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["recommendations", "trending", userId],
    queryFn: () => RecommendationService.getTrendingForYou(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  })
}

export function useHiddenGems() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["recommendations", "hidden-gems", userId],
    queryFn: () => RecommendationService.getHiddenGems(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  })
}

export function useContinueSuggestions() {
  const { user } = useAuth()
  const userId = user?.id || ""

  return useQuery({
    queryKey: ["recommendations", "continue-suggestions", userId],
    queryFn: () => RecommendationService.getContinueSuggestions(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
export default useRecommendations
