<template>
  <div class="stage page-padding">
    <!-- Loading / not found -->
    <template v-if="!stage">
      <p class="text-secondary">载入中…</p>
    </template>

    <template v-else>
      <!-- Stage Header -->
      <header class="stage-header">
        <div class="stage-meta">
          <span class="stage-num text-accent">第 {{ stage.id }} 站</span>
          <span class="stage-location text-secondary">{{ stage.location }}</span>
        </div>
        <h1 class="stage-title">{{ stage.title }}</h1>
        <p class="stage-address text-secondary">
          <small>📍 {{ stage.address }}</small>
        </p>
      </header>

      <hr class="divider" />

      <!-- Phase: solving steps -->
      <template v-if="phase === 'steps'">
        <div class="step-area">
          <div class="step-label text-accent">
            谜题 {{ currentStep + 1 }} / {{ stage.steps.length }}
          </div>
          <div class="step-title">{{ currentStepData.title }}</div>

          <div class="instruction-block cipher-card" style="margin: var(--spacing-md) 0">
            <NarrativeText
              :key="`step-${currentStep}`"
              :text="currentStepData.instruction"
              :speed="120"
            />
          </div>

          <AnswerInput
            :key="`answer-${currentStep}`"
            :answer="currentStepData.answer"
            :type="currentStepData.answerType"
            @correct="onStepCorrect"
          />

          <HintSystem
            :key="`hints-${currentStep}`"
            :hints="currentStepData.hints"
            :city-id="props.cityId"
            :stage-id="stage.id"
            :step-id="currentStepData.id"
          />
        </div>
      </template>

      <!-- Phase: cipher fragment reveal -->
      <template v-else-if="phase === 'fragment'">
        <div class="fragment-reveal animate-fade-in">
          <p class="section-label text-accent">密电碎片获取</p>
          <div class="cipher-card cipher-card--accent fragment-card">
            <p class="fragment-number text-secondary">
              碎片 #{{ stage.cardBackNumber }}
            </p>
            <p class="fragment-text text-handwriting">{{ stage.cipherFragment }}</p>
          </div>
          <p class="fragment-note text-secondary">
            碎片已记录。现在，留下这里的影像。
          </p>
        </div>

        <PhotoCapture
          :city-id="props.cityId"
          :stage-id="stage.id"
          :prompt="stage.photoPrompt"
          @done="onPhotoDone"
        />
      </template>

      <!-- Phase: transition clue -->
      <template v-else-if="phase === 'transition'">
        <div class="transition-area animate-fade-in">
          <p class="section-label text-accent">下一步指令</p>

          <div class="cipher-card clue-card">
            <p class="clue-text text-handwriting">{{ stage.transition.clue }}</p>
          </div>

          <div class="next-location">
            <p class="next-label text-secondary">下一站</p>
            <p class="next-name">{{ stage.transition.nextLocation }}</p>
            <p class="next-hint text-secondary">
              <small>{{ stage.transition.hint }}</small>
            </p>
          </div>

          <div v-if="stage.transition.metro" class="metro-info cipher-card">
            <p class="metro-label text-accent">地铁路线</p>
            <p class="metro-line">
              {{ stage.transition.metro.line }} 号线：
              {{ stage.transition.metro.from }} →
              {{ stage.transition.metro.to }}
              （{{ stage.transition.metro.stops }} 站）
            </p>
          </div>

          <div class="action-area">
            <button class="btn-primary action-btn" @click="goToTransit">
              前往下一站
            </button>
          </div>
        </div>
      </template>

      <!-- Phase: finale trigger (stage 7, no transition) -->
      <template v-else-if="phase === 'finale'">
        <div class="finale-trigger animate-fade-in">
          <p class="section-label text-accent">任务接近尾声</p>
          <div class="cipher-card">
            <p style="line-height: 1.8">
              七站走完了。七封密电的碎片，都在你的手中。<br /><br />
              是时候拼出完整的最后一句话。
            </p>
          </div>
          <div class="action-area">
            <button class="btn-primary action-btn" @click="goToFinale">
              打开最后一页
            </button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { useCityData } from '../data/cities/useCityData.js'
import NarrativeText from '../components/NarrativeText.vue'
import AnswerInput from '../components/AnswerInput.vue'
import HintSystem from '../components/HintSystem.vue'
import PhotoCapture from '../components/PhotoCapture.vue'

const props = defineProps({
  cityId: { type: String, required: true },
  id: { type: String, required: true }
})

const router = useRouter()
const game = useGameStore(props.cityId)
const { cityData, loading } = useCityData(computed(() => props.cityId))

const stageId = computed(() => Number(props.id))
const stage = computed(() => {
  if (!cityData.value) return null
  return cityData.value.getStage(stageId.value)
})

// phase: 'steps' | 'fragment' | 'transition' | 'finale'
const phase = ref('steps')

// Use game store's currentStep when on the correct stage
const currentStep = computed(() => {
  if (game.currentStage === stageId.value) return game.currentStep
  return 0
})

const currentStepData = computed(() => {
  if (!stage.value) return null
  return stage.value.steps[currentStep.value] ?? stage.value.steps[0]
})

function onStepCorrect() {
  const stepsTotal = stage.value.steps.length
  if (currentStep.value + 1 < stepsTotal) {
    game.advanceStep()
  } else {
    // All steps done — complete stage and show fragment
    game.completeStage(stageId.value, stage.value.cipherFragment)
    phase.value = 'fragment'
  }
}

function onPhotoDone() {
  if (stage.value.transition === null) {
    // Stage 7 — go to finale
    phase.value = 'finale'
  } else {
    phase.value = 'transition'
  }
}

function goToTransit() {
  const nextId = stageId.value + 1
  router.push(`/city/${props.cityId}/transit/${stageId.value}/${nextId}`)
}

function goToFinale() {
  game.enterFinale()
  router.push(`/city/${props.cityId}/finale`)
}
</script>

<style scoped>
.stage {
  min-height: 100vh;
}

.stage-header {
  padding: var(--spacing-md) 0;
}

.stage-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.stage-num {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.stage-location {
  font-size: 0.8rem;
}

.stage-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stage-address {
  color: var(--text-secondary);
}

.step-area {
  padding: var(--spacing-sm) 0;
}

.step-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.step-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.section-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.fragment-reveal {
  margin-bottom: var(--spacing-xl);
}

.fragment-card {
  text-align: center;
  padding: var(--spacing-xl);
  margin: var(--spacing-md) 0;
}

.fragment-number {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-md);
}

.fragment-text {
  font-size: 2rem;
  color: var(--text-primary);
  letter-spacing: 0.2em;
}

.fragment-note {
  font-size: 0.9rem;
  margin-top: var(--spacing-md);
}

.transition-area {
  padding: var(--spacing-sm) 0;
}

.clue-card {
  margin-bottom: var(--spacing-lg);
}

.clue-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 0;
}

.next-location {
  margin-bottom: var(--spacing-lg);
}

.next-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.next-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.metro-info {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
}

.metro-label {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.metro-line {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.action-btn {
  width: 100%;
  max-width: 280px;
  padding: 14px;
  font-size: 1rem;
  letter-spacing: 0.1em;
}

.finale-trigger {
  padding: var(--spacing-sm) 0;
}
</style>
