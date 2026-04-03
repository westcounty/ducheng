<template>
  <div class="archive page-padding">
    <template v-if="loading">
      <p class="text-secondary">载入中...</p>
    </template>
    <template v-else>
    <header class="archive-header">
      <div class="stamp stamp--accent animate-stamp">永久封存</div>
      <h1 class="archive-title text-display">任务档案</h1>
      <p class="archive-subtitle text-handwriting text-accent">
        {{ FINALE?.fullMessage ? '「' + FINALE.acrostic?.hiddenMessage + '」' : '' }}
      </p>
    </header>

    <hr class="divider" />

    <!-- 7 entries -->
    <div class="entries">
      <div
        v-for="pair in PHOTO_DIARY_PAIRS"
        :key="pair.stage"
        class="entry animate-fade-in"
      >
        <!-- Entry header -->
        <div class="entry-header">
          <span class="entry-num text-accent">第 {{ pair.stage }} 站</span>
          <span class="entry-location">{{ STAGE_LOCATIONS[pair.stage - 1] }}</span>
        </div>

        <!-- Photo -->
        <div class="entry-photo-area">
          <div v-if="photos[pair.stage]" class="photo-frame">
            <img
              :src="photos[pair.stage]"
              :alt="`第${pair.stage}站存档`"
              class="entry-photo"
            />
          </div>
          <div v-else class="photo-empty">
            <span class="text-secondary">未留影像</span>
          </div>
        </div>

        <!-- Diary excerpt (collapsible) -->
        <div class="diary-excerpt-block">
          <button
            class="excerpt-toggle text-accent"
            @click="toggleExcerpt(pair.stage)"
          >
            {{ openExcerpts[pair.stage] ? '收起' : '展开日记' }}
          </button>
          <transition name="excerpt-slide">
            <p v-if="openExcerpts[pair.stage]" class="excerpt-text text-handwriting">
              {{ pair.diaryExcerpt }}
            </p>
          </transition>
        </div>

        <!-- Wish text (checklist item) -->
        <div class="entry-wish">
          <span class="wish-label text-accent">心愿存档</span>
          <p class="wish-text"><s>{{ formatChecklistItem(HEYING_CHECKLIST[pair.stage - 1]) }}</s></p>
        </div>

        <!-- Diary quote -->
        <blockquote class="entry-diary text-handwriting cipher-card">
          {{ pair.diary }}
        </blockquote>

        <hr v-if="pair.stage < 7" class="divider" />
      </div>
    </div>

    <!-- Cross-city Easter egg section -->
    <section v-if="visibleThreads.length > 0" class="cross-city-section">
      <div class="section-divider">
        <span class="divider-text">暗线一瞥</span>
      </div>
      <div class="thread-list">
        <div v-for="thread in visibleThreads" :key="thread.from + thread.to" class="thread-item">
          <blockquote class="thread-quote">
            "{{ thread.quote }}"
          </blockquote>
          <div class="thread-source">——{{ thread.source }}</div>
        </div>
      </div>
      <p v-if="allCitiesCompleted" class="reveal-link">
        四座城市的主角，都在不经意间提到了另一座城。
        <router-link :to="'/cross-city-reveal'">→ 查看完整暗线</router-link>
      </p>
    </section>

    <!-- Badges & Share -->
    <section class="badge-share-section">
      <BadgeDisplay title="城市徽章" :show-ultimate="true" />
      <div style="display: flex; justify-content: center; padding: var(--spacing-md) 0;">
        <button class="btn-secondary" @click="showShareCard = true">
          生成分享卡片
        </button>
      </div>
      <ShareCard
        :visible="showShareCard"
        :city-id="cityId"
        :duration="timing ? timing.total : ''"
        :photos-count="Object.keys(photos).length"
        @close="showShareCard = false"
      />
    </section>

    <hr class="divider" />

    <!-- Footer -->
    <footer class="archive-footer cipher-card cipher-card--accent">
      <p class="footer-acrostic text-handwriting">
        每一篇日记的第一个字，串成了那句话：
      </p>
      <p class="footer-phrase text-handwriting text-accent">
        「{{ FINALE?.acrostic?.hiddenMessage || '' }}」
      </p>

      <!-- Timing section -->
      <template v-if="timing">
        <hr class="divider" />
        <p class="footer-timing text-secondary">
          总用时：{{ timing.total }}
        </p>
        <p class="footer-stage-times text-secondary">
          <span v-for="(t, i) in timing.stages" :key="i" class="stage-time-chip">
            第{{ i + 1 }}站 {{ t }}
          </span>
        </p>
      </template>

      <hr class="divider" />
      <p class="footer-date text-secondary">
        档案封存日期：{{ today }}
      </p>
    </footer>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCityData } from '../data/cities/useCityData.js'
import { getPhoto } from '../utils/photo-store.js'
import { useGameStore } from '../stores/game.js'
import { usePlatformStore } from '../stores/platform.js'
import { getVisibleThreads } from '../data/cross-city-threads.js'
import BadgeDisplay from '../components/BadgeDisplay.vue'
import ShareCard from '../components/ShareCard.vue'

const props = defineProps({ cityId: { type: String, required: true } })

const photos = ref({})
const openExcerpts = reactive({})
const game = useGameStore(props.cityId)
const platformStore = usePlatformStore()
const { cityData, loading } = useCityData(computed(() => props.cityId))

const PHOTO_DIARY_PAIRS = computed(() => cityData.value?.photoDiaryPairs ?? [])
const HEYING_CHECKLIST = computed(() => cityData.value?.heyingChecklist ?? [])
const STAGE_LOCATIONS = computed(() => cityData.value?.stageLocations ?? [])
const FINALE = computed(() => cityData.value?.finale ?? {})
const showShareCard = ref(false)

