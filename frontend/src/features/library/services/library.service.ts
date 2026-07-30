import { supabase } from "@/lib/supabase"
import type { LibraryItem, AddLibraryItemInput, LibraryStatus } from "../types/library"

export const LibraryService = {
  async getLibrary(userId: string): Promise<LibraryItem[]> {
    try {
      const { data, error } = await supabase
        .from("library")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      localStorage.setItem(`cinevault_library_${userId}`, JSON.stringify(data))
      return data as LibraryItem[]
    } catch (err) {
      console.warn("Offline fallback triggered for getLibrary:", err)
      const cached = localStorage.getItem(`cinevault_library_${userId}`)
      if (cached) return JSON.parse(cached) as LibraryItem[]
      throw err
    }
  },

  async getLibraryItem(
    userId: string,
    mediaId: string,
    mediaType: "movie" | "tv"
  ): Promise<LibraryItem | null> {
    const { data, error } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("media_type", mediaType)
      .maybeSingle()

    if (error) throw error
    return data as LibraryItem | null
  },

  async addToLibrary(userId: string, item: AddLibraryItemInput): Promise<LibraryItem> {
    const { data, error } = await supabase
      .from("library")
      .insert({
        ...item,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    return data as LibraryItem
  },

  async removeFromLibrary(
    userId: string,
    mediaId: string,
    mediaType: "movie" | "tv"
  ): Promise<void> {
    const { error } = await supabase
      .from("library")
      .delete()
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("media_type", mediaType)

    if (error) throw error
  },

  async updateLibraryItem(
    userId: string,
    mediaId: string,
    mediaType: "movie" | "tv",
    updates: Partial<LibraryItem>
  ): Promise<LibraryItem> {
    const { data, error } = await supabase
      .from("library")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("media_id", mediaId)
      .eq("media_type", mediaType)
      .select()
      .single()

    if (error) throw error
    return data as LibraryItem
  },

  async toggleFavorite(
    userId: string,
    mediaId: string,
    mediaType: "movie" | "tv",
    favorite: boolean
  ): Promise<LibraryItem> {
    return this.updateLibraryItem(userId, mediaId, mediaType, { favorite })
  },

  async toggleWatchlist(
    userId: string,
    mediaId: string,
    mediaType: "movie" | "tv",
    watchlist: boolean
  ): Promise<LibraryItem> {
    return this.updateLibraryItem(userId, mediaId, mediaType, { watchlist })
  },

  async changeStatus(
    userId: string,
    mediaId: string,
    mediaType: "movie" | "tv",
    status: LibraryStatus
  ): Promise<LibraryItem> {
    return this.updateLibraryItem(userId, mediaId, mediaType, { status })
  },
}
