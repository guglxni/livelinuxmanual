/* Basic smoke test: call /api/rag with a short query to verify pipeline */

async function main(){
  const res = await fetch('http://localhost:3000/api/rag', { method: 'POST', body: JSON.stringify({ query: 'What is Linux system programming?' }), headers: { 'Content-Type': 'application/json' }})
  const json = await res.json()
  console.log('smoke result:', JSON.stringify(json, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
