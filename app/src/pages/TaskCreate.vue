<template>
  <div class="explore-page">
    <header class="page-header">
      <button class="back-btn" @click="router.back()">&#x2190;</button>
      <h1 class="page-title">创建探索任务</h1>
    </header>

    <!-- Step indicator -->
    <div class="create-steps">
      <div v-for="s in 3" :key="s" class="create-step" :class="{ active: step >= s, current: step === s }">{{ s }}</div>
    </div>

    <!-- Step 1: Basic info -->
    <div v-if="step === 1" class="create-form">
      <h2 class="create-form__title">基本信息</h2>

      <label class="form-field">
        <span class="form-label">任务标题 *</span>
        <input v-model="form.title" class="form-input" placeholder="如：武康路文艺漫步" maxlength="128" />
      </label>

      <label class="form-field">
        <span class="form-label">任务描述 *</span>
        <textarea v-model="form.description" class="form-input form-textarea" placeholder="描述这个探索任务的特色和亮点..." maxlength="2000" rows="4"></textarea>
      </label>

      <label class="form-field">
        <span class="form-label">城市 *</span>
        <select v-model="form.city" class="form-input">
          <option value="">请选择城市</option>
          <option value="shanghai">上海</option>
          <option value="nanjing">南京</option>
          <option value="hangzhou">杭州</option>
          <option value="xian">西安</option>
          <option value="suzhou">苏州</option>
        </select>
      </label>

      <div class="form-row">
        <label class="form-field">
          <span class="form-label">预估时长(分钟)</span>
          <input v-model.number="form.estimatedMinutes" type="number" class="form-input" placeholder="90" />
        </label>
        <label class="form-field">
          <span class="form-label">难度</span>
          <select v-model="form.difficulty" class="form-input">
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </label>
      </div>

      <label class="form-field">
        <span class="form-label">地点概要</span>
        <input v-model="form.locationSummary" class="form-input" placeholder="如：武康大楼 · 老洋房 · 梧桐路" maxlength="256" />
      </label>

      <button class="cta-btn cta-btn--primary" :disabled="!canProceed1" @click="step = 2">下一步</button>
    </div>

    <!-- Step 2: Sub-tasks -->
    <div v-if="step === 2" class="create-form">
      <h2 class="create-form__title">任务步骤</h2>

      <div v-for="(st, i) in form.subTasks" :key="i" class="subtask-card">
        <div class="subtask-card__header">
          <span class="subtask-card__index">{{ i + 1 }}</span>
          <select v-model="st.type" class="form-input subtask-type">
            <option value="arrival">抵达打卡</option>
            <option value="photo">拍照</option>
            <option value="puzzle">解谜</option>
            <option value="quiz">问答</option>
          </select>
          <button v-if="form.subTasks.length > 1" class="subtask-remove" @click="removeSubTask(i)">&#x2715;</button>
        </div>
        <input v-model="st.title" class="form-input" placeholder="步骤标题" maxlength="128" />
        <textarea v-model="st.instruction" class="form-input form-textarea" placeholder="给玩家的说明..." rows="2"></textarea>

        <!-- Arrival config -->
        <template v-if="st.type === 'arrival'">
          <div class="form-row">
            <input v-model="st.locationLat" class="form-input" placeholder="纬度 (如 31.2064)" />
            <input v-model="st.locationLng" class="form-input" placeholder="经度 (如 121.4384)" />
          </div>
          <input v-model="st.radius" class="form-input" placeholder="允许偏差(米), 默认 200" />
        </template>

        <!-- Puzzle config -->
        <template v-if="st.type === 'puzzle'">
          <input v-model="st.answer" class="form-input" placeholder="正确答案" />
          <input v-model="st.answerVariants" class="form-input" placeholder="可接受变体(逗号分隔)" />
        </template>

        <!-- Quiz config -->
        <template v-if="st.type === 'quiz'">
          <input v-model="st.options" class="form-input" placeholder="选项(逗号分隔, 如: A,B,C,D)" />
          <input v-model.number="st.correctIndex" type="number" class="form-input" placeholder="正确选项序号(0开始)" />
        </template>
      </div>

      <button class="cta-btn cta-btn--secondary" @click="addSubTask">+ 添加步骤</button>

      <div class="form-actions">
        <button class="cta-btn" style="background:#333;color:#aaa;" @click="step = 1">上一步</button>
        <button class="cta-btn cta-btn--primary" :disabled="!canProceed2" @click="step = 3">下一步</button>
      </div>
    </div>

    <!-- Step 3: Badge + submit -->
    <div v-if="step === 3" class="create-form">
      <h2 class="create-form__title">徽章与提交</h2>

      <label class="form-field">
        <span class="form-label">徽章名称</span>
        <input v-model="form.badgeName" class="form-input" placeholder="如：武康漫步者" maxlength="64" />
      </label>

      <div class="form-row">
        <label class="form-field">
          <span class="form-label">徽章图标</span>
          <input v-model="form.badgeIcon" class="form-input" placeholder="emoji (如 🏆)" maxlength="4" />
        </label>
        <label class="form-field">
          <span class="form-label">徽章颜色</span>
          <input v-model="form.badgeColor" type="color" class="form-input form-color" />
        </label>
      </div>

      <!-- Summary -->
      <div class="create-summary">
        <h3 class="create-summary__title">{{ form.title }}</h3>
        <p class="create-summary__text">{{ form.city }} · {{ form.subTasks.length }} 个步骤</p>
        <div class="create-summary__steps">
          <div v-for="(st, i) in form.subTasks" :key="i" class="create-summary__step">
            {{ i + 1 }}. [{{ typeLabel(st.type) }}] {{ st.title }}
          </div>
        </div>
      </div>

      <p v-if="submitError" class="form-error">{{ submitError }}</p>

      <div class="form-actions">
        <button class="cta-btn" style="background:#333;color:#aaa;" @click="step = 2">上一步</button>
        <button class="cta-btn cta-btn--primary" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '提交审核' }}
        </button>
      </div>
    </div>

    <!-- Success -->
    <div v-if="step === 4" class="create-success">
      <div class="create-success__icon">&#x2714;</div>
      <h2 class="create-success__title">任务已提交</h2>
      <p class="create-success__text">你的任务正在等待管理员审核，通过后将在任务列表中展示。</p>
      <button class="cta-btn cta-btn--primary" @click="router.push('/my-tasks')">查看我的任务</button>
      <button class="cta-btn" style="background:#333;color:#aaa;margin-top:8px;" @click="router.push('/explore')">返回任务列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createUserTask } from '../services/explore-api.js'

