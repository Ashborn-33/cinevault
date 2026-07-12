export interface Profile {
  id: string
  user_id: string
  username: string
  avatar_url: string | null
  preferred_content: string[] | null
  favorite_genres: string[] | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingData {
  preferredContent: string[]
  favoriteGenres: string[]
  avatar: File | null
  avatarUrl: string | null
}
