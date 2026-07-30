import { supabase } from "@/lib/supabase"
import type { UserPreferences } from "../types/settings"

export const SettingsService = {
  // getPreferences: Fetches preferences or inserts default if not found
  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) throw error
      if (data) {
        localStorage.setItem(`cinevault_preferences_${userId}`, JSON.stringify(data))
        return data as UserPreferences
      }

      // Generate and save default preferences if none exist yet
      const defaults = {
        user_id: userId,
        theme: "system",
        accent_color: "#7C3AED",
        language: "en",
        default_home: "dashboard",
        default_media_status: "plan_to_watch",
        show_spoilers: false,
        hide_adult_content: true,
        hide_completed: false,
        auto_mark_next_episode: true,
        auto_continue_tracking: true,
        release_notifications: true,
        achievement_notifications: true,
        email_notifications: false,
        push_notifications: false,
        preferred_streaming_services: [] as string[],
        preferred_languages: [] as string[],
        recommendation_genres: [] as string[],
      }

      const insertRes = await supabase.from("user_preferences").insert(defaults).select().single()

      if (insertRes.error) throw insertRes.error
      localStorage.setItem(`cinevault_preferences_${userId}`, JSON.stringify(insertRes.data))
      return insertRes.data as UserPreferences
    } catch (err) {
      console.warn("Offline fallback triggered for getPreferences:", err)
      const cached = localStorage.getItem(`cinevault_preferences_${userId}`)
      if (cached) return JSON.parse(cached) as UserPreferences
      throw err
    }
  },

  // updatePreferences: Updates preferences in the database
  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from("user_preferences")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error
    return data as UserPreferences
  },

  // resetPreferences: Resets all preferences to default values
  async resetPreferences(userId: string): Promise<UserPreferences> {
    const defaults = {
      theme: "system",
      accent_color: "#7C3AED",
      language: "en",
      default_home: "dashboard",
      default_media_status: "plan_to_watch",
      show_spoilers: false,
      hide_adult_content: true,
      hide_completed: false,
      auto_mark_next_episode: true,
      auto_continue_tracking: true,
      release_notifications: true,
      achievement_notifications: true,
      email_notifications: false,
      push_notifications: false,
      preferred_streaming_services: [] as string[],
      preferred_languages: [] as string[],
      recommendation_genres: [] as string[],
    }

    return this.updatePreferences(userId, defaults)
  },

  // clearLocalCache: Clears preferences from localStorage on account deletion
  clearLocalCache(userId: string): void {
    localStorage.removeItem(`cinevault_preferences_${userId}`)
  },
}
export default SettingsService