const router = useRouter()
const step = ref(1)
const submitting = ref(false)
const submitError = ref('')

const form = reactive({
  title: '',
  description: '',
  city: '',
  estimatedMinutes: null,
  difficulty: 'medium',
  locationSummary: '',
  badgeName: '',
  badgeIcon: '🏆',
  badgeColor: '#c9a96e',
  subTasks: [
    { type: 'arrival', title: '', instruction: '', locationLat: '', locationLng: '', radius: '200' },
  ],
})

const canProceed1 = computed(() => form.title && form.description && form.city)
const canProceed2 = computed(() => form.subTasks.every(st => st.title && st.instruction))

function addSubTask() {
  form.subTasks.push({ type: 'photo', title: '', instruction: '' })
}

function removeSubTask(i) {
  form.subTasks.splice(i, 1)
}

function typeLabel(type) {
  return { arrival: '抵达', photo: '拍照', puzzle: '解谜', quiz: '问答' }[type] || type
}

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''

  try {
    const subTasks = form.subTasks.map((st, i) => {
      const stData = {
        orderIndex: i + 1,
        type: st.type,
        title: st.title,
        instruction: st.instruction,
      }
      if (st.type === 'arrival' && st.locationLat) {
        stData.validationConfig = {
          type: 'arrival',
          lat: parseFloat(st.locationLat),
          lng: parseFloat(st.locationLng),
          radius_meters: parseInt(st.radius) || 200,
        }
      } else if (st.type === 'puzzle' && st.answer) {
        stData.validationConfig = {
          type: 'puzzle',
          answer: st.answer,
          answer_variants: st.answerVariants ? st.answerVariants.split(',').map(s => s.trim()) : [],
        }
      } else if (st.type === 'quiz' && st.options) {
        stData.validationConfig = {
          type: 'quiz',
          options: st.options.split(',').map(s => s.trim()),
          correct_index: st.correctIndex || 0,
        }
      } else if (st.type === 'photo') {
        stData.validationConfig = { type: 'photo', prompt: st.instruction, keywords: [] }
      }
      return stData
    })

    await createUserTask({
      title: form.title,
      description: form.description,
      city: form.city,
      estimatedMinutes: form.estimatedMinutes || null,
      difficulty: form.difficulty,
      locationSummary: form.locationSummary || null,
      badgeName: form.badgeName || null,
      badgeIcon: form.badgeIcon || null,
      badgeColor: form.badgeColor || null,
      subTasks,
    })

    step.value = 4
  } catch (err) {
    submitError.value = err.message || '提交失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}
</script>
