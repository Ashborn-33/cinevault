import { useQuery } from "@tanstack/react-query"
import { MediaService } from "@/features/discover"

export function useMovieDetails(id: string | number) {
  return useQuery({
    queryKey: ["media", "movie", "details", id],
    queryFn: () => MediaService.getMovieDetails(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  })
}

export function useTVDetails(id: string | number) {
  return useQuery({
    queryKey: ["media", "tv", "details", id],
    queryFn: () => MediaService.getTVDetails(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  })
}

export function useMovieCredits(id: string | number) {
  return useQuery({
    queryKey: ["media", "movie", "credits", id],
    queryFn: () => MediaService.getMovieCredits(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useTVCredits(id: string | number) {
  return useQuery({
    queryKey: ["media", "tv", "credits", id],
    queryFn: () => MediaService.getTVCredits(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useMovieVideos(id: string | number) {
  return useQuery({
    queryKey: ["media", "movie", "videos", id],
    queryFn: () => MediaService.getMovieVideos(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useTVVideos(id: string | number) {
  return useQuery({
    queryKey: ["media", "tv", "videos", id],
    queryFn: () => MediaService.getTVVideos(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useMovieRecommendations(id: string | number) {
  return useQuery({
    queryKey: ["media", "movie", "recommendations", id],
    queryFn: () => MediaService.getMovieRecommendations(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  })
}

export function useTVRecommendations(id: string | number) {
  return useQuery({
    queryKey: ["media", "tv", "recommendations", id],
    queryFn: () => MediaService.getTVRecommendations(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  })
}

export function useMovieImages(id: string | number) {
  return useQuery({
    queryKey: ["media", "movie", "images", id],
    queryFn: () => MediaService.getMovieImages(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useTVImages(id: string | number) {
  return useQuery({
    queryKey: ["media", "tv", "images", id],
    queryFn: () => MediaService.getTVImages(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  })
}

export function useTVSeasonDetails(id: string | number, season: number) {
  return useQuery({
    queryKey: ["media", "tv", "season", id, season],
    queryFn: () => MediaService.getTVSeasonDetails(id, season),
    enabled: !!id && season >= 0,
    staleTime: 15 * 60 * 1000,
  })
}
