import { supabase } from "@/lib/supabase"

export const ExportService = {
  // generateBackup: Queries and packages all database rows into a downloadable JSON file
  async generateBackup(userId: string): Promise<void> {
    try {
      const [profileRes, settingsRes, libraryRes, watchRes, episodeRes, collectionsRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("library").select("*").eq("user_id", userId),
          supabase.from("watch_history").select("*").eq("user_id", userId),
          supabase.from("episode_progress").select("*").eq("user_id", userId),
          supabase.from("collections").select("*, items:collection_items(*)").eq("user_id", userId),
        ])

      const backupData = {
        metadata: {
          app_version: "1.3.0",
          export_date: new Date().toISOString(),
          version: "1.0",
        },
        profile: profileRes.data || null,
        settings: settingsRes.data || null,
        library: libraryRes.data || [],
        watch_history: watchRes.data || [],
        episode_progress: episodeRes.data || [],
        collections: collectionsRes.data || [],
      }

      // Convert to formatted JSON
      const jsonStr = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Trigger client-side file save trigger
      const link = document.createElement("a")
      const dateStr = new Date().toISOString().split("T")[0]
      link.download = `cinevault-backup-${dateStr}.json`
      link.href = url
      link.click()

      // Cleanup
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Backup export failed:", err)
      throw err
    }
  },
}
export default ExportService
