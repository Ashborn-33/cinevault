import { supabase } from "@/lib/supabase"
import { MediaService } from "@/features/discover"
import { StatisticsService } from "@/features/statistics/services/statistics.service"
import type { RecommendationItem } from "../types/recommendations"
import type { MediaItem } from "@/components/ui/media-card"

export const RecommendationService = {
  // Helper to retrieve user library IDs to avoid recommending already watched items
  async getLibraryKeys(userId: string): Promise<Set<string>> {
    try {
      const items = await StatisticsService.getLibraryItems(userId)
      return new Set(items.map((item) => `${item.media_type}-${item.media_id}`))
    } catch {
      return new Set()
    }
  },

  // Helper to calculate score for a candidate item
  calculateScore(item: MediaItem, favoriteGenres: string[]): number {
    let score = (item.averageRating || 0) * 8 // Base score from rating

    // Genre matching
    if (item.genres && favoriteGenres.length > 0) {
      item.genres.forEach((g: string) => {
        if (favoriteGenres.includes(g)) {
          score += 15
        }
      })
    }

    // Freshness (released in the last 2 years)
    if (item.releaseYear) {
      const currentYear = new Date().getFullYear()
      if (currentYear - item.releaseYear <= 2) {
        score += 10
      }
    }

    return Math.round(score)
  },

  // 1. getBecauseYouWatched: Recommendations based on the user's most recently watched title
  async getBecauseYouWatched(userId: string): Promise<RecommendationItem[]> {
    try {
      const watchHistory = await StatisticsService.getWatchHistory(userId)
      if (watchHistory.length === 0) return []

      // Take the most recently completed or watched item
      const lastWatched = watchHistory[watchHistory.length - 1]
      const libKeys = await this.getLibraryKeys(userId)

      const recommendationsRes =
        lastWatched.media_type === "movie"
          ? await MediaService.getMovieRecommendations(lastWatched.media_id)
          : await MediaService.getTVRecommendations(lastWatched.media_id)

      const candidates = recommendationsRes.results || []
      const pref = await this.getUserPreferredGenres(userId)

      return candidates
        .filter((item) => !libKeys.has(`${item.type}-${item.id}`))
        .map((item) => ({
          id: `rec-by-watched-${item.type}-${item.id}`,
          mediaId: item.id,
          mediaType: item.type as "movie" | "tv",
          title: item.title,
          posterPath: item.posterUrl || null,
          backdropPath: null,
          rating: item.averageRating || 0,
          releaseDate: item.releaseYear ? String(item.releaseYear) : null,
          reason: `Because you watched ${lastWatched.title}`,
          score: this.calculateScore(item, pref),
          genres: item.genres || [],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    } catch (err) {
      console.error("Failed to load Because You Watched recommendations:", err)
      return []
    }
  },

  // 2. getTrendingForYou: Trending titles matching user's top genres
  async getTrendingForYou(userId: string): Promise<RecommendationItem[]> {
    try {
      const [trendingRes, pref, libKeys] = await Promise.all([
        MediaService.getTrending(1),
        this.getUserPreferredGenres(userId),
        this.getLibraryKeys(userId),
      ])

      const candidates = trendingRes.results || []

      return candidates
        .filter((item) => !libKeys.has(`${item.type}-${item.id}`))
        .map((item) => {
          const matchGenre = item.genres?.find((g) => pref.includes(g))
          const reason = matchGenre
            ? `Trending title matching your preference in ${matchGenre}`
            : "Highly popular across CineVault viewers today"

          return {
            id: `rec-trending-${item.type}-${item.id}`,
            mediaId: item.id,
            mediaType: item.type as "movie" | "tv",
            title: item.title,
            posterPath: item.posterUrl || null,
            backdropPath: null,
            rating: item.averageRating || 0,
            releaseDate: item.releaseYear ? String(item.releaseYear) : null,
            reason,
            score: this.calculateScore(item, pref),
            genres: item.genres || [],
          }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    } catch (err) {
      console.error("Failed to load Trending recommendations:", err)
      return []
    }
  },

  // 3. getHiddenGems: Highly-rated but lesser-known titles
  async getHiddenGems(userId: string): Promise<RecommendationItem[]> {
    try {
      const [popularMovies, popularTV, pref, libKeys] = await Promise.all([
        MediaService.getPopularMovies(1),
        MediaService.getPopularTV(1),
        this.getUserPreferredGenres(userId),
        this.getLibraryKeys(userId),
      ])

      const candidates = [...popularMovies.results, ...popularTV.results]

      // Hidden gem definition: High rating (>= 7.2) but lesser popularity/votes
      return candidates
        .filter((item) => !libKeys.has(`${item.type}-${item.id}`))
        .filter((item) => (item.averageRating || 0) >= 7.2)
        .map((item) => ({
          id: `rec-hidden-${item.type}-${item.id}`,
          mediaId: item.id,
          mediaType: item.type as "movie" | "tv",
          title: item.title,
          posterPath: item.posterUrl || null,
          backdropPath: null,
          rating: item.averageRating || 0,
          releaseDate: item.releaseYear ? String(item.releaseYear) : null,
          reason: "Highly rated hidden gem you might have missed",
          score: this.calculateScore(item, pref) + 15,
          genres: item.genres || [],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    } catch (err) {
      console.error("Failed to load Hidden Gems recommendations:", err)
      return []
    }
  },

  // 4. getContinueSuggestions: TV shows in library that are currently "watching"
  async getContinueSuggestions(userId: string): Promise<RecommendationItem[]> {
    try {
      const libItems = await StatisticsService.getLibraryItems(userId)
      const watchingTV = libItems.filter((i) => i.media_type === "tv" && i.status === "watching")

      if (watchingTV.length === 0) {
        // Fallback: recommend similar to their completed TV shows
        const completedTV = libItems.filter(
          (i) => i.media_type === "tv" && i.status === "completed"
        )
        if (completedTV.length === 0) return []

        const randomShow = completedTV[Math.floor(Math.random() * completedTV.length)]
        const recs = await MediaService.getTVRecommendations(randomShow.media_id)
        const libKeys = await this.getLibraryKeys(userId)
        const pref = await this.getUserPreferredGenres(userId)

        return recs.results
          .filter((item) => !libKeys.has(`${item.type}-${item.id}`))
          .map((item) => ({
            id: `rec-continue-${item.type}-${item.id}`,
            mediaId: item.id,
            mediaType: item.type as "movie" | "tv",
            title: item.title,
            posterPath: item.posterUrl || null,
            backdropPath: null,
            rating: item.averageRating || 0,
            releaseDate: item.releaseYear ? String(item.releaseYear) : null,
            reason: `Similar to ${randomShow.title} in your library`,
            score: this.calculateScore(item, pref),
            genres: item.genres || [],
          }))
          .slice(0, 6)
      }

      // Map active shows directly to resume suggestions
      return watchingTV.map((show) => ({
        id: `rec-resume-tv-${show.media_id}`,
        mediaId: show.media_id,
        mediaType: "tv",
        title: show.title,
        posterPath: show.poster_path || null,
        backdropPath: show.backdrop_path || null,
        rating: show.rating || 0,
        releaseDate: show.release_date,
        reason: "Resume watching your active TV series progress",
        score: 100, // High priority
        genres: show.genres || [],
      }))
    } catch (err) {
      console.error("Failed to load TV continue suggestions:", err)
      return []
    }
  },

  // 5. getGenreRecommendations: Recommends popular items in user's favorite genres
  async getGenreRecommendations(userId: string): Promise<RecommendationItem[]> {
    try {
      const pref = await this.getUserPreferredGenres(userId)
      if (pref.length === 0) return []

      const targetGenre = pref[0]
      const [popMovies, popTV, libKeys] = await Promise.all([
        MediaService.getPopularMovies(1),
        MediaService.getPopularTV(1),
        this.getLibraryKeys(userId),
      ])

      const candidates = [...popMovies.results, ...popTV.results]

      return candidates
        .filter((item) => !libKeys.has(`${item.type}-${item.id}`))
        .filter((item) => item.genres?.includes(targetGenre))
        .map((item) => ({
          id: `rec-genre-${item.type}-${item.id}`,
          mediaId: item.id,
          mediaType: item.type as "movie" | "tv",
          title: item.title,
          posterPath: item.posterUrl || null,
          backdropPath: null,
          rating: item.averageRating || 0,
          releaseDate: item.releaseYear ? String(item.releaseYear) : null,
          reason: `Recommended because you enjoy ${targetGenre} titles`,
          score: this.calculateScore(item, pref),
          genres: item.genres || [],
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
    } catch (err) {
      console.error("Failed to load Genre recommendations:", err)
      return []
    }
  },

  // Helper to fetch user's preferred genres from profile or preferences table
  async getUserPreferredGenres(userId: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("favorite_genres")
        .eq("user_id", userId)
        .maybeSingle()

      if (data?.favorite_genres && data.favorite_genres.length > 0) {
        return data.favorite_genres
      }

      // Check user preferences next
      const prefRes = await supabase
        .from("user_preferences")
        .select("recommendation_genres")
        .eq("user_id", userId)
        .maybeSingle()

      return prefRes.data?.recommendation_genres || []
    } catch {
      return []
    }
  },
}
export default RecommendationService
