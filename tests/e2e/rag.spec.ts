import { test, expect } from '@playwright/test'

test('@smoke RAG endpoint responds', async ({ request }) => {
  const res = await request.post('http://localhost:3000/api/rag', { data: { query: 'What is Linux system programming?' } })
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  expect(json).toHaveProperty('answer')
})
