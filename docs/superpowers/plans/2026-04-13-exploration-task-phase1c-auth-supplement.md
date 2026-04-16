# Exploration Task System — Phase 1C Auth Supplement: Login Flow

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete user authentication to the 读城 exploration module — login page (password + SMS), auth Pinia store, token management, and router guard integration. Reuses PhotoZen/tuchan-api account system, matching the nannaricher implementation pattern.

**Architecture:** Auth API calls go to tuchan-api at `https://admin.nju.top/v1/auth/*`. JWT tokens (access + refresh) are stored in localStorage. The auth store manages login/register/SMS/refresh/logout. A Login.vue page provides the UI. The existing `explore-api.js` reads the access token for all API calls. Router guard redirects unauthenticated users to the login page.

**Tech Stack:** Vue 3 Composition API, Pinia, Vue Router, fetch API. No new dependencies.

**Pre-requisites:** Phase 1C Tasks 1-3 completed (explore-api.js, explore store, explore CSS exist). The tuchan-api auth endpoints must be accessible.

**Reference implementation:** `D:\work\nannaricher\client\src\stores\authStore.ts` (Zustand → Pinia port), `D:\work\nannaricher\client\src\components\AuthScreen.tsx` (React → Vue port).

---

## File Structure

```
app/src/
├── stores/
│   └── auth.js                    # NEW — auth Pinia store (login, register, SMS, refresh, logout)
├── pages/
│   └── Login.vue                  # NEW — login/register page (password + SMS tabs)
├── services/
│   └── explore-api.js             # MODIFY — import getAccessToken from auth store instead of own TOKEN_KEY
└── router.js                      # MODIFY — add /login route, update auth guard to use auth store
```

---

### Task 1: Auth Pinia Store

**Files:**
- Create: `app/src/stores/auth.js`

- [ ] **Step 1: Create the auth store**

Create `app/src/stores/auth.js`:

```javascript
// app/src/stores/auth.js
// Authentication store — reuses tuchan-api (PhotoZen) account system.
// Ported from nannaricher's authStore.ts (Zustand → Pinia).

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const AUTH_API = 'https://admin.nju.top'
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
```

- [ ] **Step 2: Commit**

```bash
git add app/src/stores/auth.js
git commit -m "feat(explore): auth Pinia store with tuchan-api login/register/SMS/refresh"
```

---

### Task 2: Update explore-api.js to Use Auth Store

**Files:**
- Modify: `app/src/services/explore-api.js`

The existing `explore-api.js` manages its own `TOKEN_KEY`. Replace this with reading from the auth store.

- [ ] **Step 1: Replace token management in explore-api.js**

Replace the token management section at the top of `app/src/services/explore-api.js`:

**Remove** (lines ~93-108 in 1C plan):
```javascript
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
```

**Replace with:**
```javascript
import { useAuthStore } from '../stores/auth.js'

function getToken() {
  const auth = useAuthStore()
  return auth.accessToken
}

export function isLoggedIn() {
  const auth = useAuthStore()
  return auth.isAuthenticated
}
```

The `request()` function that reads `getToken()` continues to work unchanged — it now reads from the auth store instead of a separate localStorage key.

- [ ] **Step 2: Add token refresh on 401**

In the `request()` function, after the `res` is fetched, add automatic token refresh on 401:

Find this section in the `request()` function:
```javascript
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || err.message || `Request failed (${res.status})`)
  }
```

Replace with:
```javascript
  if (res.status === 401) {
    // Try to refresh the token
    const auth = useAuthStore()
    const refreshed = await auth.refreshAccessToken()
    if (refreshed) {
      // Retry the request with the new token
      headers['Authorization'] = `Bearer ${auth.accessToken}`
      const retryRes = await fetch(`/api${path}`, { ...options, headers })
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: `HTTP ${retryRes.status}` }))
        throw new Error(err.error || err.message || `Request failed (${retryRes.status})`)
      }
      return retryRes.json()
    }
    // Refresh failed — force logout and redirect to login
    auth.logout()
    window.location.hash = '#/login'
    throw new Error('登录已过期，请重新登录')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || err.message || `Request failed (${res.status})`)
  }
```

- [ ] **Step 3: Commit**

```bash
git add app/src/services/explore-api.js
git commit -m "feat(explore): wire explore-api.js to auth store with auto token refresh"
```

---

### Task 3: Login Page

**Files:**
- Create: `app/src/pages/Login.vue`

