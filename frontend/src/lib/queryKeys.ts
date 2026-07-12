export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
    profile: (userId: string) => ["auth", "profile", userId] as const,
  },
  media: {
    detail: (mediaId: string) => ["media", "detail", mediaId] as const,
    list: (filters?: Record<string, unknown>) => ["media", "list", filters] as const,
    trending: ["media", "trending"] as const,
  },
  library: {
    watchlist: (userId: string) => ["library", "watchlist", userId] as const,
    history: (userId: string) => ["library", "history", userId] as const,
  },
  collections: {
    list: (userId?: string) => ["collections", "list", userId] as const,
    detail: (collectionId: string) => ["collections", "detail", collectionId] as const,
  },
  statistics: {
    user: (userId: string) => ["statistics", "user", userId] as const,
  },
} as const
