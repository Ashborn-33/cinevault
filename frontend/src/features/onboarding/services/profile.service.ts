import { supabase } from "@/lib/supabase"
import type { Profile } from "../types/onboarding"

export const ProfileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw error
    return data as Profile | null
  },

  async createProfile(userId: string, username: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        username,
        onboarding_completed: false,
      })
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
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
    return data as Profile
  },

  async completeOnboarding(
    userId: string,
    preferredContent: string[],
    favoriteGenres: string[],
    avatarUrl: string | null
  ): Promise<Profile> {
    // Ensure onboarding creates a profile if one does not already exist before attempting update
    const dbProfile = await this.getProfile(userId)
    if (!dbProfile) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const username =
        user?.user_metadata?.username || user?.email?.split("@")[0] || `user_${userId.slice(0, 5)}`
      await this.createProfile(userId, username)
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferred_content: preferredContent,
        favorite_genres: favoriteGenres,
        avatar_url: avatarUrl,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return data as Profile
  },
}
