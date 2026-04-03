<template>
  <div class="finale page-padding">

    <!-- ══════════════════════════════════════════
         PHASE 1 — Acrostic Reveal
    ══════════════════════════════════════════ -->
    <transition name="phase-fade" mode="out-in">
      <div v-if="phase === 1" key="phase1" class="phase phase-1">
        <header class="finale-header">
          <span class="stamp stamp--accent animate-stamp">最终解码</span>
          <h1 class="finale-title">藏在日记里的字</h1>
        </header>

        <hr class="divider" />

        <div class="prompt-block cipher-card" style="margin-bottom: var(--spacing-xl)">
          <NarrativeText
            :text="acrosticPrompt"
            :speed="400"
            @complete="onPromptComplete"
          />
        </div>

        <!-- Acrostic chars, revealed one by one -->
        <transition name="section-fade">
          <div v-if="showAcrostic" class="acrostic-area">
            <div class="acrostic-grid">
              <div
                v-for="(item, index) in ACROSTIC_ITEMS"
                :key="item.stageId"
                class="acrostic-item"
                :class="{ visible: acrosticRevealed > index }"
              >
                <span class="acrostic-char">{{ item.char }}</span>
                <span class="acrostic-stage text-secondary">第{{ item.stageId }}站</span>
              </div>
            </div>

            <transition name="phrase-reveal">
              <div v-if="showPhrase" class="phrase-reveal">
                <p class="phrase-divider text-secondary">合而读之——</p>
                <p class="phrase-text text-handwriting cipher-card cipher-card--accent">
                  「{{ ACROSTIC_PHRASE }}」
                </p>
              </div>
            </transition>

            <transition name="btn-rise">
              <div v-if="showPhrase" class="action-area">
                <button class="btn-primary action-btn" @click="nextPhase">
                  继续
                </button>
              </div>
            </transition>
          </div>
        </transition>
      </div>

      <!-- ══════════════════════════════════════════
           PHASE 2 — Envelope & Letter
      ══════════════════════════════════════════ -->
      <div v-else-if="phase === 2" key="phase2" class="phase phase-2">
        <header class="finale-header">
          <h1 class="finale-title">信封</h1>
        </header>

        <hr class="divider" />

        <div class="envelope-prompt cipher-card" style="margin-bottom: var(--spacing-xl)">
          <NarrativeText
            :text="envelopeIntro"
            :speed="500"
            @complete="onEnvelopeIntroComplete"
          />
        </div>

        <transition name="letter-reveal">
          <div v-if="showLetter" class="letter-container animate-fade-in">
            <div class="cipher-card cipher-card--elevated letter-card">
              <NarrativeText
                :text="LETTER_TEXT"
                :is-handwriting="true"
                :speed="450"
                @complete="onLetterComplete"
              />
            </div>
          </div>
        </transition>

        <transition name="btn-rise">
          <div v-if="showLetterBtn" class="action-area">
            <button class="btn-primary action-btn" @click="nextPhase">
              信封里还有一张纸……
            </button>
          </div>
        </transition>
      </div>

      <!-- ══════════════════════════════════════════
           PHASE 3 — Checklist + Photos
      ══════════════════════════════════════════ -->
      <div v-else-if="phase === 3" key="phase3" class="phase phase-3">
        <header class="finale-header">
          <h1 class="finale-title">心愿清单</h1>
        </header>

        <hr class="divider" />

        <div class="checklist-intro cipher-card" style="margin-bottom: var(--spacing-xl)">
          <p class="text-handwriting" style="line-height: 1.9; font-size: 1rem">
            如果有一天有人替我走这条路——帮我留住这些。
          </p>
        </div>

        <!-- Checklist items, one by one -->
        <div class="checklist">
          <div
            v-for="(item, index) in CHECKLIST"
            :key="index"
            class="checklist-item"
            :class="{ visible: checklistRevealed > index }"
          >
            <span class="check-mark text-success">✓</span>
            <s class="check-text">{{ item }}</s>
          </div>
        </div>

        <!-- Photos section -->
        <transition name="section-fade">
          <div v-if="showPhotos" class="photos-section animate-fade-in">
            <hr class="divider" />
            <p class="section-label text-accent">你留下的影像</p>

            <div
              v-for="pair in PHOTO_DIARY_PAIRS"
              :key="pair.stage"
              class="photo-entry"
            >
              <div v-if="photos[pair.stage]" class="photo-wrapper animate-fade-in">
                <img
                  :src="photos[pair.stage]"
                  :alt="`第${pair.stage}站`"
                  class="entry-photo"
                />
              </div>
              <div v-else class="photo-placeholder">
                <span class="text-secondary">第 {{ pair.stage }} 站 · 未留影像</span>
              </div>

              <blockquote class="entry-diary text-handwriting">
                {{ pair.diary }}
              </blockquote>
            </div>

            <!-- Final message -->
            <transition name="finale-msg">
              <div v-if="showFinalMsg" class="final-message animate-fade-in">
                <hr class="divider" />
                <p class="final-text text-handwriting cipher-card cipher-card--accent">
                  任务完成。档案已永久封存。
                </p>

                <!-- Badge unlock -->
                <BadgeDisplay title="城市徽章" :show-ultimate="true" />

                <div class="action-area" style="padding-top: var(--spacing-xl)">
                  <button class="btn-primary action-btn" @click="goToArchive">
                    查看档案
                  </button>
                  <button class="btn-secondary action-btn" @click="showShareCard = true">
                    生成分享卡片
                  </button>
                </div>

                <!-- Share card overlay -->
                <ShareCard
                  :visible="showShareCard"
                  :city-id="cityId"
                  :photos-count="Object.keys(photos).length"
                  @close="showShareCard = false"
                />
              </div>
            </transition>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { usePlatformStore } from '../stores/platform.js'
