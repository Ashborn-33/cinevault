import { supabase } from "@/lib/supabase"
import type { UserPreferences } from "../types/settings"

export const SettingsService = {
  // getPreferences: Fetches preferences or inserts default if not found
  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (error) throw error
    if (data) return data as UserPreferences

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
    return insertRes.data as UserPreferences
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
}
export default SettingsService
