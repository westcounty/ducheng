/**
 * 第七封密电 — Narrative data
 * Finale acrostic, intro story, and photo-diary pairing data
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `1937年，上海。

一个代号为"信鸽"的地下交通员，在撤退前夕，将七封密电藏入了七处接头地点。

每一封密电都是一个碎片。
碎片背后，是他未能说出口的话。

七十年后，这些碎片被一一发现。
拼合在一起，才读出完整的最后一句话。

你，就是那个把碎片拼回来的人。

——档案馆馆长 谨启`

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
     * The key character is the first character of the full-message fragment
     */
    lines: [
      { stageId: 1, keyChar: '每', quote: '每一条走过的路，我都以为会再走一遍。' },
      { stageId: 2, keyChar: '但', quote: '但你我之间横着的，从来不是距离，而是那些说不出口的话。' },
      { stageId: 3, keyChar: '走', quote: '走过一遍的地方，以为会记住一辈子。' },
      { stageId: 4, keyChar: '此', quote: '此生若有来世，我不要再走这种弯弯绕绕的路了。' },
      { stageId: 5, keyChar: '走', quote: '走过的那些弄堂，石库门的门框上雕着卷草。' },
      { stageId: 6, keyChar: '我', quote: '我都提前想好了，如果那次任务失败……' },
      { stageId: 7, keyChar: '未', quote: '未能再见，是我这一生最深的遗憾。' }
    ],
    /**
     * Reading the keyChar of each line in stage order gives the full message's first chars
     */
    hiddenMessage: '每但走此走我未'
  },

  /**
   * Envelope prompt shown at the finale — instructions for the physical prop
   */
  envelopePrompt:
    '请打开信封，取出最后一封密电原件。将七张卡片按照背面编号1–7的顺序排列，逐一翻至正面，大声朗读拼合后的完整密电。',

  /**
   * Completion message shown after the player confirms the full message
   */
  completionMessage:
    '任务完成。\n\n"信鸽"的最后一句话，跨越七十年，终于被读出来了。\n\n此生未能再见，但你走过的每一条路，我都提前走过一遍。\n\n——档案馆，永久封存。'
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
    diary: '每一条走过的路，我都以为会再走一遍。1937年的外滩，我站在这扇旋转门前，不知道这是最后一次。'
  },
  {
    stage: 2,
    prompt: '记录校准器，以备后续对表',
    diary: '但你我之间横着的，从来不是距离，而是那些说不出口的话。钟楼的罗马数字里，有一个数字撒了谎——IIII不是四，却是我们永远的暗号。'
  },
  {
    stage: 3,
    prompt: '拍下沉默之狮，确认接头标记',
    diary: '走过一遍的地方，以为会记住一辈子。那头狮子沉默地蹲在那里，爪下压着的球，是我没能传递出去的情报。'
  },
  {
    stage: 4,
    prompt: '记录来路，确认未被跟踪',
    diary: '此生若有来世，我不要再走这种弯弯绕绕的路了。九个弯，每个弯都像一次告别，走到尽头却发现，来路已经不见了。'
  },
  {
    stage: 5,
    prompt: '存档信箱位置',
    diary: '走过的那些弄堂，石库门的门框上雕着卷草，卷草里我藏过情报，也藏过一句来不及说出口的话。等你回来，我的信还在那里。'
  },
  {
    stage: 6,
    prompt: '拍下死信箱周围环境',
    diary: '我都提前想好了，如果那次任务失败，就在这面墙的砖缝里留下最后一封信。可是我走了，信也没有写完。法国梧桐年年落叶，那个砖缝还在。'
  },
  {
    stage: 7,
    prompt: '拍下最终接头点全貌',
    diary: '未能再见，是我这一生最深的遗憾。武康大楼像一艘永远靠岸的船，我在它的转角等过你三次，每次都空手而归。第七封密电，也是最后一封。'
  }
]
