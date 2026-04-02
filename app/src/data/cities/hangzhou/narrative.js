/**
 * 断桥不断 — Narrative data
 * Finale acrostic, intro story, and photo-diary pairing data
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `西泠印社的地下书库中，发现了一卷残破的手稿——纸质鉴定为南宋，但内容不是任何已知版本的白蛇传。更怪的是：这份手稿不是人类写的视角。它的叙述者是蛇。

所有流传的版本都是"人类讲蛇的故事"。这是唯一一份"蛇在讲人类的故事"。

手稿只剩七页残页，散落在西湖沿岸七处。每一页用不同的文体写成——游记、诗注、茶谱、判词、工匠手记、佛偈——仿佛书写者在模仿她遇到的每一种人的说话方式。第七页几乎是空白的，只有墨渍和水渍。

一位研究员注意到：七页残页的首字连在一起，不像是巧合。

从断桥开始。`

// ──────────────────────────────────────────────────────────────────────────
// Finale Data
// ──────────────────────────────────────────────────────────────────────────

/**
 * The complete cipher message, reconstructed from all 7 fragments.
 * Full message: 我见过一千年的西湖。但值得留下来的理由，只需要一个下午就够了。
 */
export const FINALE = {
  /**
   * The complete reconstructed message
   */
  fullMessage: '我见过一千年的西湖。但值得留下来的理由，只需要一个下午就够了。',

  /**
   * Fragment assembly order: array of { backNumber, stageId, fragment }
   * sorted by card back number (1–7)
   */
  fragmentOrder: [
    { backNumber: '__FIELD__', stageId: 1, fragment: '我见过' },
    { backNumber: '__FIELD__', stageId: 2, fragment: '一千年的' },
    { backNumber: '__FIELD__', stageId: 3, fragment: '西湖' },
    { backNumber: '__FIELD__', stageId: 4, fragment: '但值得' },
    { backNumber: '__FIELD__', stageId: 5, fragment: '留下来的' },
    { backNumber: '__FIELD__', stageId: 6, fragment: '理由只需要' },
    { backNumber: '__FIELD__', stageId: 7, fragment: '一个下午就够了' }
  ],

  /**
   * Acrostic puzzle data for the finale reveal layer
   * The first characters of each manuscript page spell out a hidden message.
   * 湖 心 有 一 人 未 走 → 湖心有一人未走
   */
  acrostic: {
    /**
     * Each line: the manuscript opening for that stage, with the key character highlighted
     * The key character forms the hidden acrostic message
     */
    lines: [
      { stageId: 1, keyChar: '湖', quote: '湖面很大。比我记忆中的大。可能是因为我以前总在水底看。' },
      { stageId: 2, keyChar: '心', quote: '心里有一种说不出的东西。在山上遇到一块石头，上面刻着一首诗。' },
      { stageId: 3, keyChar: '有', quote: '有一种植物的叶子。他们摘下来，烤干，泡在热水里喝。' },
      { stageId: 4, keyChar: '一', quote: '一件我完全无法理解的事。有个人死了八百年。他们为他建了一座庙。' },
      { stageId: 5, keyChar: '人', quote: '人会死。这我知道。但有个人死了快一千年了，他修的这条路还在。' },
      { stageId: 6, keyChar: '未', quote: '未曾有过这种感觉。安静。不是山洞里的安静——那种安静是空的。这种安静是满的。' },
      { stageId: 7, keyChar: '走', quote: '走不了了……' }
    ],
    /**
     * Reading the keyChar of each line in stage order spells the hidden message
     */
    characters: ['湖', '心', '有', '一', '人', '未', '走'],
    hiddenMessage: '湖心有一人未走',
    reveal: '湖心有一人未走'
  },

  /**
   * Envelope prompt shown at the finale — instructions for the physical prop
   */
  envelopePrompt: '现在，打开那个信封。',

  /**
   * The seventh manuscript page content (inside the sealed envelope)
   */
  seventhPage: `前六种是我在你们身上看到的。第七种是我自己的——不舍。

我观察了你们一千年，以为自己什么都懂了。变成人的第一天我才知道，懂和心疼不是一回事。

没有人把我关在塔下。是我自己留下来的。不是为了他——他已经不在了。

我留下来是因为，变成人的那几年里，我学会了一件蛇永远学不会的事：在乎一个地方。

我舍不得走。`,

  /**
   * Completion message shown after the player confirms the full message
   */
  completionMessage:
    '手稿复原完成。\n\n七页残页，七种文体，一条蛇写的人类观察笔记。\n\n湖心有一人未走。\n\n——她没有走。她自愿留下来，因为她舍不得这片湖。'
}

// ──────────────────────────────────────────────────────────────────────────
// Checklist & Location Data
// Shared between Finale and Archive pages
// ──────────────────────────────────────────────────────────────────────────

/**
 * White Snake's 7 observations about human qualities — the checklist items shown in Finale and Archive.
 * Each item is a quality she discovered through observing humans at that station.
 */
export const BAISUZHEN_CHECKLIST = [
  '他们称之为选择',
  '他们称之为陪伴',
  '他们称之为耐心',
  '他们称之为忠诚',
  '他们称之为建造',
  '他们称之为信仰',
  '不是塔困住了她。是她不舍得走'
]

