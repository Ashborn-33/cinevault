import { TVTimeProvider } from "../providers/TVTimeProvider"
import type { ImportProvider } from "../providers/ImportProvider"

class ProviderRegistry {
  private providers = new Map<string, ImportProvider>()

  constructor() {
    // Register initial providers (extensible for Trakt, IMDb, Letterboxd, Simkl)
    this.register(TVTimeProvider)
  }

  register(provider: ImportProvider) {
    this.providers.set(provider.id, provider)
  }

  get(id: string): ImportProvider | undefined {
    return this.providers.get(id)
  }

  list(): ImportProvider[] {
    return Array.from(this.providers.values())
  }
}

export const providerRegistry = new ProviderRegistry()
export default providerRegistry
