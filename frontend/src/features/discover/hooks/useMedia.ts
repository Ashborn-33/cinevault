import { useQuery } from "@tanstack/react-query"
import { MediaService } from "../services/media.service"

export function useTrending(page = 1) {
  return useQuery({
    queryKey: ["discover", "trending", page],
    queryFn: () => MediaService.getTrending(page),
    staleTime: 10 * 60 * 1000,
  })
}

export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: ["discover", "popular-movies", page],
    queryFn: () => MediaService.getPopularMovies(page),
    staleTime: 10 * 60 * 1000,
  })
}

export function usePopularTV(page = 1) {
  return useQuery({
    queryKey: ["discover", "popular-tv", page],
    queryFn: () => MediaService.getPopularTV(page),
    staleTime: 10 * 60 * 1000,
  })
}

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ["discover", "search", query, page],
    queryFn: () => MediaService.searchMedia(query, page),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMovie(id: string | number) {
  return useQuery({
    queryKey: ["discover", "movie", id],
    queryFn: () => MediaService.getMovieDetails(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  })
}

export function useTV(id: string | number) {
  return useQuery({
    queryKey: ["discover", "tv", id],
    queryFn: () => MediaService.getTVDetails(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  })
}

export function useGenres() {
  return useQuery({
    queryKey: ["discover", "genres"],
    queryFn: () => MediaService.getGenres(),
    staleTime: 24 * 60 * 60 * 1000,
  })
}
