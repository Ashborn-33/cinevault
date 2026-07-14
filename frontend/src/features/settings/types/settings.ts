export interface UserPreferences {
  user_id: string
  theme: string
  accent_color: string
  language: string
  default_home: string
  default_media_status: string
  show_spoilers: boolean
  hide_adult_content: boolean
  hide_completed: boolean
  auto_mark_next_episode: boolean
  auto_continue_tracking: boolean
  release_notifications: boolean
  achievement_notifications: boolean
  email_notifications: boolean
  push_notifications: boolean
  preferred_streaming_services: string[]
  preferred_languages: string[]
  recommendation_genres: string[]
  created_at: string
  updated_at: string
}
