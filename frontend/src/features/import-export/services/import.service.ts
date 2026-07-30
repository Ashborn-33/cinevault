import { extractZip } from "../utils/zipExtractor"
import { providerRegistry } from "./providerRegistry"
import type { ImportProvider } from "../providers/ImportProvider"

export const ImportService = {
  // extractZipFile: Unpacks file contents client-side
  async extractZipFile(file: File): Promise<Record<string, string>> {
    return extractZip(file)
  },

  // detectProvider: Scans extracted filenames against provider requirements
  async detectProvider(files: Record<string, string>): Promise<ImportProvider | null> {
    const list = providerRegistry.list()
    for (const provider of list) {
      const isValid = await provider.validate(files)
      if (isValid) return provider
    }
    return null
  },
}
export default ImportService
