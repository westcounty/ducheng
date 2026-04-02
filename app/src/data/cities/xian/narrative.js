/**
 * 长安译 — Narrative data
 * Finale acrostic, intro story, and photo-diary pairing data
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `2024年碑林博物馆的一次例行修缮中，工人在景教碑背面发现了一层被石灰覆盖的刻痕——不是叙利亚文，不是中文，而是一种混合了多种文字的编码。经鉴定，刻痕年代为唐天宝年间（约750年）。

没有学者能完整破译，因为没有人同时精通这五种文字。但有一条线索反复出现：一个粟特语词汇，意思是"赴宴"。

这不是情报。不是经文。是一张请帖。

康安，来自撒马尔罕的丝路商人，在长安居住了三十年。他会说七种语言——不是因为聪明，是因为他的朋友们来自七个不同的地方。

关于他的朋友，旅记里只有零星描写：般若念经念到一半会睡着，阿史那是他见过最大的人但怕猫，约翰花三个小时跟般若争论完了一起喝酒，张怀远写个招牌要写三天，阿倍来长安时十七岁如今三十年还没回去，伊本评价城市只看集市好不好，胡禄信火说火不灭就是神还在。

他想办一场晚宴，把七个朋友请到同一张桌子前。他死于安史之乱前夜，晚宴没有来得及办成。`

// ──────────────────────────────────────────────────────────────────────────
// Finale Data
// ──────────────────────────────────────────────────────────────────────────

/**
 * The complete invitation message, reconstructed from all 7 fragments.
 * Correct fragment order (by card back numbers 1→7):
 *   back#1 = 如果你读到了 (Stage 1)
 *   back#2 = 全部七种文字， (Stage 2)
 *   back#3 = 请来赴宴。 (Stage 3)
 *   back#4 = 我已经备好了酒。 (Stage 4)
 *   back#5 = 等了一千三百年， (Stage 5)
 *   back#6 = 终于凑齐 (Stage 6)
 *   back#7 = 一桌人。 (Stage 7)
 *
 * Full message: 如果你读到了全部七种文字，请来赴宴。我已经备好了酒。等了一千三百年，终于凑齐一桌人。
 */
export const FINALE = {
  /**
   * The complete reconstructed invitation message
   */
  fullMessage: '如果你读到了全部七种文字，请来赴宴。我已经备好了酒。等了一千三百年，终于凑齐一桌人。',

  /**
   * Fragment assembly order: array of { backNumber, stageId, fragment }
   * sorted by card back number (1–7)
   */
  fragmentOrder: [
    { backNumber: 1, stageId: 1, fragment: '如果你读到了' },
    { backNumber: 2, stageId: 2, fragment: '全部七种文字，' },
    { backNumber: 3, stageId: 3, fragment: '请来赴宴。' },
    { backNumber: 4, stageId: 4, fragment: '我已经备好了酒。' },
    { backNumber: 5, stageId: 5, fragment: '等了一千三百年，' },
    { backNumber: 6, stageId: 6, fragment: '终于凑齐' },
    { backNumber: 7, stageId: 7, fragment: '一桌人。' }
  ],

  /**
   * Acrostic puzzle data for the finale reveal layer
   * The first characters of each stage's diary intro spell out a hidden message.
   * 此 城 容 得 下 万 邦 → 此城容得下万邦
   */
  acrostic: {
    /**
     * Each line: the diary quote for that stage, with the key character highlighted
     * The key character forms the hidden acrostic message
     */
    lines: [
      { stageId: 1, keyChar: '此', quote: '般若说\'这座塔裂开过三次，又合上了三次。佛法也是这样\'——我想，长安也是这样。' },
      { stageId: 2, keyChar: '城', quote: '阿史那攻过很多城。他说这座城他只想守。也许最好的城，是让攻城的人放下武器的城。' },
      { stageId: 3, keyChar: '容', quote: '约翰的神和般若的佛住在同一块石头上。世界上只有一座城让这件事发生了。' },
      { stageId: 4, keyChar: '得', quote: '张怀远说字写得不好不如不写。但他给我写了七份请帖——每一份都用了三天。' },
      { stageId: 5, keyChar: '下', quote: '阿倍仲麻吕在长安住了三十年。我问他为什么不回去。他说\'回去了就没有这里了\'。' },
      { stageId: 6, keyChar: '万', quote: '伊本说长安的西市是世界第二好的集市。我觉得他在说谎。但他笑的时候，不像说谎。' },
      { stageId: 7, keyChar: '邦', quote: '胡禄说\'这座城不需要神\'。我想他的意思是：这座城自己就是神迹。' }
    ],
    /**
     * Reading the keyChar of each line in stage order spells the hidden message
     */
    characters: ['此', '城', '容', '得', '下', '万', '邦'],
    hiddenMessage: '此城容得下万邦',
    reveal: '此城容得下万邦'
  },

  /**
   * Reveal text and meaning for the acrostic
   */
  revealText: '此城容得下万邦',
  meaningText: '这座城市容得下所有人——这是长安最伟大的地方。',

  /**
   * Envelope prompt shown at the finale — instructions for the physical prop
   */
  envelopePrompt: '现在，打开那个信封。在灯光亮起的这一刻打开。',

  /**
   * Completion message shown after the player confirms the full message
   */
  completionMessage:
    '任务完成。\n\n康安的七份请帖，跨越一千三百年，终于被读出来了。\n\n如果你读到了全部七种文字，请来赴宴。我已经备好了酒。等了一千三百年，终于凑齐一桌人。\n\n——「丝路影集」已自动更名为「康安的晚宴」。'
}