import { useCityData } from '../data/cities/useCityData.js'
import { getPhoto } from '../utils/photo-store.js'
import NarrativeText from '../components/NarrativeText.vue'
import BadgeDisplay from '../components/BadgeDisplay.vue'
import ShareCard from '../components/ShareCard.vue'

const props = defineProps({ cityId: { type: String, required: true } })

const router = useRouter()
const game = useGameStore(props.cityId)
const platform = usePlatformStore()
const { cityData, loading } = useCityData(computed(() => props.cityId))

const PHOTO_DIARY_PAIRS = computed(() => cityData.value?.photoDiaryPairs ?? [])
const HEYING_CHECKLIST = computed(() => cityData.value?.heyingChecklist ?? [])
const FINALE = computed(() => cityData.value?.finale ?? {})

// ── Static data ─────────────────────────────────────────────────────────────

const ACROSTIC_ITEMS = computed(() => {
  const ac = FINALE.value?.acrostic
  if (!ac?.characters) return []
  return ac.characters.map((char, i) => ({ stageId: i + 1, char }))
})

const ACROSTIC_PHRASE = computed(() => FINALE.value?.acrostic?.hiddenMessage ?? '')

const acrosticPrompt = computed(() =>
  '在每一站的日记中都藏了一个字。\n\n回头看看——\n每一篇日记残页正文的第一个字。'
)

const envelopeIntro = computed(() => FINALE.value?.envelopePrompt ?? '现在，打开那个信封。')

const LETTER_TEXT = computed(() => FINALE.value?.completionMessage ?? '')

const CHECKLIST = computed(() => {
  const raw = HEYING_CHECKLIST.value
  if (!raw || !Array.isArray(raw)) return []
  // Handle both string[] and object[] formats
  return raw.map(item => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') {
      // Nanjing format: { name, role, detail, ... }
      if (item.name && item.role) return `${item.name}，${item.role}。${item.detail || ''}`
      // Other cities: { stage, dish, note, ... }
      if (item.dish) return item.note || item.dish
      return item.detail || item.name || JSON.stringify(item)
    }
    return String(item)
  })
})

// ── Phase state ──────────────────────────────────────────────────────────────

const phase = ref(1)

// Phase 1
const showAcrostic = ref(false)
const acrosticRevealed = ref(0)
const showPhrase = ref(false)

// Phase 2
const showLetter = ref(false)
const showLetterBtn = ref(false)

// Phase 3
const checklistRevealed = ref(0)
const showPhotos = ref(false)
const showFinalMsg = ref(false)
const photos = ref({})
const showShareCard = ref(false)

// ── Phase 1 logic ────────────────────────────────────────────────────────────

function onPromptComplete() {
  setTimeout(() => {
    showAcrostic.value = true
    revealAcrosticChars()
  }, 600)
}

