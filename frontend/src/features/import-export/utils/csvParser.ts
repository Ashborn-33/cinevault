/**
 * Custom robust client-side CSV parser that handles quotes, escaped quotes,
 * and different line-ending combinations.
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines: string[][] = []
  let row: string[] = []
  let col = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        col += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      row.push(col.trim())
      col = ""
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++ // Skip LF character
      }
      row.push(col.trim())
      if (row.length > 0 && row.some((c) => c !== "")) {
        lines.push(row)
      }
      row = []
      col = ""
    } else {
      col += char
    }
  }

  // Push remaining cell/row
  if (col || row.length > 0) {
    row.push(col.trim())
    lines.push(row)
  }

  if (lines.length < 2) return []

  // Extract and normalize headers
  const headers = lines[0].map((h) => h.toLowerCase().replace(/['"]/g, "").trim())

  const results: Record<string, string>[] = []

  for (let r = 1; r < lines.length; r++) {
    const values = lines[r]
    const obj: Record<string, string> = {}
    headers.forEach((header, idx) => {
      if (header) {
        obj[header] = values[idx] || ""
      }
    })
    results.push(obj)
  }

  return results
}
export default parseCSV