/** Format checklist item that can be string, object with dish/note, or object with name/role */
function formatChecklistItem(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  if (item.name && item.role) return `${item.name}，${item.role}`
  if (item.dish) return item.note || item.dish
  return item.detail || item.name || ''
}

const visibleThreads = computed(() =>
  getVisibleThreads(platformStore.completedCities, props.cityId)
)
const allCitiesCompleted = computed(() => platformStore.allCitiesCompleted)

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

function toggleExcerpt(stageId) {
  openExcerpts[stageId] = !openExcerpts[stageId]
}

/** Format milliseconds as "X小时Y分" or "Y分" */
function formatMs(ms) {
  if (!ms || ms < 0) return null
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}小时${m}分`
  return `${m}分`
}

/** Compute timing info from game store. Returns null if data is insufficient. */
const timing = computed(() => {
  const { startTime, stageStartTimes, stageClearTimes } = game

  // Need at least startTime and the last stage clear time
  if (!startTime) return null

  // Find the last clear time across stages 1-7
  let lastClear = null
  for (let i = 1; i <= 7; i++) {
    const t = stageClearTimes[i]
    if (t && (!lastClear || t > lastClear)) lastClear = t
  }
  if (!lastClear) return null

  const totalMs = new Date(lastClear) - new Date(startTime)
  const totalStr = formatMs(totalMs)
  if (!totalStr) return null

  // Per-stage times (only include stages where both start and clear are known)
  const stages = []
  for (let i = 1; i <= 7; i++) {
    const s = stageStartTimes[i]
    const c = stageClearTimes[i]
    if (s && c) {
      stages.push(formatMs(new Date(c) - new Date(s)) ?? '—')
    } else {
      stages.push(null)
    }
  }

  // Only show per-stage row if we have at least some data
  const hasStageData = stages.some(Boolean)

  return {
    total: totalStr,
    stages: hasStageData ? stages.map((t) => t ?? '—') : []
  }
})

onMounted(async () => {
  for (const pair of PHOTO_DIARY_PAIRS.value) {
    try {
      const blob = await getPhoto(props.cityId, pair.stage)
      if (blob) {
        photos.value[pair.stage] = URL.createObjectURL(blob)
      }
    } catch (err) {
      console.warn(`No photo for stage ${pair.stage}`)
    }
  }
})
</script>

<style scoped>
.archive {
  min-height: 100vh;
}

.archive-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.archive-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.1em;
  margin: var(--spacing-md) 0 var(--spacing-sm);
}

.archive-subtitle {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--accent);
}

/* ── Entries ── */
.entries {
  padding: var(--spacing-md) 0;
}

.entry {
  padding: var(--spacing-md) 0;
}

.entry-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.entry-num {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.entry-location {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.entry-photo-area {
  margin-bottom: var(--spacing-md);
}

.photo-frame {
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.entry-photo {
  width: 100%;
  display: block;
  max-height: 240px;
  object-fit: cover;
}

.photo-empty {
  height: 120px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

/* ── Diary excerpt ── */
.diary-excerpt-block {
  margin-bottom: var(--spacing-md);
}

.excerpt-toggle {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.excerpt-text {
  margin: var(--spacing-sm) 0 0;
  font-size: 0.9rem;
  line-height: 1.9;
  color: var(--text-secondary);
  border-left: 2px solid var(--border);
  padding-left: var(--spacing-md);
}

.excerpt-slide-enter-active,
.excerpt-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.excerpt-slide-enter-from,
.excerpt-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ── Wish ── */
.entry-wish {
  margin-bottom: var(--spacing-md);
}

.wish-label {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.wish-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration-color: var(--accent);
  margin: 0;
}

.entry-diary {
  font-size: 0.9rem;
  line-height: 1.9;
  color: var(--text-secondary);
  padding: var(--spacing-md);
  quotes: none;
  margin: 0;
}

/* ── Footer ── */
.archive-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.footer-acrostic {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.8;
}

.footer-phrase {
  font-size: 1.4rem;
  letter-spacing: 0.2em;
  margin-bottom: var(--spacing-md);
}

.footer-timing {
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-xs);
}

.footer-stage-times {
  font-size: 0.8rem;
  line-height: 2;
  letter-spacing: 0.03em;
  margin-bottom: var(--spacing-sm);
}

.stage-time-chip {
  display: inline-block;
  margin: 0 var(--spacing-xs);
}

.stage-time-chip:not(:last-child)::after {
  content: ' ·';
}

.footer-date {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}

/* ── Cross-city Easter egg ── */
.cross-city-section {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.section-divider::before,
.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color, var(--border));
  opacity: 0.5;
}

.divider-text {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: var(--text-secondary);
  white-space: nowrap;
  opacity: 0.7;
}

.thread-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.thread-item {
  border-left: 2px solid var(--border-color, var(--border));
  padding-left: var(--spacing-md);
  opacity: 0.85;
}

.thread-quote {
  font-size: 0.9rem;
  line-height: 1.9;
  color: var(--text-secondary);
  font-style: italic;
  margin: 0 0 var(--spacing-xs);
  quotes: none;
}

.thread-source {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.7;
  letter-spacing: 0.05em;
}

.reveal-link {
  margin-top: var(--spacing-lg);
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.reveal-link a {
  color: var(--text-accent, var(--accent));
  text-decoration: none;
  letter-spacing: 0.05em;
}

.reveal-link a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
