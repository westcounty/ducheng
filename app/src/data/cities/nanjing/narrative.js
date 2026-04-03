/**
 * 金陵刻痕 — Narrative data
 * Finale acrostic, intro story, and photo-diary pairing data
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `陆鸣远，江西人，因识字被征调到南京当验砖吏。本来只需检查每块砖上的铭文是否合规——他的工作就是读砖。但一个识字的人到了南京，怎么可能只读砖？

他开始读所有的东西。城门上的匾额、贡院号舍墙上考生偷刻的小字、秦淮河画舫上飘出的半阙词、鸡鸣寺台阶上磨出的经文、台城城头上前朝留下的箭痕。他读了整座城市。

他死前，在七个地方各留了一处刻痕。不是同一种格式，而是模仿了七种不同的"刻字人"——用砖铭的格式、用木匠落款的格式、用试帖诗的格式、用灯谜的格式、用佛偈的格式、用城头题记的格式、用户籍档案的格式。他把自己的遗言分散藏进了这座城市最不缺文字的七个角落。

六百年后的今天，一份旧砖铭档案意外出土，其中有一条异常记录——

"从中华门城堡的那块砖开始。"`

// ──────────────────────────────────────────────────────────────────────────
// Finale Data
// ──────────────────────────────────────────────────────────────────────────

/**
 * The complete decoded message, reconstructed from all 7 fragments.
 * Correct fragment order (by card back numbers 1→7):
 *   back#1 = 将军刻功， (Stage 1)
 *   back#2 = 诗人刻诗， (Stage 2)
 *   back#3 = 考生刻愿， (Stage 3)
 *   back#4 = 僧人刻经， (Stage 4)
 *   back#5 = 妻子刻平安。 (Stage 5)
 *   back#6 = 我谁都不是，就刻了这座城里最不值钱的东西—— (Stage 6)
 *   back#7 = 七个认真活过的普通人的名字。你现在知道了。够了。 (Stage 7)
 *
 * Full message: 将军刻功，诗人刻诗，考生刻愿，僧人刻经，妻子刻平安。我谁都不是，就刻了这座城里最不值钱的东西——七个认真活过的普通人的名字。你现在知道了。够了。
 */
export const FINALE = {
  /**
   * The complete reconstructed message
   */
  fullMessage: '将军刻功，诗人刻诗，考生刻愿，僧人刻经，妻子刻平安。我谁都不是，就刻了这座城里最不值钱的东西——七个认真活过的普通人的名字。你现在知道了。够了。',

  /**
   * Fragment assembly order: array of { backNumber, stageId, fragment }
   * sorted by card back number (1–7)
   */
  fragmentOrder: [
    { backNumber: 1, stageId: 1, fragment: '将军刻功，' },
    { backNumber: 2, stageId: 2, fragment: '诗人刻诗，' },
    { backNumber: 3, stageId: 3, fragment: '考生刻愿，' },
    { backNumber: 4, stageId: 4, fragment: '僧人刻经，' },
    { backNumber: 5, stageId: 5, fragment: '妻子刻平安。' },
    { backNumber: 6, stageId: 6, fragment: '我谁都不是，就刻了这座城里最不值钱的东西——' },
    { backNumber: 7, stageId: 7, fragment: '七个认真活过的普通人的名字。你现在知道了。够了。' }
  ],

  /**
   * Acrostic puzzle data for the finale reveal layer
   * The first characters of each stage's diary note spell out a hidden message.
   * 城 巷 有 声 音 尚 在 → 城巷有声音尚在
   */
  acrostic: {
    /**
     * Each line: the diary quote for that stage, with the key character highlighted
     * The key character forms the hidden acrostic message
     */
    lines: [
      { stageId: 1, keyChar: '城', quote: '城墙下来了新砖。每块砖上都有人的名字，但没有人会记住他们。' },
      { stageId: 2, keyChar: '巷', quote: '巷子深处的门框上刻着木匠的名字。将来门坏了，后人知道找谁修。' },
      { stageId: 3, keyChar: '有', quote: '有人在号舍墙上刻了"娘，儿必中"。字刻得很深，指甲断了也不停。' },
      { stageId: 4, keyChar: '声', quote: '声从水上来。秦淮河的画舫经过时，总有人在船上唱曲子。' },
      { stageId: 5, keyChar: '音', quote: '音从塔顶来。鸡鸣寺的钟声，从西晋响到现在，石阶上都磨出了经文。' },
      { stageId: 6, keyChar: '尚', quote: '尚能登高。台城城头的风比城下大得多，柳树把所有人都送走了还在。' },
      { stageId: 7, keyChar: '在', quote: '在湖边坐了很久。黄册库里全天下人的名字都在，但没有人来读。' }
    ],
    /**
     * Reading the keyChar of each line in stage order spells the hidden message
     */
    characters: ['城', '巷', '有', '声', '音', '尚', '在'],
    hiddenMessage: '城巷有声音尚在',
    reveal: '城巷有声音尚在'
  },

  /**
   * Reveal text and meaning for the acrostic
   */
  revealText: '城巷有声音尚在',
  meaningText: '城市的街巷是有声音的，那些声音还在。',

  /**
   * Envelope prompt shown at the finale — instructions for the physical prop
   */
  envelopePrompt: '现在，打开那个信封。',

  /**
   * Completion message shown after the player confirms the full message
   */
  completionMessage:
    '任务完成。\n\n陆鸣远的七处刻痕，跨越六百年，终于被读出来了。\n\n将军刻功，诗人刻诗，考生刻愿，僧人刻经，妻子刻平安。我谁都不是，就刻了这座城里最不值钱的东西——七个认真活过的普通人的名字。你现在知道了。够了。\n\n——「刻痕集」已自动更名为「金陵七人」。'
}

