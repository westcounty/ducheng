// app/src/stores/auth.js
// Authentication store — reuses tuchan-api (PhotoZen) account system.
// Ported from nannaricher's authStore.ts (Zustand → Pinia).

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const AUTH_API = import.meta.env.DEV ? '/auth-api' : 'https://admin.nju.top'
const APP_ID = 'ducheng-web'

const STORAGE_KEYS = {
  accessToken: 'ducheng_access_token',
  refreshToken: 'ducheng_refresh_token',
  user: 'ducheng_user',
  deviceFingerprint: 'ducheng_device_fp',
}

function getDeviceFingerprint() {
  let fp = localStorage.getItem(STORAGE_KEYS.deviceFingerprint)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEYS.deviceFingerprint, fp)
  }
  return fp
}

function getDeviceName() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Safari/')) browser = 'Safari'

  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return `读城 Web (${browser}/${os})`
}

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function saveToStorage(accessToken, refreshToken, user) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
  localStorage.removeItem(STORAGE_KEYS.user)
}

async function fetchUserProfile(accessToken) {
  try {
    const res = await fetch(`${AUTH_API}/v1/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (res.ok) {
      const data = await res.json()
      return { nickname: data.nickname, username: data.username, phone: data.phone }
    }
  } catch { /* ignore */ }
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)           // { userId, username?, phone?, nickname? }
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const displayName = computed(() => {
    if (!user.value) return ''
    return user.value.nickname || user.value.username || user.value.phone || ''
  })

  // --- Load from localStorage on init ---
  function loadFromStorage() {
    const savedToken = localStorage.getItem(STORAGE_KEYS.accessToken)
    const savedRefresh = localStorage.getItem(STORAGE_KEYS.refreshToken)
    const savedUser = localStorage.getItem(STORAGE_KEYS.user)
    if (savedToken && savedUser) {
      accessToken.value = savedToken
      refreshToken.value = savedRefresh
      try { user.value = JSON.parse(savedUser) } catch { user.value = null }
    }
  }

  // --- Password login ---
  async function login(username_, password) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${AUTH_API}/v1/auth/password/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username_,
          password,
          deviceFingerprint: getDeviceFingerprint(),
          deviceName: getDeviceName(),
          appId: APP_ID,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `登录失败 (${res.status})`)
      }

      const data = await res.json()
      const payload = decodeJwtPayload(data.accessToken)
      const profile = await fetchUserProfile(data.accessToken)

      const u = {
        userId: payload?.sub,
        username: username_,
        phone: payload?.phone,
        nickname: profile?.nickname || username_,
      }

      saveToStorage(data.accessToken, data.refreshToken, u)
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      user.value = u
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // --- Password register ---
  async function register(username_, password) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${AUTH_API}/v1/auth/password/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username_,
          password,
          deviceFingerprint: getDeviceFingerprint(),
          deviceName: getDeviceName(),
          appId: APP_ID,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `注册失败 (${res.status})`)
      }

      const data = await res.json()
      const payload = decodeJwtPayload(data.accessToken)

      const u = {
        userId: payload?.sub,
        username: username_,
        nickname: username_,
      }

      saveToStorage(data.accessToken, data.refreshToken, u)
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      user.value = u
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // --- SMS: send code ---
  async function sendSmsCode(phone) {
    error.value = null
    try {
      const res = await fetch(`${AUTH_API}/v1/auth/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `发送验证码失败 (${res.status})`)
      }

      const data = await res.json()
      return data.smsToken
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // --- SMS: verify code and login ---
  async function loginWithSms(phone_, code, smsToken_) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${AUTH_API}/v1/auth/sms/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone_,
          code,
          smsToken: smsToken_,
          deviceFingerprint: getDeviceFingerprint(),
          deviceName: getDeviceName(),
          appId: APP_ID,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || err.error || `验证码验证失败 (${res.status})`)
      }

      const data = await res.json()
      const payload = decodeJwtPayload(data.accessToken)
      const profile = await fetchUserProfile(data.accessToken)

      const u = {
        userId: payload?.sub,
        phone: phone_,
        username: profile?.username,
        nickname: profile?.nickname || phone_.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      }

      saveToStorage(data.accessToken, data.refreshToken, u)
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      user.value = u
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // --- Refresh access token ---
  async function refreshAccessToken() {
    if (!refreshToken.value) return false
    try {
      const res = await fetch(`${AUTH_API}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshToken.value,
          deviceFingerprint: getDeviceFingerprint(),
          appId: APP_ID,
        }),
      })

      if (!res.ok) {
        clearStorage()
        user.value = null
        accessToken.value = null
        refreshToken.value = null
        return false
      }

      const data = await res.json()
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      if (user.value) {
        saveToStorage(data.accessToken, data.refreshToken, user.value)
      }
      return true
    } catch {
      return false
    }
  }

  // --- Logout ---
  function logout() {
    if (refreshToken.value) {
      fetch(`${AUTH_API}/v1/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshToken.value }),
      }).catch(() => {})
    }
    clearStorage()
    user.value = null
    accessToken.value = null
    refreshToken.value = null
  }

  function setError(msg) {
    error.value = msg
  }

  // Load on creation
  loadFromStorage()

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    displayName,
    login,
    register,
    sendSmsCode,
    loginWithSms,
    refreshAccessToken,
    logout,
    setError,
    loadFromStorage,
  }
})
