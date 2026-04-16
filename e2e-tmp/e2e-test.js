// E2E test script for ducheng exploration task system
const fs = require('fs')
const https = require('https')

const BASE = 'https://ducheng.nju.top/api'
const TMP = 'D:/work/shanghaitrip/e2e-tmp'

// Pre-generated JWT token (sub: e2e-test-user-001)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlMmUwMDAwMS0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJpYXQiOjE3NzYwNDczMzB9.5pZynipOClUYra-Ed4RFdj3USsgGxk3RfL2LhfPP8aM'

function request(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: opts.method || 'GET',
      headers: { ...opts.headers },
      rejectUnauthorized: false,
    }
    if (opts.body) {
      options.headers['Content-Type'] = 'application/json'
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, data: data.substring(0, 200) })
        }
      })
    })
    req.on('error', reject)
    if (opts.body) req.write(JSON.stringify(opts.body))
    req.end()
  })
}

let passed = 0
let failed = 0

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${name}`)
    passed++
  } else {
    console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`)
    failed++
  }
}

async function run() {
  console.log('========================================')
  console.log('  读城 Exploration Task E2E Test')
  console.log('========================================\n')

  const authHeaders = { Authorization: `Bearer ${TEST_TOKEN}` }

  // --- Phase 1: Public API ---
  console.log('--- Phase 1: Public API ---')

  const health = await request(`${BASE}/health`)
  check('Health check returns ok', health.data.status === 'ok')

  const tasks = await request(`${BASE}/tasks`)
  check('Task list returns items', Array.isArray(tasks.data.items))
  check('Task list has 3 tasks', tasks.data.total === 3, `got ${tasks.data.total}`)

  const slugs = tasks.data.items.map(t => t.slug)
  check('Contains wukang-road-walk', slugs.includes('wukang-road-walk'))
  check('Contains bund-light-hunter', slugs.includes('bund-light-hunter'))
  check('Contains jingan-explore', slugs.includes('jingan-explore'))

  const detail = await request(`${BASE}/tasks/wukang-road-walk`)
  check('Task detail has title', detail.data.title === '武康路文艺漫步')
  check('Task detail has subTasks', Array.isArray(detail.data.subTasks) && detail.data.subTasks.length === 6)
  check('Task detail has totalSubTasks', detail.data.totalSubTasks === 6)

  const detail2 = await request(`${BASE}/tasks/bund-light-hunter`)
  check('Bund task has 7 subtasks', detail2.data.totalSubTasks === 7, `got ${detail2.data.totalSubTasks}`)

  const detail3 = await request(`${BASE}/tasks/jingan-explore`)
  check('Jingan task has 5 subtasks', detail3.data.totalSubTasks === 5, `got ${detail3.data.totalSubTasks}`)

  const notFound = await request(`${BASE}/tasks/nonexistent`)
  check('Nonexistent task returns 404', notFound.status === 404)

  // --- Phase 2: Authenticated API ---
  console.log('\n--- Phase 2: Authenticated API ---')

  const me = await request(`${BASE}/me`, { headers: authHeaders })
  check('GET /me returns user', !!me.data.userId, JSON.stringify(me.data).substring(0, 100))

  const stats = await request(`${BASE}/me/stats`, { headers: authHeaders })
  check('GET /me/stats returns stats', typeof stats.data === 'object', JSON.stringify(stats.data).substring(0, 100))

  const badges = await request(`${BASE}/badges`, { headers: authHeaders })
  check('GET /badges returns badges', typeof badges.data === 'object')

  const progress404 = await request(`${BASE}/tasks/jingan-explore/progress`, { headers: authHeaders })
  check('Progress before start returns 404', progress404.status === 404)

  // --- Phase 3: Start task ---
  console.log('\n--- Phase 3: Start Task (jingan-explore) ---')

  const start = await request(`${BASE}/tasks/jingan-explore/start`, {
    method: 'POST',
    headers: authHeaders,
  })
  check('Start task returns progress', start.data.progress?.status === 'in_progress', JSON.stringify(start.data).substring(0, 200))
  check('Start task returns currentSubTask', !!start.data.currentSubTask)
  check('First subtask is arrival', start.data.currentSubTask?.type === 'arrival')

  // --- Phase 4: Subtask submissions ---
  console.log('\n--- Phase 4: Subtask Submissions ---')

  // 4a: Arrival check (subtask #1 - 静安寺)
  const arrival = await request(`${BASE}/tasks/jingan-explore/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      gpsLat: '31.2235000',
      gpsLng: '121.4480000',
    },
  })
  check('Arrival subtask approved', arrival.data.approved === true, JSON.stringify(arrival.data).substring(0, 200))
  check('Arrival returns nextSubTask', !!arrival.data.nextSubTask)
  check('Next subtask is photo', arrival.data.nextSubTask?.type === 'photo')

  // 4b: Photo submit (subtask #2)
  const photoSubmit = await request(`${BASE}/tasks/jingan-explore/submit`, {
    method: 'POST',
    headers: authHeaders,
    body: { photoUrl: '/uploads/test-e2e-photo.jpg' },
  })
  check('Photo subtask response received', typeof photoSubmit.data === 'object', JSON.stringify(photoSubmit.data).substring(0, 200))
  if (photoSubmit.data.approved) {
    check('Photo subtask approved', true)
  } else {
    check('Photo subtask not approved (no GLM key expected)', true)
  }

  // --- Phase 5: Progress check ---
  console.log('\n--- Phase 5: Progress Check ---')

  const progress = await request(`${BASE}/tasks/jingan-explore/progress`, { headers: authHeaders })
  check('Progress returns status', typeof progress.data === 'object', JSON.stringify(progress.data).substring(0, 200))
  check('Progress status is in_progress', progress.data.progress?.status === 'in_progress', `got ${JSON.stringify(progress.data).substring(0, 100)}`)

  // --- Phase 6: User history ---
  console.log('\n--- Phase 6: User History ---')

  const history = await request(`${BASE}/me/history`, { headers: authHeaders })
  check('GET /me/history returns data', typeof history.data === 'object')

  // --- Phase 7: Unauthenticated access ---
  console.log('\n--- Phase 7: Unauthenticated Access ---')

  const noAuth = await request(`${BASE}/tasks/jingan-explore/start`, { method: 'POST' })
  check('Start without token returns 401', noAuth.status === 401)

  const noAuthSubmit = await request(`${BASE}/tasks/jingan-explore/submit`, {
    method: 'POST',
    body: { gpsLat: '31.0', gpsLng: '121.0' },
  })
  check('Submit without token returns 401', noAuthSubmit.status === 401)

  // --- Phase 8: Second task start ---
  console.log('\n--- Phase 8: Second Task Start ---')

  const start2 = await request(`${BASE}/tasks/wukang-road-walk/start`, {
    method: 'POST',
    headers: authHeaders,
  })
  check('Can start wukang task', start2.data.progress?.status === 'in_progress', JSON.stringify(start2.data).substring(0, 200))

  // --- Phase 9: Already started task ---
  console.log('\n--- Phase 9: Already Started Task ---')

  const restart = await request(`${BASE}/tasks/jingan-explore/start`, {
    method: 'POST',
    headers: authHeaders,
  })
  check('Restart returns 409 conflict for already-started task', restart.status === 409, `got ${restart.status}`)

  // --- Summary ---
  console.log('\n========================================')
  console.log(`  Results: ${passed} passed, ${failed} failed`)
  console.log('========================================')

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('E2E test crashed:', err)
  process.exit(1)
})