function revealAcrosticChars() {
  const total = ACROSTIC_ITEMS.value.length
  let i = 0
  function next() {
    if (i < total) {
      acrosticRevealed.value = i + 1
      i++
      setTimeout(next, 500)
    } else {
      setTimeout(() => {
        showPhrase.value = true
      }, 800)
    }
  }
  setTimeout(next, 400)
}

// ── Phase 2 logic ────────────────────────────────────────────────────────────

function onEnvelopeIntroComplete() {
  setTimeout(() => {
    showLetter.value = true
  }, 800)
}

function onLetterComplete() {
  setTimeout(() => {
    showLetterBtn.value = true
  }, 1200)
}

// ── Phase 3 logic ────────────────────────────────────────────────────────────

function startPhase3() {
  revealChecklistItems()
}

function revealChecklistItems() {
  const total = CHECKLIST.value.length
  let i = 0
  function next() {
    if (i < total) {
      checklistRevealed.value = i + 1
      i++
      setTimeout(next, 600)
    } else {
      setTimeout(() => {
        showPhotos.value = true
        loadPhotos()
        setTimeout(() => {
          showFinalMsg.value = true
          game.completeGame()
          platform.markCityCompleted(props.cityId)
        }, 3000)
      }, 800)
    }
  }
  setTimeout(next, 600)
}

async function loadPhotos() {
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
}

// ── Navigation ───────────────────────────────────────────────────────────────

function nextPhase() {
  if (phase.value === 1) {
    phase.value = 2
  } else if (phase.value === 2) {
    phase.value = 3
    // Small delay to let transition finish then start phase 3
    setTimeout(startPhase3, 400)
  }
}

function goToArchive() {
  router.push(`/city/${props.cityId}/archive`)
}
</script>

<style scoped>
.finale {
  min-height: 100vh;
}

.finale-header {
  text-align: center;
  padding: var(--spacing-lg) 0 var(--spacing-md);
}

.finale-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: var(--spacing-md);
  letter-spacing: 0.05em;
}

/* ── Acrostic ── */
.acrostic-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}

.acrostic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.acrostic-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.acrostic-char {
  font-family: var(--font-handwriting);
  font-size: 2.2rem;
  color: var(--accent);
  line-height: 1;
}

.acrostic-stage {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.phrase-reveal {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.phrase-divider {
  font-size: 0.85rem;
  margin-bottom: var(--spacing-md);
}

.phrase-text {
  font-size: 1.6rem;
  letter-spacing: 0.3em;
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: center;
}

/* ── Letter ── */
.letter-card {
  line-height: 2;
  font-size: 1rem;
}

/* ── Checklist ── */
.checklist {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.checklist-item {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.checklist-item.visible {
  opacity: 1;
  transform: translateX(0);
}

.check-mark {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.check-text {
  font-size: 1rem;
  color: var(--text-secondary);
  text-decoration-color: var(--accent);
}

/* ── Photos ── */
.section-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
}

.photo-entry {
  margin-bottom: var(--spacing-xl);
}

.photo-wrapper {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.entry-photo {
  width: 100%;
  display: block;
  max-height: 260px;
  object-fit: cover;
}

.photo-placeholder {
  height: 140px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.entry-diary {
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--text-secondary);
  border-left: 2px solid var(--border);
  padding-left: var(--spacing-md);
  margin: 0;
  quotes: none;
}

/* ── Final message ── */
.final-text {
  font-size: 1.1rem;
  line-height: 2;
  text-align: center;
  padding: var(--spacing-lg);
}

/* ── Actions ── */
.action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.action-btn {
  width: 100%;
  max-width: 280px;
  padding: 14px;
  font-size: 1rem;
  letter-spacing: 0.1em;
}

/* ── Transitions ── */
.phase-fade-enter-active,
.phase-fade-leave-active {
  transition: opacity 0.6s ease;
}
.phase-fade-enter-from,
.phase-fade-leave-to {
  opacity: 0;
}

.section-fade-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.section-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.letter-reveal-enter-active {
  transition: opacity 0.8s ease;
}
.letter-reveal-enter-from {
  opacity: 0;
}

.phrase-reveal-enter-active {
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.phrase-reveal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.btn-rise-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.btn-rise-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.finale-msg-enter-active {
  transition: opacity 0.8s ease;
}
.finale-msg-enter-from {
  opacity: 0;
}
</style>
