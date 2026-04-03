/**
 * 借景入梦戏如真 — Suzhou Narrative data
 * Finale acrostic, intro story, and photo-diary pairing data
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `乾隆四十二年，苏州阊门内一座家班散了伙。旦角沈云筝的名字从此消失在所有戏折子里。

关于沈云筝，戏班账册里只有零星记录：记性极好，能背整本《牡丹亭》。有个怪习惯——每到一座园林演出，散场后独自在园中走一圈，用手摸墙、摸石头、摸窗棂，像在记住什么。馋桂花糕，但从不敢多吃——「戏子贪嘴不体面」。

两百年后，苏州一座老宅翻修时，工人在花窗夹层中发现了7张戏票。正面印着7出折子戏的唱词，背面却写着不属于任何剧本的句子。

字迹与戏班账册上的批注笔迹一致——是沈云筝的。

从盘门的吴门桥开始。`

// ──────────────────────────────────────────────────────────────────────────
// Finale Data
// ──────────────────────────────────────────────────────────────────────────

/**
 * The complete cipher message, reconstructed from all 7 fragments.
 * Correct fragment order (by card back numbers 1→7):
 *   back#1 = 台上的人散了 (Stage 1)
 *   back#2 = 台下那个人也散了 (Stage 2)
 *   back#3 = 但这座园是我的 (Stage 4)
 *   back#4 = 窗是偷的 (Stage 3)
 *   back#5 = 石是借的 (Stage 6)
 *   back#6 = 水是梦里的 (Stage 5)
 *   back#7 = 你走进来就算有人来过 (Stage 7)
 *
 * Full message: 台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。
 */
export const FINALE = {
  /**
   * The complete reconstructed cipher message
   */
  fullMessage: '台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。',

  /**
   * Fragment assembly order: array of { backNumber, stageId, fragment }
   * sorted by card back number (1–7)
   */
  fragmentOrder: [
    { backNumber: 1, stageId: 1, fragment: '台上的人散了' },
    { backNumber: 2, stageId: 2, fragment: '台下那个人也散了' },
    { backNumber: 3, stageId: 4, fragment: '但这座园是我的' },
    { backNumber: 4, stageId: 3, fragment: '窗是偷的' },
    { backNumber: 5, stageId: 6, fragment: '石是借的' },
    { backNumber: 6, stageId: 5, fragment: '水是梦里的' },
    { backNumber: 7, stageId: 7, fragment: '你走进来就算有人来过' }
  ],

  /**
   * Acrostic puzzle data for the finale reveal layer
   * The first characters of each stage diary quote spell out a hidden message.
   * 借 景 入 梦 戏 如 真 → 借景入梦戏如真
   */
  acrostic: {
    /**
     * Each line: the diary quote for that stage, with the key character highlighted
     * The key character forms the hidden acrostic message
     */
    lines: [
      { stageId: 1, keyChar: '借', quote: '她在水里看见过另一个自己，那个不用唱戏的自己。' },
      { stageId: 2, keyChar: '景', quote: '年轮是石头记不住的东西，但树替它记了。' },
      { stageId: 3, keyChar: '入', quote: '梦里的那个人长得和她一模一样，只是左右反了。' },
      { stageId: 4, keyChar: '梦', quote: '够不着的最好看，够着了就是戏散了。' },
      { stageId: 5, keyChar: '戏', quote: '今日路过悬桥巷，有一扇门是杨妃的颜色。' },
      { stageId: 6, keyChar: '如', quote: '唱戏要淡，做人要浓。我搞反了一辈子。' },
      { stageId: 7, keyChar: '真', quote: '戏演完了，别鼓掌。安安静静走就好。' }
    ],
    /**
     * Reading the keyChar of each line in stage order spells the hidden message
     */
    characters: ['借', '景', '入', '梦', '戏', '如', '真'],
    hiddenMessage: '借景入梦戏如真',
    reveal: '借景入梦戏如真'
  },

  /**
   * Envelope prompt shown at the finale — instructions for the physical prop
   */
  envelopePrompt: '现在，打开那个信封。——戏散后再拆。',

  /**
   * Completion message shown after the player confirms the full message
   */
  completionMessage:
    '所有角色都演完了。\n\n沈云筝藏在七出折子戏缝隙里的话，跨越两百年，终于被听见了。\n\n台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。\n\n——借景入梦戏如真'
}