// ──────────────────────────────────────────────────────────────────────────
// Checklist & Location Data
// Shared between Finale and Archive pages
// ──────────────────────────────────────────────────────────────────────────

/**
 * 陆鸣远's 7 names — the real people whose names survive in Nanjing's stone, wood, and paper.
 *
 * Verification status:
 *   ★★★★★ = Documented in museum/archive, fully confirmed
 *   ★★★☆☆ = Referenced in archaeological/heritage records, needs field photo
 *   ★★☆☆☆ = Category confirmed (records exist), specific name needs field visit
 *
 * Sources:
 *   1. 骆羊孙 — 南京城墙博物馆砖铭展品，宁国府南陵县窑匠，铭文79字
 *   2. 待实地确认 — 老门东保护整治工程档案，明代民居门框工匠签名
 *   3. 待实地确认 — 科举博物馆康熙52年恩科题名碑，约100位举人姓名
 *   4. 陆世荣 — 国家级非遗"秦淮灯彩"传承谱系，灯匠家族创始人
 *   5. 待实地确认 — 鸡鸣寺功德碑供养人名录
 *   6. 潘受七 — 城墙修缮砖铭考古记录（未查证，需实地确认）
 *   7. 王叙 — 安徽省博物院藏万历40年黄册底籍，休宁县匠籍户主（未查证，需实地确认）
 */
export const HEYING_CHECKLIST = [
  {
    stage: 1,
    name: '骆羊孙',
    role: '窑匠',
    era: '明洪武年间',
    source: '南京城墙博物馆·砖铭',
    detail: '宁国府南陵县窑匠。砖铭七十九字，记录了他的名字、籍贯和同窑十人。',
    verified: true
  },
  {
    stage: 2,
    name: '__FIELD__',
    role: '木匠',
    era: '明代',
    source: '老门东·门框落款',
    detail: '老门东修缮工程中记录的明代民居门框工匠签名。需实地考察确认。',
    verified: false
  },
  {
    stage: 3,
    name: '__FIELD__',
    role: '考生',
    era: '清康熙五十二年',
    source: '科举博物馆·恩科题名碑',
    detail: '康熙五十二年(1713)恩科题名碑上约一百位举人之一。需实地拍照确认。',
    verified: false
  },
  {
    stage: 4,
    name: '陆世荣',
    role: '灯匠',
    era: '清末',
    source: '国家级非遗档案·秦淮灯彩',
    detail: '秦淮灯彩陆氏家族早期传承人。其孙陆有昌为国家级非遗传承人。',
    verified: true
  },
  {
    stage: 5,
    name: '__FIELD__',
    role: '香客',
    era: '明/清',
    source: '鸡鸣寺·功德碑',
    detail: '鸡鸣寺功德碑供养人名录中的普通信众。需实地考察确认。',
    verified: false
  },
  {
    stage: 6,
    name: '潘受七',
    role: '修缮工匠',
    era: '明代',
    source: '城墙砖铭考古记录',
    detail: '台城段城墙修缮用砖铭文上的工匠名。需实地考察确认具体文献来源。',
    verified: false
  },
  {
    stage: 7,
    name: '王叙',
    role: '匠籍户主',
    era: '明万历四十年',
    source: '安徽省博物院·黄册底籍 / 玄武湖黄册库遗址展馆',
    detail: '休宁县二十七都五图匠籍户主，充当万历四十九年分里长。需实地考察确认。',
    verified: false
  }
]

