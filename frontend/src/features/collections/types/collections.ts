export interface Collection {
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
  items_count?: number
  poster_path?: string | null
}

export interface CollectionItem {
  id: string
  collection_id: string
  media_id: number
  media_type: "movie" | "tv"
  title: string
  poster_path: string | null
  added_at: string
}

export interface CollectionDetails extends Collection {
  items: CollectionItem[]
}
