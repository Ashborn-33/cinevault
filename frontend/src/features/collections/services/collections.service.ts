import { supabase } from "@/lib/supabase"
import type { Collection, CollectionItem, CollectionDetails } from "../types/collections"

interface DBCollectionRow {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_media_id: number | null
  cover_media_type: string | null
  color: string | null
  icon: string | null
  is_smart: boolean
  created_at: string
  updated_at: string
  collection_items?: { poster_path: string | null; media_id: number }[]
}

interface DBCollectionItemRow {
  id: string
  collection_id: string
  media_id: number
  media_type: string
  title: string
  poster_path: string | null
  added_at: string
}

export const CollectionsService = {
  // getCollections: Fetches user collections including mapped items count
  async getCollections(userId: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from("collections")
      .select("*, collection_items(poster_path, media_id)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) throw error

    const rows = (data || []) as unknown as DBCollectionRow[]

    return rows.map((col) => ({
      id: col.id,
      user_id: col.user_id,
      name: col.name,
      description: col.description,
      cover_media_id: col.cover_media_id,
      cover_media_type: col.cover_media_type,
      color: col.color,
      icon: col.icon,
      is_smart: col.is_smart,
      created_at: col.created_at,
      updated_at: col.updated_at,
      items_count: col.collection_items?.length || 0,
      poster_path: col.collection_items?.[0]?.poster_path || null,
    }))
  },

  // getCollection: Fetches a single collection details along with sorted items
  async getCollection(collectionId: string): Promise<CollectionDetails> {
    const { data: collection, error: colError } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single()

    if (colError) throw colError

    const { data: items, error: itemsError } = await supabase
      .from("collection_items")
      .select("*")
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false })

    if (itemsError) throw itemsError

    const itemRows = (items || []) as unknown as DBCollectionItemRow[]

    return {
      ...(collection as unknown as DBCollectionRow),
      items: itemRows.map((item) => ({
        id: item.id,
        collection_id: item.collection_id,
        media_id: item.media_id,
        media_type: item.media_type as "movie" | "tv",
        title: item.title,
        poster_path: item.poster_path,
        added_at: item.added_at,
      })),
    }
  },

  // createCollection: Adds a new manual collection
  async createCollection(
    userId: string,
    name: string,
    description: string | null,
    color: string | null,
    icon: string | null,
    coverMediaId: number | null = null,
    coverMediaType: string | null = null
  ): Promise<Collection> {
    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: userId,
        name,
        description,
        color,
        icon,
        cover_media_id: coverMediaId,
        cover_media_type: coverMediaType,
        is_smart: false,
      })
      .select()
      .single()

    if (error) throw error
    return data as Collection
  },

  // updateCollection: Edits collection properties
  async updateCollection(
    collectionId: string,
    updates: Partial<
      Pick<
        Collection,
        "name" | "description" | "color" | "icon" | "cover_media_id" | "cover_media_type"
      >
    >
  ): Promise<Collection> {
    const { data, error } = await supabase
      .from("collections")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId)
      .select()
      .single()

    if (error) throw error
    return data as Collection
  },

  // deleteCollection: Destroys a collection (items cascade delete)
  async deleteCollection(collectionId: string): Promise<void> {
    const { error } = await supabase.from("collections").delete().eq("id", collectionId)
    if (error) throw error
  },

  // addItem: Adds a movie or TV show to the collection
  async addItem(
    collectionId: string,
    mediaId: number,
    mediaType: "movie" | "tv",
    title: string,
    posterPath: string | null
  ): Promise<CollectionItem> {
    // 1. Insert item
    const { data, error } = await supabase
      .from("collection_items")
      .insert({
        collection_id: collectionId,
        media_id: mediaId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
      })
      .select()
      .single()

    if (error) throw error

    // 2. Set collection cover to this item if it doesn't have one
    const { data: col } = await supabase
      .from("collections")
      .select("cover_media_id")
      .eq("id", collectionId)
      .single()

    if (col && !col.cover_media_id) {
      await supabase
        .from("collections")
        .update({
          cover_media_id: mediaId,
          cover_media_type: mediaType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", collectionId)
    } else {
      // Just update timestamp
      await supabase
        .from("collections")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", collectionId)
    }

    return data as CollectionItem
  },

  // removeItem: Removes a movie or TV show from the collection
  async removeItem(
    collectionId: string,
    mediaId: number,
    mediaType: "movie" | "tv"
  ): Promise<void> {
    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("media_id", mediaId)
      .eq("media_type", mediaType)

    if (error) throw error

    // Update collection timestamp
    await supabase
      .from("collections")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", collectionId)
  },

  // duplicateCollection: Clones a collection and all its elements
  async duplicateCollection(collectionId: string, userId: string): Promise<Collection> {
    // 1. Fetch original collection details
    const orig = await this.getCollection(collectionId)

    // 2. Create cloned collection
    const cloned = await this.createCollection(
      userId,
      `Copy of ${orig.name}`,
      orig.description,
      orig.color,
      orig.icon,
      orig.cover_media_id,
      orig.cover_media_type
    )

    // 3. Insert items if they exist
    if (orig.items.length > 0) {
      const itemsToInsert = orig.items.map((item) => ({
        collection_id: cloned.id,
        media_id: item.media_id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path,
      }))

      const { error: insertError } = await supabase.from("collection_items").insert(itemsToInsert)
      if (insertError) throw insertError
    }

    return cloned
  },

  // getMediaCollections: Returns list of collection IDs containing this specific media item
  async getMediaCollections(mediaId: number, mediaType: "movie" | "tv"): Promise<string[]> {
    const { data, error } = await supabase
      .from("collection_items")
      .select("collection_id")
      .eq("media_id", mediaId)
      .eq("media_type", mediaType)

    if (error) throw error
    const itemRows = (data || []) as unknown as { collection_id: string }[]
    return itemRows.map((item) => item.collection_id)
  },
}
export default CollectionsService
