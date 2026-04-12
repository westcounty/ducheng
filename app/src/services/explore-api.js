// app/src/services/explore-api.js
// Thin fetch wrapper for all exploration task API endpoints.
// JWT token is read from localStorage (set by tuchan-api login flow).

const TOKEN_KEY = 'ducheng_explore_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

async function request(path, options = {}) {
  const headers = { ...options.headers }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  const res = await fetch(`/api${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    throw new ApiError('请先登录', 401)
  }

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.error || '请求失败', res.status, data)
  }

  return data
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ─── Task endpoints ───────────────────────────────────

export function fetchTasks({ city, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams()
  if (city) params.set('city', city)
  params.set('page', String(page))
  params.set('pageSize', String(pageSize))
  return request(`/tasks?${params}`)
}

export function fetchTaskDetail(slug) {
  return request(`/tasks/${slug}`)
}

// ─── Progress endpoints ───────────────────────────────

export function startTask(slug) {
  return request(`/tasks/${slug}/start`, { method: 'POST' })
}

export function fetchProgress(slug) {
  return request(`/tasks/${slug}/progress`)
}

export function submitSubTask(slug, payload) {
  return request(`/tasks/${slug}/submit`, {
    method: 'POST',
    body: payload,
  })
}

// ─── Upload ───────────────────────────────────────────

export async function uploadPhoto(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request('/upload/photo', {
    method: 'POST',
    body: formData,
  })
}

// ─── Poster ───────────────────────────────────────────

export function fetchPoster(slug) {
  return request(`/tasks/${slug}/poster`)
}

// ─── Badges ───────────────────────────────────────────

export function fetchBadges() {
  return request('/badges')
}

// ─── User ─────────────────────────────────────────────

export function fetchMe() {
  return request('/me')
}

export function fetchMyStats() {
  return request('/me/stats')
}

export function fetchMyHistory() {
  return request('/me/history')
}
