import { env } from "@/config/env"

export const tmdbClient = {
  async request<T>(
    endpoint: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<T> {
    const url = new URL(`${env.TMDB_BASE_URL}${endpoint}`)

    url.searchParams.append("api_key", env.TMDB_API_KEY)

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        url.searchParams.append(key, String(val))
      }
    })

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error")
      throw new Error(`TMDB API Error (${response.status}): ${errText}`)
    }

    return response.json() as Promise<T>
  },

  getImageUrl(
    path: string | null,
    size: "poster" | "backdrop" | "profile" = "poster"
  ): string | undefined {
    if (!path) return undefined

    let sizePath = "w500"
    if (size === "backdrop") sizePath = "w1280"
    if (size === "profile") sizePath = "h632"

    return `${env.TMDB_IMAGE_BASE}/${sizePath}${path}`
  },
}
