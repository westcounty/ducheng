<template>
  <div class="prologue page-padding">
    <template v-if="!prologue">
      <p class="text-secondary">载入中…</p>
    </template>

    <template v-else>
      <!-- Header -->
      <header class="prologue-header">
        <span class="stamp stamp--accent animate-stamp">档案解封</span>
        <h1 class="prologue-title">{{ prologue.title }}</h1>
        <p class="prologue-subtitle text-secondary">{{ prologue.subtitle }}</p>
      </header>

      <hr class="divider" />

      <!-- Burned note fragments -->
      <div class="evidence-block">
        <p class="evidence-label text-accent">烧毁的纸条残片</p>
        <div class="fragments cipher-card">
          <p
            v-for="(frag, i) in prologue.fragments"
            :key="i"
            class="fragment-line text-handwriting"
          >{{ frag }}</p>
        </div>
      </div>

      <!-- Encrypted text -->
      <div class="evidence-block">
        <p class="evidence-label text-accent">纸条背面</p>
        <div class="cipher-card cipher-card--accent encrypted-text">
          <code>{{ prologue.encryptedText }}</code>
        </div>
      </div>

      <!-- Diary note -->
      <div class="evidence-block">
        <p class="evidence-label text-accent">日记封面便签</p>
        <div class="cipher-card diary-note text-handwriting">
          {{ prologue.diaryNote }}
        </div>
      </div>

      <hr class="divider" />

      <!-- Puzzle instruction -->
      <div class="instruction-block cipher-card" style="margin: var(--spacing-md) 0">
        <NarrativeText
          :text="prologue.step.instruction"
          :speed="80"
        />
      </div>

      <!-- Answer input -->
      <AnswerInput
        :answer="prologue.step.answer"
        :type="prologue.step.answerType"
        placeholder="输入目的地名称"
        @correct="onCorrect"
      />

      <HintSystem
        :hints="prologue.step.hints"
        :city-id="props.cityId"
        :stage-id="0"
        :step-id="prologue.step.id"
      />

      <!-- Success state -->
      <transition name="btn-rise">
        <div v-if="solved" class="success-area animate-fade-in">
          <hr class="divider" />
          <div class="cipher-card cipher-card--accent success-card">
            <p class="success-text text-handwriting">
              目标确认——和平饭店。
              <br /><br />
              出发。
            </p>
          </div>
          <div class="action-area">
            <button class="btn-primary action-btn" @click="proceed">
              前往第一站
            </button>
          </div>
        </div>
      </transition>
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

const props = defineProps({
  cityId: { type: String, required: true }
})

const router = useRouter()
const game = useGameStore(props.cityId)
const { cityData } = useCityData(computed(() => props.cityId))

const prologue = computed(() => cityData.value?.prologue ?? null)
const solved = ref(false)

function onCorrect() {
  solved.value = true
}

function proceed() {
  game.completePrologue()
  router.push(`/city/${props.cityId}/stage/1`)
}
</script>

<style scoped>
.prologue {
  min-height: 100vh;
}

.prologue-header {
  text-align: center;
  padding: var(--spacing-lg) 0 var(--spacing-md);
}

.prologue-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: var(--spacing-md);
  letter-spacing: 0.1em;
}

.prologue-subtitle {
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  margin-top: var(--spacing-xs);
}

.evidence-block {
  margin-bottom: var(--spacing-lg);
}

.evidence-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.fragments {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.fragment-line {
  font-size: 1.1rem;
  letter-spacing: 0.15em;
  color: var(--text-primary);
  margin: 0;
}

.encrypted-text {
  text-align: center;
  padding: var(--spacing-lg);
}

.encrypted-text code {
  font-size: 1.3rem;
  letter-spacing: 0.3em;
  color: var(--accent);
  font-family: var(--font-mono, monospace);
}

.diary-note {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-primary);
}

.success-card {
  text-align: center;
  padding: var(--spacing-xl);
}

.success-text {
  font-size: 1.1rem;
  line-height: 2;
  color: var(--text-primary);
  margin: 0;
}

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

.btn-rise-enter-active {
  transition: all 0.5s ease;
}

.btn-rise-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
</style>
