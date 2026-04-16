const { test, expect } = require('@playwright/test')

const REAL_USER = 'westcounty'
const REAL_PASS = 'charfield123'

test.describe('读城 Real User E2E', () => {

  test('Login with real account, browse tasks, start/continue task', async ({ page }) => {
    // 1. Login
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.login-page')).toBeVisible()

    await page.locator('input[placeholder="请输入用户名"]').fill(REAL_USER)
    await page.locator('input[type="password"]').first().fill(REAL_PASS)
    await page.locator('button.login-submit').click()

    // Wait for redirect (login + profile fetch can be slow)
    await page.waitForURL(/\/explore/, { timeout: 20000 })

    const hasToken = await page.evaluate(() => !!localStorage.getItem('ducheng_access_token'))
    expect(hasToken).toBe(true)

    // 2. Task list shows 3 tasks
    await page.waitForSelector('.task-card', { timeout: 10000 })
    const cards = page.locator('.task-card')
    await expect(cards).toHaveCount(3)

    // 3. Click first task
    await cards.first().click()
    await page.waitForSelector('.task-hero', { timeout: 10000 })
    await expect(page.locator('.task-hero')).toBeVisible()

    // 4. Click CTA (could be 开始探索 or 继续探索 or 查看成就)
    const cta = page.locator('.cta-btn--primary, .cta-btn--continue')
    await expect(cta).toBeVisible()
    await cta.first().click()

    // 5. Should navigate to play or poster page
    await page.waitForURL(/\/(play|poster)/, { timeout: 10000 })

    // Verify we're on a valid explore sub-page
    const url = page.url()
    expect(url).toMatch(/\/explore\/[^/]+\/(play|poster)/)
  })

  test('Start a new task that has no progress', async ({ page }) => {
    // Login
    await page.goto('/#/login')
    await page.waitForLoadState('networkidle')
    await page.locator('input[placeholder="请输入用户名"]').fill(REAL_USER)
    await page.locator('input[type="password"]').first().fill(REAL_PASS)
    await page.locator('button.login-submit').click()
    await page.waitForURL(/\/explore/, { timeout: 20000 })

    // Navigate to a task the user likely hasn't started
    // (jingan-explore or bund-light-hunter)
    await page.goto('/#/explore/bund-light-hunter')
    await page.waitForSelector('.task-hero', { timeout: 10000 })

    // Find the CTA
    const cta = page.locator('.cta-btn--primary, .cta-btn--continue')
    await expect(cta).toBeVisible({ timeout: 5000 })

    const btnText = await cta.first().textContent()
    console.log('Button:', btnText.trim())

    await cta.first().click()
    await page.waitForURL(/\/(play|poster)/, { timeout: 10000 })

    const url = page.url()
    expect(url).toMatch(/\/explore\/[^/]+\/(play|poster)/)
  })
})
