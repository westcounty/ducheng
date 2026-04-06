/**
 * 墨迹 — Stage puzzle data
 *
 * Second Shanghai script: Fuzhou Road literary theme.
 * Protagonist: Su Rui (苏蕊), 1930s female editor at World Book Bureau.
 * Player: contemporary reader who found her old notebook.
 *
 * STAGES is 1-indexed; STAGES[0] is null, STAGES[1]–STAGES[7] contain stage data.
 * Answers marked __FIELD__ must be verified during fieldwork.
 *
 * Design principles:
 *   - Each station has a primary sense (taste/sight/smell/touch/hearing/composite/ritual)
 *   - Diary entries use 7 different literary styles
 *   - Props cross-reference each other (proofreading symbols + photo + notebook)
 *   - V3 triangulation: App metaphor + prop/diary method + environment data
 */

// ══════════════════════════════════════════════════════════════════════════════
// PROLOGUE — Stage 0 (solved at home, before departing)
// Concept: proofreading-symbol cipher on a rejection letter
// ══════════════════════════════════════════════════════════════════════════════

export const PROLOGUE = {
  title: '退稿',
  subtitle: '一封跨越九十年的退稿信',
  step: {
    id: '0-1',
    title: '校对符号',
    instruction:
      '笔记本里夹着一封退稿信——字句漂亮，但有些字被校对符号标过。\n\n翻到笔记本第3页，有一张"苏蕊的校对符号密码表"。表底写着："按老规矩，从第█个标记起读——数数我书桌上那摞书。"\n\n书桌旧照片夹在笔记本封底内页。数清那摞书，回到退稿信上，用密码表解读标记。她藏了一条路。',
    answerType: 'text',
    answer: '福州路',
    hints: [
      '先找到笔记本封底夹的旧照片。书桌上有一摞书——数清楚，这个数字就是"从第几个标记起读"。',
      '用照片上的数字作为起始位置，从退稿信上的第N个校对标记开始，用密码表逐个转换。',
      '答案是三个字：福州路。上海的文化第一街。'
    ]
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// STAGES 1–7
// ══════════════════════════════════════════════════════════════════════════════

export const STAGES = [
  null, // index 0 — unused

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 1: 杏花楼 — TASTE / SMELL
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 1,
    title: '杏花楼',
    location: '杏花楼（福州路总店）',
    address: '福州路343号',
    photoPrompt: '拍下杏花楼——苏蕊说第一好闻是新书油墨，第二好闻就是这里',
    photoSubject: '杏花楼门面或招牌匾额',
    diaryQuote: '月饼二盒三元四角。这条街最甜的坐标。',
    cipherFragment: '它只是在',
    cardBackNumber: 3,
    steps: [
      {
        id: '1-1',
        title: '匾上的年纪',
        instruction:
          '日记说这家店的招牌"比她编过的任何一本书都老"。\n\n抬头看——那块匾上，有没有年份或数字？找到它。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '匾不是灯箱招牌。往上看，找最古老的那块字。',
          '杏花楼创始于清代，匾上可能有年号、公元年份或创始字样。',
          '__FIELD__'
        ]
      },
      {
        id: '1-2',
        title: '第二好闻的味道',
        instruction:
          '苏蕊说："世界上第二好闻的味道就是杏花楼的月饼。"\n\n站在门口，深吸一口气。道具袋里有一张"气味卡"，上面写了四种气味描述——选出你真正闻到的那一种。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '真的闻。不是猜。站在杏花楼门口，集中注意力。',
          '四个选项中只有一个描述的是糕点/烘焙类气味。',
          '__FIELD__'
        ]
      },
      {
        id: '1-3',
        title: '最甜的坐标',
        instruction:
          '拍一张杏花楼的门面。苏蕊说这是"这条街最甜的坐标"。\n\n她的编辑室就在这条路上，不远。',
        answerType: 'confirm',
        skipVerification: true,
        hints: []
      }
    ],
    transition: {
      clue: '退稿信里提到过"红房子"——不是那家西餐厅。这栋红色的房子里，曾经住着一整个世界的文字。',
      nextLocation: '外文书店（世界书局旧址）',
      hint: '沿福州路向西步行约3分钟，路北侧，找一栋红砖建筑。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 2: 外文书店 / 世界书局旧址 — SIGHT
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 2,
    title: '外文书店',
    location: '外文书店（世界书局旧址）',
    address: '福州路390号',
    photoPrompt: '拍下红砖楼——苏蕊叫它"红房子"，九十年了一块砖都没换',
    photoSubject: '外文书店红砖外立面',
    diaryQuote: '晨光里是琥珀，午后是铁锈，黄昏是干掉的玫瑰。三种红。',
    cipherFragment: '翻开',
    cardBackNumber: 6,
    steps: [
      {
        id: '2-1',
        title: '不下班的先生们',
        instruction:
          '苏蕊说墙上有几位先生"一直站在那里，从不下班"。\n\n抬头看这栋红砖楼的外墙。她说的"先生们"是什么？数一数，一共几位？',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '"先生们"不是真人。什么东西能"一直站在墙上不下班"？',
          '看建筑外墙上的装饰——有没有人形的雕塑或浮雕？',
          '__FIELD__'
        ]
      },
      {
        id: '2-2',
        title: '被墨水洇掉的数字',
        instruction:
          '日记里说底楼的拱门有█个——"墨水洇了"。\n\n你替她数一数。帮她补上这个数字。',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '站在马路对面看整栋楼的底层。拱形的入口有几个？',
          '数所有可以走进去的拱形门洞，包括侧面的。',
          '__FIELD__'
        ]
      },
      {
        id: '2-3',
        title: '苏蕊的上班路',
        instruction:
          '苏蕊每天从这栋楼的某个门走进去上班。\n\n拍一张你觉得她会走的那个门。',
        answerType: 'confirm',
        skipVerification: true,
        hints: []
      }
    ],
    transition: {
      clue: '红房子对面，有一座刚刚醒过来的老书店。苏蕊说："走进去，你能闻到时间的味道。"',
      nextLocation: '上海古籍书店',
      hint: '过马路，向西走几步。路南侧，福州路401号。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 3: 上海古籍书店 — SMELL
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 3,
    title: '古籍书店',
    location: '上海古籍书店',
    address: '福州路401号',
    photoPrompt: '拍下书架一角——苏蕊说"闻到墨香的地方就不会真正迷路"',
    photoSubject: '古籍书店内部书架或线装书展示',
    diaryQuote: '入则墨香袭人，如坠旧梦。',
    cipherFragment: '等一个人',
    cardBackNumber: 4,
    steps: [
      {
        id: '3-1',
        title: '四部之法',
        instruction:
          '苏蕊说她常在"██部"中找到最不守规矩的文章。\n\n中国古籍分四部：经、史、子、集。"诸子百家之言，最是不守规矩"——是哪一部？在店里找到它所在的楼层。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '经=儒家经典，史=历史，子=诸子百家，集=文学作品。哪一部"最不守规矩"？',
          '子部。庄子、墨子、韩非子……全在这一部。找找它在哪一层。',
          '__FIELD__'
        ]
      },
      {
        id: '3-2',
        title: '闻香识名',
        instruction:
          '日记里说店中有一种定制香，"名曰██，闻之心定"。\n\n闭上眼，先深吸一口气——这就是苏蕊说的"时间的味道"。然后在店里找到这种香的名字。两个字。',
        answerType: 'text',
        answer: '博雅',
        hints: [
          '在店里转转，留意香薰展示区或收银台附近的标注。',
          '这种香的名字和"博学雅正"有关。两个字。',
          '博雅。由扬州非遗传承人调配的定制香。'
        ]
      },
      {
        id: '3-3',
        title: '闻香·触书·开卷',
        instruction:
          '苏蕊读书有三步：闻香、触书脊、开卷。你也试一次。\n\n找一本线装书，轻轻摸一下书脊（不翻开）。然后拍一张你觉得最美的书架角落。',
        answerType: 'confirm',
        skipVerification: true,
        hints: []
      }
    ],
    transition: {
      clue: '苏蕊的秃头狼毫笔是在附近一家老字号买的——那里有四百年的笔和三百年的墨，全装在一个免费的小博物馆里。',
      nextLocation: '上海笔墨博物馆',
      hint: '继续沿福州路向西，路北侧，429号。门口不起眼，别走过了。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 4: 上海笔墨博物馆 — TOUCH
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 4,
    title: '笔墨博物馆',
    location: '上海笔墨博物馆',
    address: '福州路429号',
    photoPrompt: '拍下墨模——"方寸之间藏下一座花园"',
    photoSubject: '墨模展柜细节',
    diaryQuote: '方寸之间藏着一座花园。',
    cipherFragment: '重新',
    cardBackNumber: 5,
    steps: [
      {
        id: '4-1',
        title: '两位老先生',
        instruction:
          '苏蕊说博物馆里有两位"老先生"：一位姓周，"生于康熙年间"；一位姓曹，"比整个清朝都老"。\n\n找到这两个品牌的创始年份。用较大的减去较小的——差值是多少？',
        answerType: 'number',
        answer: 79,
        hints: [
          '"姓周"和"姓曹"——这是两个笔墨老字号的创始人姓氏。展板上会有创始年份。',
          '周虎臣和曹素功。找到各自的创始年份牌。',
          '曹素功始于1615年，周虎臣始于1694年。1694−1615＝79。'
        ]
      },
      {
        id: '4-2',
        title: '狼毫的脾气',
        instruction:
          '苏蕊说她的笔是狼毫，"硬的，跟我脾气一样"。\n\n道具袋里有一张"笔毫对照卡"，写了三种笔毫的特征。对照展柜里的实物——哪种是狼毫？',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '三种常见笔毫：狼毫（黄鼠狼尾）、羊毫（山羊毛）、兼毫（混合）。哪种最硬？',
          '看颜色和质地。狼毫通常颜色偏黄棕、毛尖锋利挺直。',
          '__FIELD__'
        ]
      },
      {
        id: '4-3',
        title: '方寸花园',
        instruction:
          '苏蕊赌你"数不对"——找到展柜中最精致的一方墨模，数一数主纹样中有多少个重复元素。\n\n"墨模是世界上最小的雕版——能在方寸之间藏下一座花园的人，才懂什么叫编辑。"',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '找那方最引人注目的墨模——通常在展厅中央或单独展柜里。',
          '数主纹样的重复元素：龙爪、花瓣、云纹……选最明显的那种重复单元。',
          '__FIELD__'
        ]
      }
    ],
    transition: {
      clue: '苏蕊说："所有书的起点在一条小巷的拐角。"从福州路拐进旁边的小路——1897年，中国现代出版业从那里开始。',
      nextLocation: '商务印书馆旧址',
      hint: '沿福州路走到与河南中路的路口，向南拐入河南中路，步行约3分钟到221号。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 5: 商务印书馆旧址 — HEARING
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 5,
    title: '商务印书馆旧址',
    location: '商务印书馆发行所旧址',
    address: '河南中路221号',
    photoPrompt: '拍下这个拐角——中国现代出版业从这里开始，苏蕊从这里出发',
    photoSubject: '商务印书馆旧址建筑外观',
    diaryQuote: '1897年，一切从这里开始。',
    cipherFragment: '书不会',
    cardBackNumber: 1,
    steps: [
      {
        id: '5-1',
        title: '拐角的起点',
        instruction:
          '从福州路拐进河南中路——苏蕊说"1897年，一切从这里开始"。\n\n找到这栋建筑。它现在可能变了模样，但骨架还在。观察外立面——几层楼？',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '河南中路221号，在福州路口附近。找一栋有年代感的西式建筑。',
          '这栋楼现在可能是酒店或商铺。数一数外立面的窗户层数。',
          '__FIELD__'
        ]
      },
      {
        id: '5-2',
        title: '九十年前的声音',
        instruction:
          '道具袋里有一张"声音清单"——苏蕊列了五种她在1936年福州路听到的声音。\n\n现在，站在这里，闭上眼睛，听30秒。你能听到几种属于2026年的声音？在感官记录卡上写下来，跟苏蕊的清单对比。',
        answerType: 'confirm',
        skipVerification: true,
        hints: [
          '真的闭眼。30秒。注意远处和近处的声音层次。',
          '苏蕊的清单上有：印刷机节奏、铅字碰撞声、书店吆喝、翻书声、黄包车铃。你的呢？',
          '没有标准答案——这是属于你的声音记录。'
        ]
      },
      {
        id: '5-3',
        title: '消失的声音',
        instruction:
          '苏蕊的声音清单里，有一项被她圈了起来，旁边批注："这个声音消失了就真的没了。"\n\n五种声音里，哪一种在2026年已经彻底消失了？',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '五种声音：印刷机、铅字碰撞、书店吆喝、翻书声、黄包车铃。哪些在今天完全听不到了？',
          '铅字排版已经被电脑排版完全取代。那种金属碰撞声……',
          '__FIELD__'
        ]
      }
    ],
    transition: {
      clue: '苏蕊的同事们下班后最爱去一家书店——不是因为书多，是因为那里的老板会讲故事。一百年了，书店还在，只是换了好几种活法。',
      nextLocation: '百新书局',
      hint: '回到福州路，继续向西步行约7分钟到620号。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 6: 百新书局 — COMPOSITE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 6,
    title: '百新书局',
    location: '百新书局',
    address: '福州路620号',
    photoPrompt: '拍下百新的一角——一家活了一百年的书店，换了无数种活法',
    photoSubject: '百新书局内部或门面',
    diaryQuote: '一家书店有几种活法，就有几条命。',
    cipherFragment: '消失',
    cardBackNumber: 2,
    steps: [
      {
        id: '6-1',
        title: '又哭又笑的书',
        instruction:
          '苏蕊的同事问："那本\'又哭又笑\'的书叫什么？"\n\n走进百新书局，找到以这本书命名的空间——它甚至把书名化用成了房间的名字。那本书叫什么？',
        answerType: 'text',
        answer: '啼笑因缘',
        hints: [
          '"又哭又笑"——啼＝哭，笑＝笑。这是民国最畅销的长篇小说之一。',
          '作者张恨水。百新书局是这本书的首发出版方。',
          '啼笑因缘。百新书局里有个叫"啼笑音缘"的音乐空间。'
        ]
      },
      {
        id: '6-2',
        title: '五感回顾',
        instruction:
          '感官记录卡上有六格：味、视、嗅、触、听、综合。前五站你各填了一格。\n\n现在坐下来，在第六格写一句话：福州路给你的整体感觉是什么？\n\n不用标准答案。这是属于你的。',
        answerType: 'confirm',
        skipVerification: true,
        hints: []
      },
      {
        id: '6-3',
        title: '几种活法',
        instruction:
          '百新书局现在有几个不同风格的主题空间？逛一圈，数一数。\n\n苏蕊说："一家书店有几种活法，就有几条命。"',
        answerType: 'number',
        answer: 6,
        hints: [
          '每个空间都有自己的名字和主题。从入口开始走一圈。',
          '百物一新、饱读Bookstro、饱读书房、汇丰纸行、啼笑音缘、百新播客——数数。',
          '6个。'
        ]
      }
    ],
    transition: {
      clue: '苏蕊日记的最后一页写道："如果有人找到了所有碎片，请到路口那栋最高的楼上去。从绮云阁望下来，整条福州路像一本摊开的书。"',
      nextLocation: '永安百货',
      hint: '从百新书局出来，向北走穿过一个街区至南京东路步行街，向东走至635号。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 7: 永安百货 — RITUAL / FINALE
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 7,
    title: '永安百货',
    location: '永安百货（绮云阁）',
    address: '南京东路635号',
    photoPrompt: '最后一张——站在苏蕊站过的方向，回望福州路。你替她看了这条街',
    photoSubject: '永安百货外观或从永安百货方向望向福州路',
    diaryQuote: '从绮云阁望下去，整条福州路像一本摊开的书。',
    cipherFragment: '你就是那个人',
    cardBackNumber: 7,
    steps: [
      {
        id: '7-1',
        title: '一百年没换班的柱子',
        instruction:
          '永安百货门前有一排柱子——从1918年站到现在，一百多年没换过班。\n\n观察柱头：如果看到卷曲的涡旋纹，那就是爱奥尼克柱。正门一共几根？',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '看柱子顶端——有没有像卷起纸页一样的涡旋装饰？',
          '这种柱式叫爱奥尼克柱（Ionic），特征是柱头有两个对称涡卷。',
          '__FIELD__'
        ]
      },
      {
        id: '7-2',
        title: '绮云阁',
        instruction:
          '抬头看楼顶——那座塔叫"绮云阁"。苏蕊说它是"这条街的句号"。\n\n描述你看到的：旗杆？钟？尖顶？圆顶？柱廊？',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '从街面仰视楼顶最高处。绮云阁是大楼上方的装饰性塔楼。',
          '它不是中国传统的塔——是西洋古典风格。描述你看到的形状和特征。',
          '__FIELD__'
        ]
      },
      {
        id: '7-3',
        title: '最后一笔',
        instruction:
          '转身面朝南方——福州路的方向。\n\n你刚走完了一整本书。拍最后一张照。\n\n然后，打开信封。',
        answerType: 'confirm',
        skipVerification: true,
        hints: []
      }
    ],
    transition: null // Final stage — no transition
  }
]

export const TOTAL_STAGES = 7

export function getStage(id) {
  const n = Number(id)
  return (n >= 1 && n <= TOTAL_STAGES) ? STAGES[n] : null
}
