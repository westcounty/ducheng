const { test, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

const REAL_USER = 'westcounty'
const REAL_PASS = 'charfield123'
const SLUG = 'wukang-road-walk'

async function injectAuth(page) {
  const result = await page.evaluate(async ({ user, pass }) => {
    const body = { username: user, password: pass, deviceFingerprint: 'e2e-full-flow', deviceName: 'Playwright', appId: 'ducheng-web' }
    let resp = await fetch('https://admin.nju.top/v1/auth/password/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (!resp.ok) {
      resp = await fetch('https://admin.nju.top/v1/auth/password/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    }
    if (!resp.ok) return { error: `Auth failed: ${resp.status}` }
    return await resp.json()
  }, { user: REAL_USER, pass: REAL_PASS })
  if (result.error) throw new Error(result.error)
  const payload = JSON.parse(Buffer.from(result.accessToken.split('.')[1], 'base64').toString())
  const user = { userId: payload.sub, username: REAL_USER, nickname: REAL_USER }
  await page.evaluate(({ t, r, u }) => {
    localStorage.setItem('ducheng_access_token', t)
    localStorage.setItem('ducheng_refresh_token', r)
    localStorage.setItem('ducheng_user', u)
  }, { t: result.accessToken, r: result.refreshToken, u: JSON.stringify(user) })
}

async function mockGeolocation(page, lat, lng) {
  await page.evaluate(({ lat, lng }) => {
    navigator.geolocation.getCurrentPosition = function (cb) {
      cb({ coords: { latitude: lat, longitude: lng, accuracy: 10 } })
    }
  }, { lat, lng })
}

function createTestImage() {
  const tmpDir = path.join(__dirname, '..', 'test-data')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  const filePath = path.join(tmpDir, 'test-photo.png')
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64'
    ))
  }
  return filePath
}