- [ ] **Step 1: Create the login page**

Create `app/src/pages/Login.vue`:

```vue
<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Tabs: 'password' or 'sms'
const tab = ref('password')
// Mode: 'login' or 'register' (password tab only)
const mode = ref('login')

// Password form
const username = ref('')
const password = ref('')
const confirmPwd = ref('')

// SMS form
const phone = ref('')
const code = ref('')
const smsToken = ref(null)
const countdown = ref(0)
let countdownTimer = null

// Refs for autofocus
const usernameRef = ref(null)
const phoneRef = ref(null)
const codeRef = ref(null)

const redirectTo = computed(() => route.query.redirect || '/explore')

// Clear error when switching tabs/modes
watch([tab, mode], () => {
  auth.setError(null)
})

onMounted(() => {
  if (auth.isAuthenticated) {
    router.replace(redirectTo.value)
  }
})

// --- Password handlers ---
async function handlePasswordSubmit() {
  if (!username.value.trim() || !password.value) return

  if (mode.value === 'register') {
    if (password.value !== confirmPwd.value) {
      auth.setError('两次输入的密码不一致')
      return
    }
    if (password.value.length < 8) {
      auth.setError('密码长度至少8位')
      return
    }
  }

  try {
    if (mode.value === 'login') {
      await auth.login(username.value.trim(), password.value)
    } else {
      await auth.register(username.value.trim(), password.value)
    }
    router.replace(redirectTo.value)
  } catch { /* error is set in store */ }
}

// --- SMS handlers ---
async function handleSendCode() {
  if (!phone.value.trim() || phone.value.trim().length < 11 || countdown.value > 0) return
  try {
    smsToken.value = await auth.sendSmsCode(phone.value.trim())
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(countdownTimer)
    }, 1000)
    await nextTick()
    codeRef.value?.focus()
  } catch { /* error is set in store */ }
}

async function handleSmsSubmit() {
  if (!phone.value.trim() || !code.value.trim() || !smsToken.value) return
  try {
    await auth.loginWithSms(phone.value.trim(), code.value.trim(), smsToken.value)
    router.replace(redirectTo.value)
  } catch { /* error is set in store */ }
}

function switchTab(newTab) {
  tab.value = newTab
  mode.value = 'login'
}
</script>

<template>
  <div class="login-page">
    <div class="login-header">
      <div class="login-logo">🧭</div>
      <h1 class="login-title">读 城</h1>
      <p class="login-subtitle">实景探索任务平台</p>
    </div>

    <div class="login-card">
      <!-- Tab switcher -->
      <div class="login-tabs">
        <button
          :class="['login-tab', { active: tab === 'password' }]"
          @click="switchTab('password')"
        >
          账号登录
        </button>
        <button
          :class="['login-tab', { active: tab === 'sms' }]"
          @click="switchTab('sms')"
        >
          短信登录
        </button>
        <div
          class="login-tab-indicator"
          :style="{ transform: `translateX(${tab === 'password' ? '0%' : '100%'})` }"
        />
      </div>

      <!-- Password form -->
      <form v-if="tab === 'password'" class="login-form" @submit.prevent="handlePasswordSubmit">
        <div class="login-field">
          <label>用户名</label>
          <input
            ref="usernameRef"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            maxlength="32"
            :disabled="auth.isLoading"
            autocomplete="username"
          />
        </div>

        <div class="login-field">
          <label>密码</label>
          <input
            v-model="password"
            type="password"
            :placeholder="mode === 'register' ? '密码长度至少8位' : '请输入密码'"
            :disabled="auth.isLoading"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          />
          <span v-if="mode === 'register' && password.length > 0 && password.length < 8" class="login-hint login-hint--warn">
            还需 {{ 8 - password.length }} 个字符
          </span>
          <span v-if="mode === 'register' && password.length >= 8" class="login-hint login-hint--ok">
            密码长度符合要求
          </span>
        </div>

        <div v-if="mode === 'register'" class="login-field">
          <label>确认密码</label>
          <input
            v-model="confirmPwd"
            type="password"
            placeholder="再次输入密码"
            :disabled="auth.isLoading"
            autocomplete="new-password"
          />
        </div>

        <div v-if="auth.error" class="login-error">{{ auth.error }}</div>

        <button
          type="submit"
          class="login-submit"
          :disabled="auth.isLoading || !username.trim() || !password"
        >
          <span v-if="auth.isLoading" class="login-spinner" />
          <span v-else>{{ mode === 'login' ? '登录' : '注册' }}</span>
        </button>

        <button type="button" class="login-toggle" @click="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? '没有账号？注册一个' : '已有账号？去登录' }}
        </button>
      </form>

      <!-- SMS form -->
      <form v-else class="login-form" @submit.prevent="handleSmsSubmit">
        <div class="login-field">
          <label>手机号</label>
          <div class="login-phone-row">
            <input
              ref="phoneRef"
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
              :disabled="auth.isLoading"
              autocomplete="tel"
            />
            <button
              type="button"
              class="login-send-code"
              :disabled="!phone.trim() || phone.trim().length < 11 || countdown > 0 || auth.isLoading"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div class="login-field">
          <label>验证码</label>
          <input
            ref="codeRef"
            v-model="code"
            type="text"
            inputmode="numeric"
            placeholder="请输入6位验证码"
            maxlength="6"
            :disabled="auth.isLoading"
            autocomplete="one-time-code"
            @input="code = code.replace(/\D/g, '')"
          />
        </div>

        <div v-if="auth.error" class="login-error">{{ auth.error }}</div>

        <button
          type="submit"
          class="login-submit"
          :disabled="auth.isLoading || !phone.trim() || !code.trim() || !smsToken"
        >
          <span v-if="auth.isLoading" class="login-spinner" />
          <span v-else>登录</span>
        </button>
      </form>
    </div>

    <p class="login-footer">账号与图禅 PhotoZen 通用</p>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background: var(--color-bg, #0d0d1a);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 56px;
  margin-bottom: 8px;
}

.login-title {
  color: var(--color-text, #eee);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 8px;
  margin: 0 0 4px;
}

.login-subtitle {
  color: var(--color-text-secondary, #888);
  font-size: 14px;
  margin: 0;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: var(--color-surface, #1a1a2e);
  border-radius: 16px;
  padding: 24px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-tabs {
  display: flex;
  position: relative;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.login-tab {
  flex: 1;
  padding: 10px 0;
  background: none;
  border: none;
  color: var(--color-text-secondary, #888);
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s;
}

.login-tab.active {
  color: var(--color-text, #eee);
}

.login-tab-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50%;
  height: 2px;
  background: var(--color-accent, #e0c97f);
  transition: transform 0.3s ease;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.login-field {
  margin-bottom: 18px;
}

.login-field label {
  display: block;
  color: var(--color-text-secondary, #aaa);
  font-size: 13px;
  margin-bottom: 6px;
}

.login-field input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--color-text, #eee);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.login-field input:focus {
  border-color: var(--color-accent, #e0c97f);
}

.login-field input:disabled {
  opacity: 0.5;
}

.login-hint {
  display: block;
  font-size: 12px;
  margin-top: 4px;
}

.login-hint--warn {
  color: #e57373;
}

.login-hint--ok {
  color: #81c784;
}

.login-phone-row {
  display: flex;
  gap: 8px;
}

.login-phone-row input {
  flex: 1;
}

.login-send-code {
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: var(--color-accent, #e0c97f);
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-send-code:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.login-error {
  color: #e57373;
  font-size: 13px;
  margin-bottom: 14px;
  padding: 8px 12px;
  background: rgba(229, 115, 115, 0.1);
  border-radius: 8px;
}

.login-submit {
  padding: 14px;
  background: linear-gradient(135deg, var(--color-accent, #e0c97f), #c9a84c);
  color: #1a1a2e;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-bottom: 12px;
}

.login-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-submit:active:not(:disabled) {
  opacity: 0.85;
}

.login-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(26, 26, 46, 0.3);
  border-top-color: #1a1a2e;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-toggle {
  background: none;
  border: none;
  color: var(--color-accent, #e0c97f);
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
}

.login-toggle:hover {
  opacity: 1;
}

.login-footer {
  color: var(--color-text-secondary, #666);
  font-size: 12px;
  margin-top: 20px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/pages/Login.vue
git commit -m "feat(explore): login page with password and SMS tabs"
```

