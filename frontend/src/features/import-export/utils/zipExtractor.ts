import JSZip from "jszip"

export interface ExtractedFiles {
  [filename: string]: string
}

/**
 * Extracts all files from a client-side ZIP file into a string record.
 * Normalizes nested folder paths to extract basenames.
 */
export async function extractZip(file: File): Promise<ExtractedFiles> {
  const zip = new JSZip()
  const contents = await zip.loadAsync(file)
  const files: ExtractedFiles = {}

  for (const filename of Object.keys(contents.files)) {
    const fileEntry = contents.files[filename]
    if (!fileEntry.dir) {
      const text = await fileEntry.async("string")
      const baseName = filename.split("/").pop() || filename
      files[baseName] = text
    }
  }

  return files
}
export default extractZip
