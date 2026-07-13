export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          username: string
          avatar_url?: string | null
          preferred_content?: string[] | null
          favorite_genres?: string[] | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          avatar_url?: string | null
          preferred_content?: string[] | null
          favorite_genres?: string[] | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      library: {
        Row: {
          id: string
          user_id: string
          media_id: string
          media_type: string
          title: string
          poster_path: string | null
          backdrop_path: string | null
          overview: string | null
          release_date: string | null
          genres: string[] | null
          status: string
          favorite: boolean
          watchlist: boolean
          rating: number | null
          notes: string | null
          created_at: string
          updated_at: string
          progress: number | null
          runtime_minutes: number | null
          times_watched: number | null
          started_at: string | null
          last_watched_at: string | null
          completed_at: string | null
          updated_progress_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          media_id: string
          media_type: string
          title: string
          poster_path?: string | null
          backdrop_path?: string | null
          overview?: string | null
          release_date?: string | null
          genres?: string[] | null
          status?: string
          favorite?: boolean
          watchlist?: boolean
          rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          progress?: number | null
          runtime_minutes?: number | null
          times_watched?: number | null
          started_at?: string | null
          last_watched_at?: string | null
          completed_at?: string | null
          updated_progress_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          media_id?: string
          media_type?: string
          title?: string
          poster_path?: string | null
          backdrop_path?: string | null
          overview?: string | null
          release_date?: string | null
          genres?: string[] | null
          status?: string
          favorite?: boolean
          watchlist?: boolean
          rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          progress?: number | null
          runtime_minutes?: number | null
          times_watched?: number | null
          started_at?: string | null
          last_watched_at?: string | null
          completed_at?: string | null
          updated_progress_at?: string | null
        }
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          library_id: string
          media_id: number
          media_type: string
          action: "started" | "continued" | "completed" | "rewatched"
          previous_progress: number | null
          new_progress: number | null
          title: string
          poster_path: string | null
          watch_date: string
          runtime_minutes: number | null
          completion_source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          library_id: string
          media_id: number
          media_type: string
          action: "started" | "continued" | "completed" | "rewatched"
          previous_progress?: number | null
          new_progress?: number | null
          title: string
          poster_path?: string | null
          watch_date?: string
          runtime_minutes?: number | null
          completion_source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          library_id?: string
          media_id?: number
          media_type?: string
          action?: "started" | "continued" | "completed" | "rewatched"
          previous_progress?: number | null
          new_progress?: number | null
          title?: string
          poster_path?: string | null
          watch_date?: string
          runtime_minutes?: number | null
          completion_source?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
