<template>
  <div class="cross-city-reveal page-padding">
    <header class="reveal-header">
      <h1 class="reveal-title">四座城，四个人，一条暗线</h1>
      <p class="reveal-subtitle">他们相隔几百年，不可能认识彼此。</p>
    </header>

    <hr class="divider" />

    <section class="timeline">
      <div
        v-for="(thread, index) in CROSS_CITY_THREADS"
        :key="thread.from"
        class="timeline-entry"
        :class="`timeline-entry--${index}`"
      >
        <div class="entry-connector">
          <span class="entry-dot"></span>
          <span v-if="index < CROSS_CITY_THREADS.length - 1" class="entry-line"></span>
        </div>

        <div class="entry-body">
          <p class="entry-era">{{ ERAS[thread.from] }} · {{ CITY_NAMES[thread.from] }}</p>
          <p class="entry-character">{{ thread.character }}</p>
          <blockquote class="entry-quote">「{{ thread.quote }}」</blockquote>
          <p class="entry-source">—— {{ thread.source }}</p>
          <p class="entry-arrow">↓ 提到了 <span class="entry-next-city">{{ CITY_NAMES[thread.to] }}</span></p>
        </div>
      </div>

      <div class="timeline-loop">
        <span class="loop-dot"></span>
        <p class="loop-label">回到 · 上海</p>
        <p class="loop-hint">暗线成环</p>
      </div>
    </section>

    <hr class="divider" />

    <footer class="reveal-footer">
      <p class="closing-text">
        也许，认真活过的人，总会在某个拐角遇见另一个认真活过的人。
      </p>
      <router-link to="/" class="home-link">返回首页</router-link>
    </footer>
  </div>
</template>

<script setup>
import { CROSS_CITY_THREADS } from '../data/cross-city-threads.js'

const CITY_NAMES = {
  shanghai: '上海',
  nanjing: '南京',
  hangzhou: '杭州',
  xian: '西安'
}

const ERAS = {
  shanghai: '1943年',
  nanjing: '明朝',
  hangzhou: '南宋',
  xian: '唐朝'
}
</script>

<style scoped>
.cross-city-reveal {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary, #1a1a1a);
  color: var(--text-primary, #e8e0d4);
}

.reveal-header {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-md);
}

.reveal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #e8e0d4);
  letter-spacing: 0.15em;
  line-height: 1.5;
  margin-bottom: var(--spacing-sm);
}

.reveal-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.08em;
  line-height: 1.8;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--spacing-lg) 0;
}

.timeline-entry {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.entry-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
  padding-top: 4px;
}

.entry-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--text-primary, #e8e0d4);
  flex-shrink: 0;
}

.entry-line {
  width: 1px;
  flex: 1;
  min-height: 40px;
  background: linear-gradient(to bottom, var(--text-primary, #e8e0d4), transparent);
  opacity: 0.25;
  margin-top: 4px;
}

.entry-body {
  flex: 1;
  padding-bottom: var(--spacing-xl);
}

.entry-era {
  font-size: 0.78rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.12em;
  margin-bottom: 4px;
}

.entry-character {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #e8e0d4);
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-sm);
}

.entry-quote {
  font-size: 0.92rem;
  color: var(--text-primary, #e8e0d4);
  line-height: 1.8;
  letter-spacing: 0.05em;
  border-left: 2px solid var(--text-secondary, #8a7e6e);
  padding-left: var(--spacing-md);
  margin: 0 0 var(--spacing-sm) 0;
  opacity: 0.9;
}

.entry-source {
  font-size: 0.75rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.06em;
  margin-bottom: var(--spacing-sm);
}

.entry-arrow {
  font-size: 0.8rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.06em;
}

.entry-next-city {
  color: var(--text-primary, #e8e0d4);
  font-weight: 600;
}

.timeline-loop {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 5px;
  padding-top: 4px;
  gap: 4px;
}

.loop-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--text-primary, #e8e0d4);
  background: transparent;
  flex-shrink: 0;
}

.loop-label {
  font-size: 0.78rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.12em;
  margin: 0;
  padding-left: 24px;
  margin-top: -18px;
}

.loop-hint {
  font-size: 0.7rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.15em;
  opacity: 0.6;
  margin: 0;
  padding-left: 24px;
}

.reveal-footer {
  text-align: center;
  padding: var(--spacing-xl) 0 var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.closing-text {
  font-size: 0.95rem;
  color: var(--text-primary, #e8e0d4);
  line-height: 1.9;
  letter-spacing: 0.06em;
  max-width: 320px;
  opacity: 0.85;
}

.home-link {
  display: inline-block;
  font-size: 0.82rem;
  color: var(--text-secondary, #8a7e6e);
  letter-spacing: 0.12em;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 2px;
  transition: color 0.2s ease;
}

.home-link:hover {
  color: var(--text-primary, #e8e0d4);
}
</style>
