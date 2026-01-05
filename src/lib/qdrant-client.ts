// Qdrant client wrapper using REST API (no external dependency)

const QDRANT_URL = process.env.QDRANT_URL || '';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

function headers() {
  return {
    'Content-Type': 'application/json',
    'api-key': QDRANT_API_KEY,
  };
}

export const qdrant = {
  async getCollections() {
    if (!QDRANT_URL) return { collections: [] };
    const res = await fetch(`${QDRANT_URL}/collections`, { headers: headers() });
    return res.json();
  },

  async search(params: {
    collection_name: string;
    query_vector: number[] | null;
    limit?: number;
    with_payload?: boolean;
  }) {
    if (!QDRANT_URL || !params.query_vector) return { result: [] };
    const res = await fetch(`${QDRANT_URL}/collections/${params.collection_name}/points/search`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        vector: params.query_vector,
        limit: params.limit || 5,
        with_payload: params.with_payload ?? true,
      }),
    });
    return res.json();
  },

  async upsert(params: { collection_name: string; points: any[] }) {
    if (!QDRANT_URL) return { status: 'skipped' };
    const res = await fetch(`${QDRANT_URL}/collections/${params.collection_name}/points?wait=true`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ points: params.points }),
    });
    return res.json();
  },
};

export async function ensureCollection(name: string) {
  if (!QDRANT_URL) {
    console.warn('QDRANT_URL not set, skipping collection creation');
    return;
  }
  try {
    const collections = await qdrant.getCollections();
    const has = collections.collections?.some((c: any) => c.name === name);
    if (!has) {
      await fetch(`${QDRANT_URL}/collections/${name}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ vectors: { size: 1536, distance: 'Cosine' } }),
      });
    }
  } catch (err) {
    console.error('Qdrant ensureCollection error', err);
    throw err;
  }
}
