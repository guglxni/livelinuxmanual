const QDRANT_URL = process.env.QDRANT_URL || ''
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''

function headers(){
  return {
    'Content-Type': 'application/json',
    'api-key': QDRANT_API_KEY
  }
}

export async function getCollections(){
  const res = await fetch(`${QDRANT_URL}/collections`, { headers: headers() })
  return res.json()
}

export async function ensureCollection(collectionName = process.env.QDRANT_COLLECTION || 'ls_content'){
  const collections = await getCollections()
  const exists = collections.collections?.some((c: any) => c.name === collectionName)
  if (!exists) {
    await fetch(`${QDRANT_URL}/collections/${collectionName}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ vectors: { size: 1536, distance: 'Cosine' } })
    })
  }
}

export async function upsert({ collection_name, points }: { collection_name: string, points: any[] }){
  const res = await fetch(`${QDRANT_URL}/collections/${collection_name}/points?wait=true`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ points })
  })
  return res.json()
}

export async function search({ collection_name, vector, limit = 4, with_payload = true }: { collection_name: string, vector: number[], limit?: number, with_payload?: boolean }){
  const res = await fetch(`${QDRANT_URL}/collections/${collection_name}/points/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ vector, limit, with_payload })
  })
  return res.json()
}
