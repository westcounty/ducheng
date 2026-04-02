/**
 * 第七封密电 — Narrative data
 * Finale acrostic, intro story, and photo-diary pairing data
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `1943年秋，代号"鹤影"的情报员截获了一份足以改变战局的日军密电。为防止被捕后情报落入敌手，他将密电拆成7段，分别藏匿于上海7个地点，每一处都留下了只有同志才能读懂的暗号。

鹤影随后失踪，密电再未被拼合。

80年后的今天，一份旧档案意外解封，其中只有一句话——

"从和平饭店的绿塔开始。"`

// ──────────────────────────────────────────────────────────────────────────
// Finale Data
// ──────────────────────────────────────────────────────────────────────────

/**
 * The complete cipher message, reconstructed from all 7 fragments.
 * Correct fragment order (by card back numbers 1→7):
 *   back#1 = 此生 (Stage 4)
 *   back#2 = 未能再见 (Stage 7)
 *   back#3 = 但你 (Stage 2)
 *   back#4 = 走过的 (Stage 5)
 *   back#5 = 每一条路 (Stage 1)
 *   back#6 = 我都提前 (Stage 6)
 *   back#7 = 走过一遍 (Stage 3)
 *
 * Full message: 此生未能再见，但你走过的每一条路，我都提前走过一遍。
 */
export const FINALE = {
  /**
   * The complete reconstructed cipher message
   */
  fullMessage: '此生未能再见，但你走过的每一条路，我都提前走过一遍。',

  /**
   * Fragment assembly order: array of { backNumber, stageId, fragment }
   * sorted by card back number (1–7)
   */
  fragmentOrder: [
    { backNumber: 1, stageId: 4, fragment: '此生' },
    { backNumber: 2, stageId: 7, fragment: '未能再见' },
    { backNumber: 3, stageId: 2, fragment: '但你' },
    { backNumber: 4, stageId: 5, fragment: '走过的' },
    { backNumber: 5, stageId: 1, fragment: '每一条路' },
    { backNumber: 6, stageId: 6, fragment: '我都提前' },
    { backNumber: 7, stageId: 3, fragment: '走过一遍' }
  ],

  /**
   * Acrostic puzzle data for the finale reveal layer
   * The first characters of each stage location spell out a hidden message.
   * 和 海 汇 豫 中 思 武 → 和海汇豫中思武
   * (Alternative reading: initial characters of diary quotes form an acrostic)
   */
  acrostic: {
    /**
     * Each line: the diary quote for that stage, with the key character highlighted
     * The key character forms the hidden acrostic message
     */
    lines: [
      { stageId: 1, keyChar: '你', quote: '绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。' },
      { stageId: 2, keyChar: '走', quote: '钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。' },
      { stageId: 3, keyChar: '过', quote: '那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。' },
      { stageId: 4, keyChar: '的', quote: '桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。' },
      { stageId: 5, keyChar: '每', quote: '石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。' },
      { stageId: 6, keyChar: '一', quote: '梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。' },
      { stageId: 7, keyChar: '步', quote: '这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。' }
    ],
    /**
     * Reading the keyChar of each line in stage order spells the hidden message
     */
    characters: ['你', '走', '过', '的', '每', '一', '步'],
    hiddenMessage: '你走过的每一步',
    reveal: '你走过的每一步'
  },

  /**
   * Envelope prompt shown at the finale — instructions for the physical prop
   */
  envelopePrompt: '现在，打开那个信封。',

  /**
   * Completion message shown after the player confirms the full message
   */
  completionMessage:
    '任务完成。\n\n"鹤影"的最后一句话，跨越80年，终于被读出来了。\n\n此生未能再见，但你走过的每一条路，我都提前走过一遍。\n\n——档案馆，永久封存。'
}

// ──────────────────────────────────────────────────────────────────────────
// Photo-Diary Pairs
// Used in the Archive page to display each stage photo alongside its diary quote
// ──────────────────────────────────────────────────────────────────────────

/**
 * @type {Array<{stage: number, prompt: string, diary: string}>}
 */
export const PHOTO_DIARY_PAIRS = [
  {
    stage: 1,
    prompt: '拍下接头点外观，存档备查',
    diary: '绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。'
  },
  {
    stage: 2,
    prompt: '记录校准器，以备后续对表',
    diary: '钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。'
  },
  {
    stage: 3,
    prompt: '拍下沉默之狮，确认接头标记',
    diary: '那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。'
  },
  {
    stage: 4,
    prompt: '记录来路，确认未被跟踪',
    diary: '桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。'
  },
  {
    stage: 5,
    prompt: '存档信箱位置',
    diary: '石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。'
  },
  {
    stage: 6,
    prompt: '拍下死信箱周围环境',
    diary: '梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。'
  },
  {
    stage: 7,
    prompt: '拍下最终接头点全貌',
    diary: '这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。'
  }
]
