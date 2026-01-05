// PageLM-inspired simple PDF text structurer.
// This is an initial helper for splitting long PDF text into sections. It uses
// heuristics similar to PageLM: heading detection, TOC detection, and chunking.

export function extractSections(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim())
  const sections: { title: string; text: string }[] = []
  let currentTitle = 'Untitled'
  let buffer: string[] = []

  const isHeading = (line: string) => {
    if (!line) return false
    // Heuristics: all caps headings, or line starts with 'Chapter' or 'CHAPTER', or numbered headings
    if (/^CHAPTER\b|^Chapter\b/i.test(line)) return true
    if (/^[0-9]+(\.|\))\s+\w+/.test(line)) return true
    if (/^[A-Z0-9 ]{4,}$/.test(line) && line.split(' ').length < 8 && line === line.toUpperCase()) return true
    return false
  }

  for (const line of lines) {
    if (isHeading(line)) {
      if (buffer.length) {
        sections.push({ title: currentTitle, text: buffer.join('\n') })
      }
      currentTitle = line
      buffer = []
    } else {
      // skip long runs of whitespace or page numbers
      if (/^\d+$/.test(line)) continue
      buffer.push(line)
    }
  }
  if (buffer.length) sections.push({ title: currentTitle, text: buffer.join('\n') })
  return sections
}

export function chunkSectionText(text: string, maxLen = 1000) {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    const piece = text.slice(i, i + maxLen)
    chunks.push(piece)
    i += maxLen
  }
  return chunks
}
