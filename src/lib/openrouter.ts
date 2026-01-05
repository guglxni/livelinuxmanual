const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function chatWithOpenRouter(messages: Array<{ role: string; content: string }>, model = process.env.OPENROUTER_MODEL || 'mistral-7b-instruct'){
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages })
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenRouter error: ${res.status} ${txt}`)
  }

  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}
