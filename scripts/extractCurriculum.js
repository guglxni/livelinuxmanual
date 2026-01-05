/*
  Simple PDF curriculum extractor: reads a PDF, heuristically splits into chapters
  and writes a JSON file with lesson titles and text chunks.

  Usage: node scripts/extractCurriculum.js /absolute/path/to/manual.pdf
*/
import fs from 'fs'
import pdfParse from 'pdf-parse'

function extractSections(text){
  const lines = text.split(/\r?\n/).map(l => l.trim())
  const sections = []
  let currentTitle = 'Untitled'
  let buffer = []
  const isHeading = (line) => {
    if (!line) return false
    if (/^CHAPTER\b|^Chapter\b/i.test(line)) return true
    if (/^[0-9]+(\.|\))\s+\w+/.test(line)) return true
    if (/^[A-Z0-9 ]{4,}$/.test(line) && line.split(' ').length < 8 && line === line.toUpperCase()) return true
    return false
  }
  for (const line of lines) {
    if (isHeading(line)) {
      if (buffer.length) sections.push({ title: currentTitle, text: buffer.join('\n') })
      currentTitle = line
      buffer = []
    } else {
      if (/^\d+$/.test(line)) continue
      buffer.push(line)
    }
  }
  if (buffer.length) sections.push({ title: currentTitle, text: buffer.join('\n') })
  return sections
}

function splitIntoChapters(text){
  // Use PageLM-inspired section extraction heuristics
  const sections = extractSections(text)
  return sections.map(s => ({ title: s.title, text: s.text }))
}

async function main(){
  const path = process.argv[2]
  if (!path){ console.error('usage: node scripts/extractCurriculum.js path/to/manual.pdf'); process.exit(1)}
  const buf = fs.readFileSync(path)
  const parsed = await pdfParse(buf)
  const text = parsed.text
  const chapters = splitIntoChapters(text)
  fs.mkdirSync('content', { recursive: true })
  fs.writeFileSync('content/curriculum.json', JSON.stringify({ source: path, extractedAt: new Date().toISOString(), chapters }, null, 2))
  console.log('extracted chapters:', chapters.length)
}

main().catch(e => { console.error(e); process.exit(1) })
