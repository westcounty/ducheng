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
      <div class="login-logo">&#x1F9ED;</div>
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
  background: #0d0d1a;
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
  color: #eee;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 8px;
  margin: 0 0 4px;
}

.login-subtitle {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: #1a1a2e;
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
  color: #888;
  font-size: 15px;
  cursor: pointer;
  transition: color 0.2s;
}

.login-tab.active {
  color: #eee;
}

.login-tab-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 50%;
  height: 2px;
  background: #e0c97f;
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
  color: #aaa;
  font-size: 13px;
  margin-bottom: 6px;
}

.login-field input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #eee;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.login-field input:focus {
  border-color: #e0c97f;
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
  color: #e0c97f;
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
  background: linear-gradient(135deg, #e0c97f, #c9a84c);
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
  color: #e0c97f;
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
}

.login-toggle:hover {
  opacity: 1;
}

.login-footer {
  color: #666;
  font-size: 12px;
  margin-top: 20px;
}
</style>