---

### Task 4: Router Integration

**Files:**
- Modify: `app/src/router.js`

- [ ] **Step 1: Add login route and update auth guard**

In `app/src/router.js`, add the Login import and route:

Add to imports:
```javascript
import Login from './pages/Login.vue'
```

Add to routes array (before the explore routes):
```javascript
{
  path: '/login',
  name: 'Login',
  component: Login,
  meta: { title: '登录 — 读城' },
},
```

Update the auth guard for explore routes. Replace the existing `requiresAuth` guard logic:

**From** (1C plan's guard that just shows a prompt):
```javascript
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { path: '/explore', query: { login: '1' } }
  }
})
```

**To** (redirect to login page with return URL):
```javascript
import { useAuthStore } from './stores/auth.js'

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add app/src/router.js
git commit -m "feat(explore): add login route and auth guard redirect"
```

---

### Task 5: Remove Login Prompt from TaskList

**Files:**
- Modify: `app/src/pages/TaskList.vue`

- [ ] **Step 1: Replace inline login prompt with navigation**

In `app/src/pages/TaskList.vue`, the 1C plan had a `showLoginPrompt` banner. Replace it with a proper login button that navigates to the login page.

Remove the `showLoginPrompt` computed and the `auth-prompt` div. Instead, add a login/user status in the page header:

In the `<script setup>`, add:
```javascript
import { useAuthStore } from '../stores/auth.js'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function goLogin() {
  router.push({ path: '/login', query: { redirect: '/explore' } })
}
```

In the `<template>`, add a user status bar at the top of the page (before the task list):
```html
<div class="explore-user-bar">
  <template v-if="auth.isAuthenticated">
    <span class="explore-user-name">{{ auth.displayName }}</span>
    <button class="explore-logout" @click="auth.logout()">退出</button>
  </template>
  <button v-else class="explore-login-btn" @click="goLogin">
    登录 / 注册
  </button>
</div>
```

Add styles:
```css
.explore-user-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.explore-user-name {
  color: var(--color-text-secondary, #aaa);
  font-size: 13px;
}

.explore-logout {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--color-text-secondary, #aaa);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  cursor: pointer;
}

.explore-login-btn {
  background: linear-gradient(135deg, var(--color-accent, #e0c97f), #c9a84c);
  color: #1a1a2e;
  border: none;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 14px;
  cursor: pointer;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/pages/TaskList.vue
git commit -m "feat(explore): replace login prompt with auth user bar on task list"
```

---

### Task 6: Vite Proxy for Auth API

**Files:**
- Modify: `app/vite.config.js`

- [ ] **Step 1: Add auth API proxy**

The auth store calls `https://admin.nju.top/v1/auth/*` directly (cross-origin), which should work in production since tuchan-api has CORS configured. However, for local development, add a proxy to avoid CORS issues.

In `app/vite.config.js`, the 1C plan already adds a `/api` proxy. Add the auth proxy alongside it:

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3100',
      changeOrigin: true,
    },
    '/auth-api': {
      target: 'https://admin.nju.top',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/auth-api/, ''),
    },
  },
},
```

Then in `app/src/stores/auth.js`, change the AUTH_API to support dev vs production:

```javascript
// In dev mode (Vite), use the proxy; in production, call directly
const AUTH_API = import.meta.env.DEV ? '/auth-api' : 'https://admin.nju.top'
```

- [ ] **Step 2: Commit**

```bash
git add app/vite.config.js app/src/stores/auth.js
git commit -m "feat(explore): add Vite dev proxy for auth API"
```

---

### Task 7: Verify End-to-End Login Flow

- [ ] **Step 1: Start the dev server and verify**

```bash
cd app && npm run dev
```

1. Open `http://localhost:3000/#/explore`
2. Click any task card → should redirect to `/#/login?redirect=/explore/xxx`
3. On login page, verify:
   - Tab switching (账号登录 / 短信登录) works
   - Password login with a valid tuchan-api account works
   - After login, redirects back to the explore page
   - User name shows in top-right corner
   - Clicking 退出 logs out and returns to guest state
4. Refresh the page — should still be logged in (tokens in localStorage)

- [ ] **Step 2: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(explore): complete login flow with tuchan-api integration"
```

---

## Integration Notes

**This auth supplement modifies files from Phase 1C:**

1. `explore-api.js` — token source changes from standalone `TOKEN_KEY` to auth store's `accessToken`
2. `router.js` — auth guard redirects to `/login` instead of showing inline prompt
3. `TaskList.vue` — login prompt replaced with user bar

**The localStorage key for the JWT is now `ducheng_access_token`** (managed by auth store), not `ducheng_explore_token` (from the original 1C plan). All token operations go through the auth store.

**Execution order:** Run this supplement's tasks AFTER Phase 1C Tasks 1-4 (API service, store, CSS, router) and BEFORE Tasks 13+ (pages). Or run all of 1C first, then apply this supplement's modifications.
