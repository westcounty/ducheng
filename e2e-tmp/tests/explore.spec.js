const { test, expect } = require('@playwright/test')

// Short username to stay under 20-char limit
const ts = Date.now() % 1e8
const TEST_USER = `e2e${ts}`
const TEST_PASS = 'Test12345678'

/**
 * Helper: inject auth token via direct API call, bypassing login UI.
 * Faster and more reliable than form-based login for test setup.
 */
async function injectAuth(page) {
  const resp = await page.request.post('https://admin.nju.top/v1/auth/password/register', {
    data: {
      username: TEST_USER,
      password: TEST_PASS,
      deviceFingerprint: 'e2e-playwright-fp',
      deviceName: 'Playwright',
      appId: 'ducheng-web',
    },
    ignoreHTTPSErrors: true,
  })

  let data
  if (resp.ok()) {
    data = await resp.json()
  } else {
    // User already exists, try login
    const loginResp = await page.request.post('https://admin.nju.top/v1/auth/password/login', {
      data: {
        username: TEST_USER,
        password: TEST_PASS,
        deviceFingerprint: 'e2e-playwright-fp',
        deviceName: 'Playwright',
        appId: 'ducheng-web',
      },
      ignoreHTTPSErrors: true,
    })
    data = await loginResp.json()
  }

  // Decode JWT to get userId
  const payload = JSON.parse(
    Buffer.from(data.accessToken.split('.')[1], 'base64').toString(),
  )

  const user = {
    userId: payload.sub,
    username: TEST_USER,
    nickname: TEST_USER,
  }

  await page.evaluate(
    ({ token, refresh, userJson }) => {
      localStorage.setItem('ducheng_access_token', token)
      localStorage.setItem('ducheng_refresh_token', refresh)
      localStorage.setItem('ducheng_user', userJson)
    },
    {
      token: data.accessToken,
      refresh: data.refreshToken,
      userJson: JSON.stringify(user),
    },
  )

  return data.accessToken
}

test.describe('读城 Exploration Task E2E', () => {

  // --- Phase 1: Public pages (no auth) ---
  test.describe('Public pages', () => {
    test('Platform home loads and shows explore entry', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.explore-entry')).toBeVisible()
    })

    test('Task list page shows 3 tasks', async ({ page }) => {
      await page.goto('/#/explore')
      await page.waitForResponse(resp =>
        resp.url().includes('/api/tasks') && resp.status() === 200,
      )
      const cards = page.locator('.task-card')
      await expect(cards).toHaveCount(3)
    })

    test('Task detail page shows jingan-explore info', async ({ page }) => {
      await page.goto('/#/explore/jingan-explore')
      await page.waitForResponse(resp =>
        resp.url().includes('/api/tasks/jingan-explore') && resp.status() === 200,
      )
      await expect(page.locator('.task-hero')).toBeVisible()
      await expect(page.locator('.cta-btn--primary')).toBeVisible()
    })

    test('Nonexistent task shows error state', async ({ page }) => {
      await page.goto('/#/explore/nonexistent-task')
      await page.waitForResponse(resp =>
        resp.url().includes('/api/tasks/nonexistent-task') && resp.status() === 404,
      )
      await page.waitForTimeout(500)
      await expect(page.locator('.task-hero')).not.toBeVisible()
    })
  })

  // --- Phase 2: Authentication via UI ---
  test.describe('Authentication', () => {
    test('Register new user and redirect to explore', async ({ page }) => {
      await page.goto('/#/login')
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.login-page')).toBeVisible()

      // Switch to register mode
      await page.locator('button.login-toggle').click()

      // Fill form
      await page.locator('input[placeholder="请输入用户名"]').fill(TEST_USER)
      await page.locator('input[placeholder="密码长度至少8位"]').fill(TEST_PASS)
      await page.locator('input[placeholder="再次输入密码"]').fill(TEST_PASS)

      // Submit
      await page.locator('button.login-submit').click()

      // Should redirect to /explore
      await page.waitForURL(/\/explore/, { timeout: 10000 })
      await expect(page.locator('.task-card')).toHaveCount(3)
    })
  })

  // --- Phase 3: Task play flow ---
  test.describe('Task play flow', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to the app first to get localStorage access
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Inject auth token via API + localStorage
      await injectAuth(page)

      // Reload to pick up the auth state
      await page.reload()
      await page.waitForLoadState('networkidle')
    })

    test('Start jingan-explore and see play page', async ({ page }) => {
      // Navigate to task detail
      await page.goto('/#/explore/jingan-explore')
      await page.waitForResponse(resp =>
        resp.url().includes('/api/tasks/jingan-explore') && resp.status() === 200,
      )

      // Click start button
      const startResp = page.waitForResponse(resp =>
        resp.url().includes('/start') && resp.status() === 200,
      )
      await page.locator('.cta-btn--primary').click()
      await startResp

      // Should be on play page
      await page.waitForURL(/\/play/, { timeout: 5000 })
      await expect(page.locator('.play-header')).toBeVisible()
    })

    test('Start wukang-road-walk task', async ({ page }) => {
      await page.goto('/#/explore/wukang-road-walk')
      await page.waitForResponse(resp =>
        resp.url().includes('/api/tasks/wukang-road-walk') && resp.status() === 200,
      )

      const startResp = page.waitForResponse(resp =>
        resp.url().includes('/start') && resp.status() === 200,
      )
      await page.locator('.cta-btn--primary').click()
      await startResp

      await page.waitForURL(/\/play/, { timeout: 5000 })
      await expect(page.locator('.play-header')).toBeVisible()
    })

    test('Badge collection page renders', async ({ page }) => {
      await page.goto('/#/badges')
      await page.waitForResponse(resp =>
        resp.url().includes('/api/badges') && resp.status() === 200,
      )
      // Page renders (empty state since no badges earned)
      await expect(page.locator('.explore-page')).toBeVisible()
      await expect(page.locator('text=徽章收藏')).toBeVisible()
    })
  })

  // --- Phase 4: Auth guard ---
  test.describe('Auth guard', () => {
    test('Protected route redirects to login when not authenticated', async ({ page }) => {
      // Navigate to app to get localStorage access
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Clear auth state
      await page.evaluate(() => {
        localStorage.removeItem('ducheng_access_token')
        localStorage.removeItem('ducheng_refresh_token')
        localStorage.removeItem('ducheng_user')
      })

      // Try to access protected route
      await page.goto('/#/explore/jingan-explore/play')
      await page.waitForURL(/\/login/, { timeout: 5000 })
      await expect(page.locator('.login-page')).toBeVisible()
    })
  })
})