// ──────────────────────────────────────────────────────────────────────────
// Garden Elements & Location Data
// Shared between Finale and Archive pages
// ──────────────────────────────────────────────────────────────────────────

/** 沈云筝's 7 garden elements — the checklist items shown in Finale and Archive */
export const GARDEN_ELEMENTS = [
  '水——够映一个人的影子就行',
  '石——只刻一个人站过的位置',
  '窗——从这边看是真的，从那边看是梦里的',
  '漏窗——看得见又够不着',
  '花木——秋天满园都是甜的',
  '叠石——像人终于站起来了',
  '亭——谁来了就坐坐，走了也不必说'
]

/** Location name for each stage (index 0 = stage 1) */
export const STAGE_LOCATIONS = [
  '盘门·吴门桥',
  '苏州文庙',
  '双塔·定慧寺巷',
  '耦园外·仓街水巷',
  '平江路·悬桥巷',
  '桃花坞',
  '山塘街·星桥'
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
    prompt: '拍下吴门桥——她说替赵五娘走了一遍台位。你替她走一遍',
    diary: '她在水里看见过另一个自己，那个不用唱戏的自己。',
    diaryExcerpt:
      '借这座桥走一遍台位。赵五娘从桥东上，走到桥心停住——低头看水，水里有另一个她。这段戏要演得慢，脚步不能急。我站在吴门桥上，替她走了一遍。水里也有另一个我。那个人不用唱戏。'
  },
  {
    stage: 2,
    prompt: '拍下文庙的古柏——碑上的字会模糊，树的年轮不会',
    diary: '年轮是石头记不住的东西，但树替它记了。',
    diaryExcerpt:
      '景致再好也要记在碑上才算数——这是李香君教我的。她把血溅在扇面上，我把字藏在星星里。文庙的柏树比碑还老。碑上的字会模糊，树的年轮不会。'
  },
  {
    stage: 3,
    prompt: '拍下两座塔——一个人和她的影子，站在一起',
    diary: '梦里的那个人长得和她一模一样，只是左右反了。',
    diaryExcerpt:
      '入了妆就不是自己了。杜丽娘的粉要薄，像刚睡醒。她是真的在梦里见过那个人，还是自己编的？两座塔站在一起，像一个人和她的影子。我有时候也分不清——台上那个是我，还是台下这个是我？'
  },
  {
    stage: 4,
    prompt: '拍下耦园漏窗——够不着的最好看',
    diary: '够不着的最好看，够着了就是戏散了。',
    diaryExcerpt:
      '梦里隔着墙听见有人念书。我站在耦园墙外，透过漏窗看见里面的绿。崔莺莺也是这样——隔着墙听见张生的琴声。你大概不记得了。那天在沧浪亭演《西厢》，你坐在第三排。散戏后你站起来，我在台上还没卸妆。'
  },
  {
    stage: 5,
    prompt: '拍下悬桥巷那扇门——她说那是杨妃的颜色',
    diary: '今日路过悬桥巷，有一扇门是杨妃的颜色。',
    diaryExcerpt:
      '戏班账册，三月初九，沧浪亭堂会，包银二两四钱，茶点自备。——旁注：今日路过悬桥巷，有一扇门是杨妃的颜色。桂花糕，二文。'
  },
  {
    stage: 6,
    prompt: '拍下桃花坞的颜色——唱戏要淡，做人要浓，她搞反了一辈子',
    diary: '唱戏要淡，做人要浓。我搞反了一辈子。',
    diaryExcerpt:
      '如果不是这身道袍，陈妙常大概早就跑了。但她穿着它，只好把心事藏在袖子里。桃花坞的年画红得发烫、绿得冒烟。我散场后走到这里，满眼的颜色像打翻了妆奁。唱戏要淡，做人要浓——我搞反了一辈子。'
  },
  {
    stage: 7,
    prompt: '拍下星桥——你走完了她走过的路。这是最后一站',
    diary: '戏演完了，别鼓掌。安安静静走就好。',
    diaryExcerpt:
      '真话只说一次。你走完了我走过的路。那座园——水是盘门的，石是文庙的，窗是双塔的，漏窗是耦园的，桂花是平江路的，石头是桃花坞的，亭子是这里的。都是偷来的。但你走进来了，就算有人来过。'
  }
]
