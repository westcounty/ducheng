<template>
  <div class="archive page-padding">
    <header class="archive-header">
      <div class="stamp stamp--accent animate-stamp">永久封存</div>
      <h1 class="archive-title">鹤影档案</h1>
      <p class="archive-subtitle text-handwriting text-accent">
        此生未能再见，但你走过的每一条路，我都提前走过一遍。
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
          <span class="entry-location">{{ stageTitle(pair.stage) }}</span>
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

        <!-- Wish text (checklist item) -->
        <div class="entry-wish">
          <span class="wish-label text-accent">心愿存档</span>
          <p class="wish-text"><s>{{ CHECKLIST[pair.stage - 1] }}</s></p>
        </div>

        <!-- Diary quote -->
        <blockquote class="entry-diary text-handwriting cipher-card">
          {{ pair.diary }}
        </blockquote>

        <hr v-if="pair.stage < 7" class="divider" />
      </div>
    </div>

    <!-- Footer -->
    <footer class="archive-footer cipher-card cipher-card--accent">
      <p class="footer-acrostic text-handwriting">
        每一篇日记的第一个字，串成了那句话：
      </p>
      <p class="footer-phrase text-handwriting text-accent">
        「你走过的每一步」
      </p>
      <hr class="divider" />
      <p class="footer-date text-secondary">
        档案封存日期：{{ today }}
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PHOTO_DIARY_PAIRS } from '../data/narrative.js'
import { getStage } from '../data/puzzles.js'
import { getPhoto } from '../utils/photo-store.js'

const photos = ref({})

const CHECKLIST = [
  '绿塔在光线里的样子',
  '钟的脸',
  '那头不说话的狮子',
  '桥上回头看到的水面',
  '石头门楣上那张脸',
  '梧桐的影子',
  '那艘船的船头'
]

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

function stageTitle(stageId) {
  const stage = getStage(stageId)
  return stage ? stage.title : ''
}

onMounted(async () => {
  for (const pair of PHOTO_DIARY_PAIRS) {
    try {
      const blob = await getPhoto(pair.stage)
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

.footer-date {
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}
</style>
