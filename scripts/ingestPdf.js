/* Simple script to index a local PDF into Qdrant using HF embeddings */
import fs from 'fs'
import pdfParse from 'pdf-parse'
import { embed } from '../src/lib/hf-embeddings'
import { qdrant, ensureCollection } from '../src/lib/qdrant'

async function main(){
  const path = process.argv[2]
  if (!path) { console.error('Usage: node scripts/ingestPdf.js ./file.pdf'); process.exit(1) }

  const buf = fs.readFileSync(path)
  const parsed = await pdfParse(buf)
  const text = parsed.text
  const sections = require('../src/lib/pagelm').extractSections(text)

  await ensureCollection()

  let total = 0
  for (const sec of sections){
    const chunks = require('../src/lib/pagelm').chunkSectionText(sec.text, 1000)
    for (const [i, chunk] of chunks.entries()){
      const vector = await embed(chunk)
      await qdrant.upsert({
        collection_name: process.env.QDRANT_COLLECTION || 'ls_content',
        points: [{ id: `${Date.now()}-${total}-${i}`, payload: { title: sec.title, text: chunk }, vector }]
      })
    }
    total += chunks.length
  }
  console.log('indexed chunks:', total)
}

main().catch(err => { console.error(err); process.exit(1) })
