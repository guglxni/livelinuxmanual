import fs from 'fs'
import pdfParse from 'pdf-parse'

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN
const MODEL = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-mpnet-base-v2'
const QDRANT_URL = process.env.QDRANT_URL
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
const COLLECTION = process.env.QDRANT_COLLECTION || 'ls_content'

if (!QDRANT_URL || !QDRANT_API_KEY) {
  console.error('Please set QDRANT_URL and QDRANT_API_KEY in env')
  process.exit(1)
}

function chunkText(text, size = 1000){
  const out = []
  for (let i=0;i<text.length;i+=size) out.push(text.slice(i,i+size))
  return out
}

async function upsertPoints(points){
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points?wait=true`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', 'api-key': QDRANT_API_KEY },
    body: JSON.stringify({ points })
  })
  const j = await res.json()
  return j
}

async function ensureCollection(){
  const res = await fetch(`${QDRANT_URL}/collections`, { headers: { 'api-key': QDRANT_API_KEY }})
  const j = await res.json()
  const exists = j.collections?.some(c => c.name === COLLECTION)
  if (!exists){
    await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'api-key': QDRANT_API_KEY },
      body: JSON.stringify({ vectors: { size: 1536, distance: 'Cosine' } })
    })
  }
}

async function embedHF(text){
  if (!HF_TOKEN) return null
  // Try router
  const r = await fetch('https://router.huggingface.co/embeddings', {
    method: 'POST', headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: text })
  })
  if (r.ok){ const j = await r.json(); return j.embedding ?? j.embeddings?.[0] ?? j.data?.[0]?.embedding ?? null }

  // Fallback to model endpoint
  const rm = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
    method: 'POST', headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: text })
  })
  if (rm.ok){ const j = await rm.json(); return j.embedding ?? j.embeddings?.[0] ?? j.data?.[0]?.embedding ?? null }

  return null
}

async function main(){
  const path = process.argv[2]
  if (!path) { console.error('Usage: node scripts/ingestDirect.js ./file.pdf'); process.exit(1) }

  const buf = fs.readFileSync(path)
  const parsed = await pdfParse(buf)
  const text = parsed.text
  const chunks = chunkText(text, 1000)

  await ensureCollection()

  let i = 0
  for (const chunk of chunks){
    const vec = await embedHF(chunk) || (() => {
      // fallback deterministic vector
      const dim = 1536
      const v = new Array(dim).fill(0)
      for (let k=0;k<chunk.length;k++) v[k%dim] = (v[k%dim] + (chunk.charCodeAt(k)%1000))/2
      const norm = Math.sqrt(v.reduce((s,x)=>s+x*x,0)||1)
      return v.map(x=>x/norm)
    })()

    const id = `${Date.now()}-${i}`
    await upsertPoints([{ id, vector: vec, payload: { text: chunk } }])
    console.log('upserted', id)
    i++
  }
  console.log('done, indexed', i)
}

main().catch(e => { console.error(e); process.exit(1) })
