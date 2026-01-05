import { test, expect } from '@playwright/test'

// Tag this test with @smoke so CI only runs it on staging
test('@smoke smoke - simple chat flows', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.fill('textarea', 'What is in the course?')
  await page.click('button:has-text("Ask")')
  await page.waitForSelector('pre')
  const text = await page.textContent('pre')
  expect(text).toBeTruthy()
})
