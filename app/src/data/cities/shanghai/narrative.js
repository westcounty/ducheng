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
// Checklist & Location Data
// Shared between Finale and Archive pages
// ──────────────────────────────────────────────────────────────────────────

/** 鹤影's 7 wishes — the checklist items shown in Finale and Archive */
export const HEYING_CHECKLIST = [
  '绿塔在光线里的样子',
  '钟的脸',
  '那头不说话的狮子',
  '桥上回头看到的水面',
  '石头门楣上那张脸',
  '梧桐的影子',
  '那艘船的船头'
]

/** Location name for each stage (index 0 = stage 1) */
export const STAGE_LOCATIONS = [
  '和平饭店',
  '海关大楼',
  '汇丰银行',
  '豫园九曲桥',
  '一大会址',
  '思南公馆',
  '武康大楼'
]

// ──────────────────────────────────────────────────────────────────────────
// Photo-Diary Pairs
// Used in the Archive page to display each stage photo alongside its diary quote
// ──────────────────────────────────────────────────────────────────────────

/**
 * @type {Array<{stage: number, prompt: string, diary: string, diaryExcerpt: string}>}
 */
export const PHOTO_DIARY_PAIRS = [
  {
    stage: 1,
    prompt: '拍下接头点外观，存档备查',
    diary: '绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。',
    diaryExcerpt:
      '你第一次见到这栋楼，大约也是傍晚。绿色的穹顶在夕光里发暗，像一枚放久了的铜章。我在东门停了两分钟，门楣上的年份刻得很深，不需要记——但我还是记了。'
  },
  {
    stage: 2,
    prompt: '记录校准器，以备后续对表',
    diary: '钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。',
    diaryExcerpt:
      '走到外滩这一段，人声盖过了一切，反而安全。海关大楼的罗马柱一根一根数过去，数目是确定的，不会撒谎。抬头看钟面，有件事值得记下：钟面上的四不写作IV，写作IIII。'
  },
  {
    stage: 3,
    prompt: '拍下沉默之狮，确认接头标记',
    diary: '那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。',
    diaryExcerpt:
      '过了这道门，里面比外面安静得多。门口两头铜狮，一头张嘴，一头闭嘴。闭嘴那头更难对付——沉默的东西总是更难对付。'
  },
  {
    stage: 4,
    prompt: '记录来路，确认未被跟踪',
    diary: '桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。',
    diaryExcerpt:
      '的确有人说这桥是为了挡鬼而建。鬼走直线，不会转弯。我从头到尾走了一遍，把每一个转角的方向用左右记下来——这串字母就是密钥的骨架。'
  },
  {
    stage: 5,
    prompt: '存档信箱位置',
    diary: '石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。',
    diaryExcerpt:
      '每条石库门弄堂的门牌号都有讲究：单号在一侧，双号在另一侧，这不是装饰，是规则。石门楣的铁艺卷草纹里藏着一张脸，不仔细盯根本发现不了。'
  },
  {
    stage: 6,
    prompt: '拍下死信箱周围环境',
    diary: '梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。',
    diaryExcerpt:
      '一面墙比另一面墙更值得信任，原因只有一个：它朝向周公故居。我在铭牌前站定，把随身带的格栅板盖上去，镂空的位置露出来的字才是真正的信息，其余的字是烟幕。'
  },
  {
    stage: 7,
    prompt: '拍下最终接头点全貌',
    diary: '这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。',
    diaryExcerpt:
      '步子走到这里，就到了。六张密码卡翻过来，拼成大楼的轮廓——这座楼本来就是一艘船的形状，船头朝北，永远停在这个路口。我设计这条路线的时候，想的是：如果有一个人把七个地方都走完，他就算见过我了。'
  }
]