// ──────────────────────────────────────────────────────────────────────────
// Checklist & Location Data
// Shared between Finale and Archive pages
// ──────────────────────────────────────────────────────────────────────────

/** 康安's dinner menu — 7 dishes for the 1300-year-late banquet */
export const HEYING_CHECKLIST = [
  { stage: 1, dish: '天竺素斋', friend: '般若', note: '般若不吃肉，但他说荐福寺的素斋比天竺的好' },
  { stage: 2, dish: '突厥烤全羊', friend: '阿史那', note: '阿史那说草原上的羊比长安的肥，但长安的火比草原的旺' },
  { stage: 3, dish: '葡萄酒', friend: '约翰', note: '约翰从波斯带来的酒，说是耶稣喝过的那种。般若说佛祖不喝酒。然后两人又吵了一架' },
  { stage: 4, dish: '长安水盆羊肉', friend: '张怀远', note: '给张怀远带了一壶好酒，他非要用狂草给我写菜单，我一个字都看不懂' },
  { stage: 5, dish: '日本茶配的饼', friend: '阿倍', note: '阿倍从东瀛带来的点心，形状像满月。我问他这是什么，他说是想家的形状' },
  { stage: 6, dish: '孜然烤羊肉', friend: '伊本', note: '伊本教我做了一道羊肉——孜然要最后放，放早了就苦。这也算是丝路上的学问' },
  { stage: 7, dish: '石榴汁', friend: '胡禄', note: '胡禄说波斯人相信石榴是天堂的果实。我没去过天堂，但这个味道不错' }
]