/** Location name for each stage (index 0 = stage 1) */
export const STAGE_LOCATIONS = [
  '中华门城堡',
  '老门东',
  '科举博物馆',
  '秦淮河畔',
  '鸡鸣寺',
  '台城城墙',
  '玄武湖畔'
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
    prompt: '拍一块砖——上面有个人的名字，600年了',
    diary: '城墙下来了新砖。每块砖上都有人的名字，但没有人会记住他们。',
    diaryExcerpt:
      '城墙下来了新砖。我逐块验过，产地、监造、窑匠，三栏俱全方可入墙。这是规矩。但今日有一块……三栏文字对不上任何府县。我翻遍了名册也查不到。莫非是谁混进了一块不属于这座城的砖？'
  },
  {
    stage: 2,
    prompt: '拍一条最窄的巷子——巷子越窄，邻里越近',
    diary: '巷子深处的门框上刻着木匠的名字。将来门坏了，后人知道找谁修。',
    diaryExcerpt:
      '巷子深处有户人家换门框，我帮着搬旧木头。木匠临走前在门框暗处刻了个名字——他说这是规矩，"将来这扇门坏了，后人知道找谁修。"我想，这和我验砖是一回事。砖上刻名，门上刻名，都是怕被忘记。'
  },
  {
    stage: 3,
    prompt: '拍下这间小屋——曾有人在不足一米宽的空间里写下改变命运的文章',
    diary: '有人在号舍墙上刻了"娘，儿必中"。字刻得很深，指甲断了也不停。',
    diaryExcerpt:
      '有人在号舍墙上刻了字。不是诗，不是经，是一句"娘，儿必中"。字刻得很深，指甲断了也不停。我是来验砖的，不该管墙上的字。但我在那四个字前面站了很久。后来我也在墙角刻了一行——不是给谁看的，就是想在这里留点什么。'
  },
  {
    stage: 4,
    prompt: '拍河面的倒影——杜牧看到的秦淮，和你看到的是同一条河',
    diary: '声从水上来。秦淮河的画舫经过时，总有人在船上唱曲子。',
    diaryExcerpt:
      '声从水上来。秦淮河的画舫经过瞻园后门时，总有人在船上唱曲子。我听不太懂，但调子好听。有天我在河边捡到一张灯谜条，写着半阙词——谜面倒映在水里，和正着看完全是两个意思。我想，这条河上的人惯会把话反着说。'
  },
  {
    stage: 5,
    prompt: '拍下佛塔和天空——这座塔看过1700年的云',
    diary: '音从塔顶来。鸡鸣寺的钟声，从西晋响到现在，石阶上都磨出了经文。',
    diaryExcerpt:
      '音从塔顶来。鸡鸣寺的钟声我每天都听得到，但从没进去过。今天第一次上去，台阶磨得很滑，石头上隐约有经文的痕迹——不知是哪个朝代的僧人，一边念经一边上台阶，念了几百年，把字磨进了石头里。'
  },
  {
    stage: 6,
    prompt: '站在城头面朝玄武湖拍——六朝的皇帝看到的，和你一样',
    diary: '尚能登高。台城城头的风比城下大得多，柳树把所有人都送走了还在。',
    diaryExcerpt:
      '尚能登高。今日奉命上台城检查砖缝，城头的风比城下大得多。向北望是玄武湖，柳树把城墙外侧遮了个严实。韦庄那句诗——"无情最是台城柳"——我站在这里才读懂了。柳树不是无情，是太长命，长命到把所有人都送走了还在。'
  },
  {
    stage: 7,
    prompt: '面朝湖面拍——你身后就是这座城六百年的故事',
    diary: '在湖边坐了很久。黄册库里全天下人的名字都在，但没有人来读。',
    diaryExcerpt:
      '在湖边坐了很久。黄册库就在湖心的岛上，全天下人的名字都存在那里。我验了一辈子砖上的名字，砖上的人没有一个我认识。但我记住了七个。他们的名字我分别刻在了这座城市的七个角落——不是密码，不是暗号，就是七个认真活过的普通人的名字。'
  }
]
