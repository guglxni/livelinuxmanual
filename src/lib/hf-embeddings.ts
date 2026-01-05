const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN
const MODEL = process.env.EMBEDDING_MODEL || 'sentence-transformers/all-mpnet-base-v2'

function deterministicEmbed(text: string, dim = 1536): number[] {
  const vec = new Array(dim).fill(0)
  for (let i = 0; i < text.length; i++) {
    vec[i % dim] = (vec[i % dim] + (text.charCodeAt(i) % 1000)) / 2
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0) || 1)
  return vec.map(v => v / norm)
}

async function tryRouter(text: string): Promise<number[] | null> {
  if (!HF_TOKEN) return null
  try {
    // Best-effort router attempt
    const r = await fetch('https://router.huggingface.co/embeddings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, input: text })
    })
    if (r.ok) {
      const j = await r.json()
      return j.embedding ?? j.embeddings?.[0] ?? j.data?.[0]?.embedding ?? null
    }

    // Fallback to model-specific endpoint
    const rm = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: text })
    })
    if (rm.ok) {
      const j = await rm.json()
      return j.embedding ?? j.embeddings?.[0] ?? j.data?.[0]?.embedding ?? null
    }
  } catch (err) {
    console.warn('HF router/model endpoint failed', err)
  }
  return null
}

export async function embed(text: string): Promise<number[]> {
  // Order: Router endpoint -> model endpoint -> deterministic fallback
  const byRouter = await tryRouter(text)
  if (byRouter) return byRouter

  console.warn('Using deterministic fallback embedding (not semantic).')
  return deterministicEmbed(text, 1536)
}