/** Location name for each stage (index 0 = stage 1) */
export const STAGE_LOCATIONS = [
  { stage: 1, name: '小雁塔/荐福寺', address: '西安市碑林区友谊西路72号' },
  { stage: 2, name: '城墙·南门（永宁门）', address: '西安市碑林区南大街与环城南路交汇处' },
  { stage: 3, name: '碑林博物馆', address: '西安市碑林区三学街15号' },
  { stage: 4, name: '书院门步行街', address: '西安市碑林区书院门（南门内东侧）' },
  { stage: 5, name: '钟鼓楼广场', address: '西安市莲湖区北院门与西大街交汇处' },
  { stage: 6, name: '回民街/化觉巷清真大寺', address: '西安市莲湖区北院门与化觉巷' },
  { stage: 7, name: '大雁塔/大唐不夜城', address: '西安市雁塔区大雁塔北广场' }
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
    prompt: '拍下小雁塔——般若说\'这座塔裂开过三次，又合上了三次。佛法也是这样\'',
    diary: '般若说\'这座塔裂开过三次，又合上了三次。佛法也是这样\'——我想，长安也是这样。',
    diaryExcerpt:
      '此地有一座塔，不算最高，但般若说它是他见过最倔的。三次地震，塔裂开了三次，又自己合上了三次。般若说"佛法也是这样，裂了不怕，怕的是不合"。他坚持早上四点起来念经，但每次念到一半就睡着。打呼的声音比钟还响。般若不吃肉，但他说荐福寺的素斋比天竺的好。我信他。'
  },
  {
    stage: 2,
    prompt: '拍下城门洞——阿史那说\'我攻过很多城，这是我唯一想守的一座\'',
    diary: '阿史那攻过很多城。他说这座城他只想守。也许最好的城，是让攻城的人放下武器的城。',
    diaryExcerpt:
      '城墙上的月亮，和关外的月亮不是同一个。阿史那跟我说这话的时候喝多了。他是我见过最大的人，但他怕猫。有次一只猫跳上城墙，他退了三步。我笑了一个月。他攻过很多城，但他说这座城他只想守。"秦时明月汉时关"——他背这首诗的时候，表情很复杂。诗里说的那些关，有些是他的人攻破的。'
  },
  {
    stage: 3,
    prompt: '拍下景教碑——约翰说\'我的神和般若的佛吵了一千年，但他们住在同一块石头上\'',
    diary: '约翰的神和般若的佛住在同一块石头上。世界上只有一座城让这件事发生了。',
    diaryExcerpt:
      '容不下两个神？约翰不同意。他总说他的神只有一个，然后花三个小时跟般若争论。争完了一起喝酒，说"你的佛不错"。有一天我带他们俩去碑林，指着景教碑上面的十字架和莲花说："你看，你们的神早就和解了。"约翰沉默了很久，然后说："也许不是和解，是拥抱。"'
  },
  {
    stage: 4,
    prompt: '拍下书院门牌坊——张怀远说\'字要是写得不好，不如不写。但不写就什么都没有了\'',
    diary: '张怀远说字写得不好不如不写。但他给我写了七份请帖——每一份都用了三天。',
    diaryExcerpt:
      '得一好字不如得一好友，但张怀远说得一好字比得一好友难。我让他给我写个招牌，他写了三天，说前两版不够好。我说能认字就行。他说那不行。给他带了一壶好酒，他非要用狂草给我写菜单，我一个字都看不懂。他说："看不懂才好。看得懂的字，不值钱。"'
  },
  {
    stage: 5,
    prompt: '拍下鼓楼——阿倍说\'长安的鼓声告诉我几点该回家。但我的家在海的那边\'',
    diary: '阿倍仲麻吕在长安住了三十年。我问他为什么不回去。他说\'回去了就没有这里了\'。',
    diaryExcerpt:
      '下了鼓楼的台阶，阿倍仲麻吕站了很久没动。他来长安的时候十七岁，现在三十年了还没回去。我问他想不想家，他念了一首和歌，我没听懂，但他哭了。他说长安的鼓声告诉他几点该回家，但他的家在海的那边，鼓声传不到。我不知道怎么安慰他。我给他倒了一杯酒。'
  },
  {
    stage: 6,
    prompt: '拍下回民街——伊本说\'评价一座城市只需要一个标准：集市好不好\'',
    diary: '伊本说长安的西市是世界第二好的集市。我觉得他在说谎。但他笑的时候，不像说谎。',
    diaryExcerpt:
      '万般美味中，伊本最爱的还是这条街。他评价所有城市只用一个标准：集市好不好。他说长安的西市是世界第二好的。我问第一是哪里，他说"我老家"。然后笑了。伊本教我做了一道羊肉——孜然要最后放，放早了就苦。这也算是丝路上的学问。他说："你们汉人什么都好，就是不会用香料。"我说："所以你来了。"'
  },
  {
    stage: 7,
    prompt: '拍下大雁塔——胡禄说\'这座城不需要神\'。然后你走进不夜城，灯亮了',
    diary: '胡禄说\'这座城不需要神\'。我想他的意思是：这座城自己就是神迹。',
    diaryExcerpt:
      '邦国之交，终归于一桌酒席。胡禄信火。他说火不灭就是神还在。我给他看过长安的万家灯火，他站了很久，说："这座城不需要神。"我问为什么。他说："因为这座城自己就在发光。"那天是上元节。"春风得意马蹄疾，一日看尽长安花"——不是胡禄写的，但那天他说了一句差不多的话："今天谁都不用回家。"'
  }
]