async function apiSubmit(page, slug, body) {
  return page.evaluate(async ({ slug, body }) => {
    const token = localStorage.getItem('ducheng_access_token')
    const r = await fetch(`/api/tasks/${slug}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return r.json()
  }, { slug, body })
}

// ─── Test ───────────────────────────────────────────────────────────────────

test('Complete wukang-road-walk: arrival→photo→photo→puzzle→arrival→photo', async ({ page }) => {
  test.setTimeout(300000)

  // Auth
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await injectAuth(page)
  await page.reload()
  await page.waitForLoadState('networkidle')
  console.log('0. Auth OK')

  // Start task
  await page.goto(`/#/explore/${SLUG}`)
  await page.waitForResponse(r => r.url().includes(`/api/tasks/${SLUG}`) && r.status() === 200)
  await page.waitForSelector('.task-hero', { timeout: 10000 })

  const cta = page.locator('.cta-btn--primary, .cta-btn--continue').first()
  await cta.click()
  await page.waitForURL(/\/play/, { timeout: 10000 })
  await page.waitForSelector('.play-header', { timeout: 10000 })
  console.log('1. On play page')

  // Get current progress
  let progress = await page.evaluate(async (slug) => {
    const token = localStorage.getItem('ducheng_access_token')
    const r = await fetch(`/api/tasks/${slug}/progress`, { headers: { Authorization: `Bearer ${token}` } })
    return r.json()
  }, SLUG)

  if (progress.progress?.status === 'completed') {
    console.log('Already completed!')
    expect(progress.progress.status).toBe('completed')
    return
  }

  const total = progress.totalSubTasks || 6
  let idx = progress.progress?.currentSubTaskIndex || 1
  console.log(`2. Progress: step ${idx}/${total}`)

  const testImage = createTestImage()

  // Wukang arrival targets: step1 (31.2064, 121.4384), step5 (31.2078, 121.442)
  // Mock GPS near 武康大楼 for step 1, near 安福路 for step 5
  const ARRIVAL_GPS = {
    1: { lat: 31.2065, lng: 121.4385 },  // 武康大楼
    5: { lat: 31.2080, lng: 121.4421 },  // 安福路
  }

  while (idx <= total) {
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.play-header', { timeout: 10000 })
    await page.waitForTimeout(800)

    const completed = await page.evaluate(() =>
      !!document.querySelector('.submit-feedback--success')?.textContent?.includes('探索完成')
    )
    if (completed) { console.log('  Task completed!'); break }

    const type = await page.evaluate(() => {
      if (document.querySelector('.arrival-check')) return 'arrival'
      if (document.querySelector('.photo-submit')) return 'photo'
      if (document.querySelector('.quiz-input')) return 'quiz'
      if (document.querySelector('.puzzle-input')) return 'puzzle'
      return 'unknown'
    })
    console.log(`  Step ${idx}/${total}: type=${type}`)

    if (type === 'arrival') {
      const gps = ARRIVAL_GPS[idx] || { lat: 31.207, lng: 121.440 }
      await mockGeolocation(page, gps.lat, gps.lng)
      await page.waitForSelector('.arrival-check .cta-btn--primary', { timeout: 5000 })
      const resp = page.waitForResponse(r => r.url().includes('/submit'))
      await page.locator('.arrival-check .cta-btn--primary').click()
      const data = await (await resp).json()
      console.log(`    Arrival: approved=${data.approved} reason=${data.reason || '-'}`)
      expect(data.approved).toBe(true)
      await page.waitForTimeout(2000)
      idx++

    } else if (type === 'photo') {
      const fileInput = page.locator('.photo-submit input[type="file"]')
      await fileInput.setInputFiles(testImage)
      await page.waitForTimeout(3000)
      const submitBtn = page.locator('.photo-submit .cta-btn--primary')
      const btnVisible = await submitBtn.isVisible().catch(() => false)
      if (btnVisible) {
        const resp = page.waitForResponse(r => r.url().includes('/submit'))
        await submitBtn.click()
        const data = await (await resp).json()
        console.log(`    Photo UI: approved=${data.approved}`)
        await page.waitForTimeout(2000)
        if (data.approved) { idx++; continue }
      }
      // Fallback: API submit
      const result = await apiSubmit(page, SLUG, { photoUrl: '/uploads/test-e2e-photo.png' })
      console.log(`    Photo API: approved=${result.approved}`)
      expect(result.approved).toBe(true)
      await page.waitForTimeout(2000)
      idx++

    } else if (type === 'puzzle') {
      // ── Key test: puzzle text matching via UI ──
      // wukang #4: answer="老麦咖啡", variants=["老麦","Old Mai"]
      // Test 1: Wrong answer via UI
      const input = page.locator('.puzzle-input__field')
      await expect(input).toBeVisible({ timeout: 5000 })
      await input.fill('错误答案')
      const resp1 = page.waitForResponse(r => r.url().includes('/submit'))
      await page.locator('.puzzle-input__submit').click()
      const data1 = await (await resp1).json()
      console.log(`    Puzzle wrong answer: approved=${data1.approved} reason=${data1.reason}`)
      expect(data1.approved).toBe(false)

      // Wait for retry (UI clears feedback after 2500ms)
      await page.waitForTimeout(3000)

      // Test 2: Variant match via UI ("老麦")
      const input2 = page.locator('.puzzle-input__field')
      await expect(input2).toBeVisible({ timeout: 3000 })
      await input2.fill('老麦')
      const resp2 = page.waitForResponse(r => r.url().includes('/submit'))
      await page.locator('.puzzle-input__submit').click()
      const data2 = await (await resp2).json()
      console.log(`    Puzzle variant "老麦": approved=${data2.approved} reason=${data2.reason}`)
      expect(data2.approved).toBe(true)
      await page.waitForTimeout(2000)
      idx++

    } else if (type === 'quiz') {
      // Not expected in wukang, but handle just in case
      await page.locator('.quiz-option').first().click()
      await page.waitForTimeout(300)
      const confirmBtn = page.locator('.quiz-input .cta-btn--primary')
      if (await confirmBtn.isVisible().catch(() => false)) {
        const resp = page.waitForResponse(r => r.url().includes('/submit'))
        await confirmBtn.click()
        const data = await (await resp).json()
        console.log(`    Quiz: approved=${data.approved}`)
        await page.waitForTimeout(2000)
        idx++
      }
    } else {
      console.log(`    Unknown type: ${type}`)
      const r = await apiSubmit(page, SLUG, { skip: true })
      if (r.approved || r.taskCompleted) idx++
      await page.waitForTimeout(2000)
    }
  }

  // Verify completion
  const final = await page.evaluate(async (slug) => {
    const token = localStorage.getItem('ducheng_access_token')
    const r = await fetch(`/api/tasks/${slug}/progress`, { headers: { Authorization: `Bearer ${token}` } })
    return r.json()
  }, SLUG)
  console.log(`Final: ${final.progress?.status}`)
  expect(final.progress?.status).toBe('completed')
})
