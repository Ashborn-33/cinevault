export interface UserProfile {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  favorite_color: string
  pinned_collections: string[]
  preferred_content: string[] | null
  favorite_genres: string[] | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface ViewerLevel {
  level: number
  title: string
  xp: number
  nextLevelXp: number
  progressPercent: number
}
