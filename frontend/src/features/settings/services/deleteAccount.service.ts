import { supabase } from "@/lib/supabase"
import { SettingsService } from "./settings.service"

export const DeleteAccountService = {
  /**
   * Deletes all storage assets and permanently deletes the user's profile and auth login.
   * Runs atomically via the database RPC.
   */
  async deleteAccount(userId: string): Promise<void> {
    // Clear localized preferences cache
    try {
      SettingsService.clearLocalCache(userId)
    } catch (err) {
      console.warn("Failed clearing local preferences cache:", err)
    }

    // 1. Delete uploaded files from storage (profiles bucket under user folder)
    try {
      const { data: files, error: listError } = await supabase.storage.from("profiles").list(userId)

      if (listError) {
        console.warn("Storage listing failed during account deletion:", listError)
      } else if (files && files.length > 0) {
        const filePaths = files.map((file) => `${userId}/${file.name}`)
        const { error: removeError } = await supabase.storage.from("profiles").remove(filePaths)
        if (removeError) {
          console.warn("Storage removal failed during account deletion:", removeError)
        }
      }
    } catch (err) {
      // Ignore missing files or folder access issues so database deletion proceeds
      console.warn("Ignored storage deletion warning:", err)
    }

    // 2. Call the backend database RPC to atomically clean up all database tables and auth login
    const { error: rpcError } = await supabase.rpc("delete_user_account")

    if (rpcError) {
      console.error("Backend account deletion RPC failed:", rpcError)
      throw new Error("We couldn't complete account deletion. Please try again.")
    }

    // 3. Sign out the local session
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.warn("Sign out failed post account deletion:", signOutError)
    }
  },
}
