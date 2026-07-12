const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY
const tmdbBaseUrl = import.meta.env.VITE_TMDB_BASE_URL
const tmdbImageBase = import.meta.env.VITE_TMDB_IMAGE_BASE

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is required but missing from environment variables.")
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is required but missing from environment variables.")
}

if (!tmdbApiKey) {
  throw new Error("VITE_TMDB_API_KEY is required but missing from environment variables.")
}

if (!tmdbBaseUrl) {
  throw new Error("VITE_TMDB_BASE_URL is required but missing from environment variables.")
}

if (!tmdbImageBase) {
  throw new Error("VITE_TMDB_IMAGE_BASE is required but missing from environment variables.")
}

export const env = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  TMDB_API_KEY: tmdbApiKey,
  TMDB_BASE_URL: tmdbBaseUrl,
  TMDB_IMAGE_BASE: tmdbImageBase,
} as const