/** Location name for each stage (index 0 = stage 1) */
export const STAGE_LOCATIONS = [
  '断桥',
  '孤山/西泠印社',
  '龙井村',
  '岳王庙',
  '苏堤六桥',
  '净慈寺',
  '雷峰塔'
]

// ──────────────────────────────────────────────────────────────────────────
// Photo-Diary Pairs
// Used in the Archive page to display each stage photo alongside its diary quote
// ──────────────────────────────────────────────────────────────────────────

/**
 * @type {Array<{stage: number, prompt: string, diary: string, diaryExcerpt: string, annotation: string}>}
 *
 * `annotation` is White Snake's caption for the player's photo, revealed in the finale.
 * The last station (雷峰塔) shows Xu Xian's handwriting instead.
 */
export const PHOTO_DIARY_PAIRS = [
  {
    stage: 1,
    prompt: '拍下断桥——她说"他们的命只有几十年，却还敢在桥上犹豫"',
    diary: '湖面很大。比我记忆中的大。可能是因为我以前总在水底看。今天我假装是一个游客。一个人朝我笑了。我不知道该怎么办，就也笑了。好像答对了——她没有跑。',
    diaryExcerpt:
      '桥上很多人。他们在一座断了名字的桥上走来走去。我听到一个人说"断桥其实不断"。那它为什么叫断桥？人类的语言真的很麻烦。道具卡上列出了"断桥"名字的三种民间解释——找到石碑，看看哪种有实物依据。',
    annotation: '他们称之为选择'
  },
  {
    stage: 2,
    prompt: '拍下放鹤亭——她说"种梅的人说鹤是妻子，他不是疯了，他是认真的"',
    diary: '心里有一种说不出的东西。他说鹤是他的妻子。我一开始觉得他疯了。后来我想了很久——他不是疯了，他是认真的。认真和疯了，在人类那里好像是同一件事。',
    diaryExcerpt:
      '在山上遇到一块石头，上面刻着一首诗。写诗的人已经死了很久了。但他种的梅花还活着——不对，梅花也死了。但有人又种了新的。我也试着写了一首诗。写得很烂。但是我写得很认真。',
    annotation: '他们称之为陪伴'
  },
  {
    stage: 3,
    prompt: '拍下茶园——她说"人类把叶子泡在水里，等苦味变甜。他们管这叫耐心"',
    diary: '有一种植物的叶子。他们摘下来，烤干，泡在热水里喝。我偷偷尝了一口——是苦的。但他们喝的时候表情很安静。不是忍耐的安静，是享受的安静。',
    diaryExcerpt:
      '后来一个老人对我说："第一口是苦的，第二口是甜的。你要等。"我等了。第二口还是苦的。但我好像懂了一点点——他们享受的不是味道，是等待本身。他们管这叫"耐心"。',
    annotation: '他们称之为耐心'
  },
  {
    stage: 4,
    prompt: '拍下跪着的铁人——她说"他死了八百年，他们还在替他生气。这不理性。"',
    diary: '一件我完全无法理解的事。有个人死了八百年。他们为他建了一座庙。在庙门前放了几个铁人，跪在那里。铁人跪了八百年，膝盖都磨薄了。',
    diaryExcerpt:
      '我问一个老人："他做了什么？"老人说："他精忠报国。"我说："然后呢？"老人说："然后他被冤枉死了。"这不合理。一个死了的人，怎么会比活着的人更重要？但是我站在那里看了很久，我竟然——眼睛里有水。这是第一次。',
    annotation: '他们称之为忠诚'
  },
  {
    stage: 5,
    prompt: '拍下苏堤——她说"他们活不过一棵树，但他们种树"',
    diary: '人会死。这我知道。但有个人死了快一千年了，他修的这条路还在。路上种的树也还在——不是原来那些树，是后来的人又种的。',
    diaryExcerpt:
      '他写的诗，别人还在念。但让我吃惊的不是诗——是这条堤。诗可以不写，堤不能不修。西湖水淹进城里，人会淹死。他是来写诗的，最后去挖泥了。我忽然很想为一个人做一件没用的事。不是因为有用，是因为想做。',
    annotation: '他们称之为建造'
  },
  {
    stage: 6,
    prompt: '拍下寺门——她说"钟声停了之后他们还在听。他们听的不是声音，是回响"',
    diary: '未曾有过这种感觉。安静。不是山洞里的安静——那种安静是空的。这种安静是满的。',
    diaryExcerpt:
      '钟声响了。很大声。然后停了。但他们没有走——所有人都还站在那里。他们在听什么？钟已经不响了。后来我也听到了。钟声停了之后，空气里还有东西在振动。不是声音，是声音的影子。他们管这叫"回响"。',
    annotation: '他们称之为信仰'
  },
  {
    stage: 7,
    prompt: '拍下雷峰塔——不是塔困住了她。是她不舍得走',
    diary: '走不了了……',
    diaryExcerpt:
      '（这一页几乎是空白的。只有三个字，然后是墨渍。像是笔尖停在纸上太久，墨水洇开了。纸的下半部分有几处水渍——不是雨水。更像是有什么东西从很近的地方滴下来的。）',
    annotation: '我知道你还在。——许仙'
  }
]
