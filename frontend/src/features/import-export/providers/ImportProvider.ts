import type {
  ImportParsedData,
  ImportPreviewData,
  ImportSummaryData,
  ImportOptions,
} from "../types/import-export"

export interface ImportProvider {
  id: string
  name: string
  description: string
  validate(files: Record<string, string>): Promise<boolean>
  parse(files: Record<string, string>): Promise<ImportParsedData>
  preview(userId: string, data: ImportParsedData): Promise<ImportPreviewData>
  import(
    userId: string,
    data: ImportParsedData,
    options: ImportOptions,
    onProgress?: (taskName: string, pct: number) => void
  ): Promise<ImportSummaryData>
}
