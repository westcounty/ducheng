import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { nanoid } from 'nanoid'
import { config } from '../config.js'

let puppeteer = null
let browserInstance = null

/**
 * Lazy-load puppeteer. Returns null if not available.
 */
async function loadPuppeteer() {
  if (puppeteer !== null) return puppeteer
  try {
    puppeteer = await import('puppeteer')
    return puppeteer
  } catch (err) {
    console.warn('Puppeteer not available, poster generation disabled:', err.message)
    puppeteer = false
    return null
  }
}

/**
 * Get or create a shared browser instance.
 */
async function getBrowser() {
  if (browserInstance) {
    try {
      if (browserInstance.connected) return browserInstance
    } catch (_) { /* fall through */ }
    try { await browserInstance.close() } catch (_) {}
    browserInstance = null
  }

  const lib = await loadPuppeteer()
  if (!lib) return null

  browserInstance = await lib.default.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  })
  browserInstance.on('disconnected', () => { browserInstance = null })
  return browserInstance
}

/**
 * Convert a local upload path to a base64 data URL for Puppeteer rendering.
 */
function photoToDataUrl(photoUrl, uploadDir) {
  if (!photoUrl) return null
  if (photoUrl.startsWith('/uploads/')) {
    const filePath = path.join(uploadDir, photoUrl.replace('/uploads/', ''))
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath)
      const ext = path.extname(filePath).slice(1).toLowerCase()
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg'
      return `data:${mime};base64,${buf.toString('base64')}`
    }
  }
  return photoUrl
}

/**
 * Build the poster HTML with inline styles (no external deps needed).
 */
function buildPosterHtml(data) {
  const { taskTitle, city, location, photos, rank, steps, duration, badgeIcon, badgeName, badgeColor } = data

  const durationText = duration
    ? (duration < 60
        ? `${duration}min`
        : `${Math.floor(duration / 60)}h${duration % 60 ? (duration % 60) + 'm' : ''}`)
    : '-'

  let photoHtml = ''
  if (photos && photos.length > 0) {
    const cols = photos.length <= 2 ? 2 : 3
    const items = photos.map(p =>
      `<img src="${p}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;" />`
    ).join('')
    photoHtml = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;margin-bottom:40px;">${items}</div>`
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#222;">
<div style="width:750px;height:1200px;background:linear-gradient(180deg,#1a1a2e 0%,#222 30%,#2a2a2a 100%);font-family:'PingFang SC','Microsoft YaHei','Noto Sans CJK SC','WenQuanYi Micro Hei',sans-serif;color:#e0e0e0;padding:60px 40px;box-sizing:border-box;display:flex;flex-direction:column;">

  <div style="font-size:40px;font-weight:700;color:#fff;margin-bottom:12px;line-height:1.3;">${escapeHtml(taskTitle)}</div>
  <div style="font-size:20px;color:#999;margin-bottom:36px;">${escapeHtml(city)}${location ? ' · ' + escapeHtml(location) : ''}</div>

  ${photoHtml}

  <div style="display:flex;justify-content:space-around;padding:28px 0;border-top:1px solid #333;border-bottom:1px solid #333;margin-bottom:28px;">
    <div style="text-align:center;flex:1;">
      <div style="font-size:34px;font-weight:700;color:#c9a96e;">${rank || '-'}</div>
      <div style="font-size:13px;color:#888;margin-top:4px;">完成排名</div>
    </div>
    <div style="text-align:center;flex:1;">
      <div style="font-size:34px;font-weight:700;color:#c9a96e;">${steps || '-'}</div>
      <div style="font-size:13px;color:#888;margin-top:4px;">任务步骤</div>
    </div>
    <div style="text-align:center;flex:1;">
      <div style="font-size:34px;font-weight:700;color:#c9a96e;">${escapeHtml(durationText)}</div>
      <div style="font-size:13px;color:#888;margin-top:4px;">用时</div>
    </div>
  </div>

  ${badgeName ? `<div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:18px;background:rgba(201,169,110,0.1);border:1px solid rgba(201,169,110,0.2);border-radius:12px;margin-bottom:20px;">
    <span style="font-size:28px;">${escapeHtml(badgeIcon || '&#x1F3C6;')}</span>
    <span style="font-size:20px;color:#c9a96e;font-weight:600;">${escapeHtml(badgeName)}</span>
  </div>` : ''}

  <div style="margin-top:auto;text-align:center;font-size:13px;color:#555;padding-top:20px;">读城 · 探索任务</div>
</div>
</body>
</html>`
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Generate a poster PNG image from task completion data.
 * Returns the public URL path to the generated image, or null if generation fails.
 */
export async function generatePoster(data) {
  const uploadDir = path.resolve(config.uploadDir)
  const posterDir = path.join(uploadDir, 'posters')
  if (!fs.existsSync(posterDir)) {
    fs.mkdirSync(posterDir, { recursive: true })
  }

  // Convert local photo paths to data URLs
  const photosWithData = (data.photos || [])
    .map(p => photoToDataUrl(p, uploadDir))
    .filter(Boolean)

  const html = buildPosterHtml({
    ...data,
    photos: photosWithData,
  })

  const filename = `poster-${nanoid(10)}.png`
  const filePath = path.join(posterDir, filename)

  let page = null
  try {
    const browser = await getBrowser()
    if (!browser) {
      console.warn('Puppeteer unavailable, skipping poster image generation')
      return null
    }

    page = await browser.newPage()
    await page.setViewport({ width: 750, height: 1200, deviceScaleFactor: 2 })
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 })
    await page.screenshot({
      path: filePath,
      type: 'png',
      clip: { x: 0, y: 0, width: 750, height: 1200 },
    })
    await page.close()
    page = null

    console.log(`Poster generated: ${filename}`)
    return `/uploads/posters/${filename}`
  } catch (err) {
    console.error('Poster generation failed:', err.message)
    if (page) { try { await page.close() } catch (_) {} }
    // Reset browser on error
    if (browserInstance) {
      try { await browserInstance.close() } catch (_) {}
      browserInstance = null
    }
    return null
  }
}

/**
 * Clean up the browser instance on process exit.
 */
export async function closeBrowser() {
  if (browserInstance) {
    try { await browserInstance.close() } catch (_) {}
    browserInstance = null
  }
}
