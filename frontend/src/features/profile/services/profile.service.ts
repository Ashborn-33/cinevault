import { supabase } from "@/lib/supabase"
import type { UserProfile, ViewerLevel } from "../types/profile"
import { StatisticsService } from "@/features/statistics/services/statistics.service"

export const ProfileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const profile = {
        ...data,
        pinned_collections: data.pinned_collections || [],
      } as UserProfile

      localStorage.setItem(`cinevault_profile_${userId}`, JSON.stringify(profile))
      return profile
    } catch (err) {
      console.warn("Offline fallback triggered for getProfile:", err)
      const cached = localStorage.getItem(`cinevault_profile_${userId}`)
      if (cached) return JSON.parse(cached) as UserProfile
      throw err
    }
  },

  // updateProfile: Updates profile columns
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return {
      ...data,
      pinned_collections: data.pinned_collections || [],
    } as UserProfile
  },

  // uploadAvatar: Uploads avatar file to Supabase storage profiles bucket
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)
    return data.publicUrl
  },

  // uploadBanner: Uploads banner file to Supabase storage profiles bucket
  async uploadBanner(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const filePath = `${userId}/banner-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("profiles").getPublicUrl(filePath)
    return data.publicUrl
  },

  // getPinnedCollections: Fetches pinned collections metadata
  async getPinnedCollections(userId: string) {
    const profile = await this.getProfile(userId)
    if (!profile || !profile.pinned_collections || profile.pinned_collections.length === 0) {
      return []
    }

    const { data, error } = await supabase
      .from("collections")
      .select("*, items:collection_items(*)")
      .in("id", profile.pinned_collections)

    if (error) throw error
    return data || []
  },

  // updatePinnedCollections: Updates array of pinned collections in user profile
  async updatePinnedCollections(userId: string, collectionIds: string[]): Promise<UserProfile> {
    return this.updateProfile(userId, { pinned_collections: collectionIds })
  },

  // calculateViewerLevel: Calculates title, level, progress percent from total XP
  calculateViewerLevel(totalXP: number): ViewerLevel {
    const xpPerLevel = 300
    const level = Math.max(1, Math.floor(totalXP / xpPerLevel) + 1)
    const currentXp = totalXP % xpPerLevel
    const progressPercent = Math.round((currentXp / xpPerLevel) * 100)

    let title = "New Viewer"
    if (level >= 50) title = "CineVault Legend"
    else if (level >= 35) title = "Binge Master"
    else if (level >= 20) title = "Collector"
    else if (level >= 10) title = "Cinephile"
    else if (level >= 5) title = "Casual Fan"

    return {
      level,
      title,
      xp: totalXP,
      nextLevelXp: xpPerLevel,
      progressPercent,
    }
  },

  // calculateXP: Sums up XP dynamically from user achievements and tracking
  async calculateXP(userId: string): Promise<number> {
    try {
      // 1. Fetch library items, completed episodes, collections, watch history
      const [libraryItems, episodeProgress, collectionsRes, watchHistory] = await Promise.all([
        StatisticsService.getLibraryItems(userId),
        StatisticsService.getEpisodeProgress(userId),
        supabase.from("collections").select("id").eq("user_id", userId),
        StatisticsService.getWatchHistory(userId),
      ])

      const collections = collectionsRes.data || []

      // 2. Count movies completed
      const moviesCompleted = libraryItems.filter(
        (i) => i.media_type === "movie" && i.status === "completed"
      ).length

      // 3. Count episodes watched
      const episodesCompleted = episodeProgress.reduce((sum, ep) => sum + (ep.watch_count || 1), 0)

      // 4. Count collections created
      const collectionsCount = collections.length

      // 5. Count achievements unlocked
      const achievements = StatisticsService.calculateAchievements(
        libraryItems,
        watchHistory,
        episodeProgress
      )
      const achievementsCount = achievements.filter((a) => a.unlocked).length

      // 6. Check watch streak
      const { longestStreak } = StatisticsService.calculateWatchStreak(watchHistory)
      const streakBonus = longestStreak >= 7 ? 150 : 0

      // 7. Calculate aggregate sum
      return (
        moviesCompleted * 100 +
        episodesCompleted * 25 +
        collectionsCount * 50 +
        achievementsCount * 75 +
        streakBonus
      )
    } catch (err) {
      console.error("Failed to calculate viewer XP:", err)
      return 0
    }
  },
}
export default ProfileService
