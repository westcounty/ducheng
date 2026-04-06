# Shanghai Script 2 (墨迹) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the second Shanghai puzzle game script "墨迹" (Fuzhou Road literary theme) as a new playable city entry in the existing 读城 platform.

**Architecture:** The platform already supports N cities via a generic city system (dynamic store per cityId, lazy-loaded data modules, theme classes). We register "shanghai2" as a new city entry with its own `puzzles.js`, `narrative.js`, and theme CSS. No changes needed to router, store, or page components — they're already generic.

**Tech Stack:** Vue 3, Pinia, CSS custom properties, existing component library (NarrativeText, AnswerInput, HintSystem)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `app/src/data/cities/shanghai2/puzzles.js` | PROLOGUE + STAGES[0..7] puzzle data |
| Create | `app/src/data/cities/shanghai2/narrative.js` | INTRO_STORY, FINALE, PHOTO_DIARY_PAIRS, HEYING_CHECKLIST, STAGE_LOCATIONS |
| Modify | `app/src/data/cities/index.js` | Add shanghai2 city entry to CITIES array |
| Modify | `app/src/styles/theme.css` | Add `.theme-shanghai2` CSS variables (indigo/ivory ink theme) |

No changes to: `router.js`, `game.js`, `Home.vue`, `Prologue.vue`, `Stage.vue`, `Transit.vue`, `Finale.vue`, `Archive.vue`, `PlatformHome.vue`, `useCityData.js`. These are all already generic.

---

### Task 1: Register the new city

**Files:**
- Modify: `app/src/data/cities/index.js`

- [ ] **Step 1: Add shanghai2 entry to CITIES array**

In `app/src/data/cities/index.js`, add after the existing `shanghai` entry (line 10):

```js
  {
    id: 'shanghai2',
    name: '上海·福州路',
    scriptName: '墨迹',
    tagline: '一个编辑在一条街上藏了一本书',
    themeClass: 'theme-shanghai2',
    available: true,
    totalStages: 7
  },
```

Insert this as the second element in the CITIES array (between shanghai and nanjing).

- [ ] **Step 2: Verify the app still builds**

Run: `cd app && npm run build`
Expected: Build succeeds (will warn about missing data module, that's OK at this stage — the lazy import in `useCityData.js` will fail at runtime but won't break the build).

- [ ] **Step 3: Commit**

```bash
git add app/src/data/cities/index.js
git commit -m "feat: register shanghai2 (墨迹) city entry"
```

---

### Task 2: Add the ink theme

**Files:**
- Modify: `app/src/styles/theme.css`

- [ ] **Step 1: Add .theme-shanghai2 CSS variables**

Append after the `.theme-suzhou { ... }` block (after line ~465) in `app/src/styles/theme.css`:

```css
.theme-shanghai2 {
  --bg-primary: #f5f2eb;
  --bg-secondary: #eae5db;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a6a;
  --accent: #2c3e7a;
  --border: #b8b0a0;
  --success: #3a6b4a;
  --error: #8b2500;
  --font-display: 'Noto Serif SC', serif;
  --paper-texture:
    radial-gradient(ellipse at 30% 20%, rgba(44, 62, 122, 0.03) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 80%, rgba(74, 74, 106, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(184, 176, 160, 0.05) 0%, transparent 70%);
}
```

Design rationale: ivory background (`#f5f2eb`) with indigo/deep blue accent (`#2c3e7a`) — evokes ink and old paper. Contrast with Shanghai 1's warm brown palette.

- [ ] **Step 2: Commit**

```bash
git add app/src/styles/theme.css
git commit -m "feat: add .theme-shanghai2 ink-inspired color theme"
```

---

### Task 3: Create puzzles.js — PROLOGUE

**Files:**
- Create: `app/src/data/cities/shanghai2/puzzles.js`

- [ ] **Step 1: Create the data file with PROLOGUE**

Create `app/src/data/cities/shanghai2/puzzles.js`:

```js
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
  // No encryptedText / fragments — this prologue uses a different mechanism
  // than Shanghai 1's Caesar cipher. The puzzle is embedded in the physical
  // prop (rejection letter + proofreading symbol table + desk photo).
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
          '苏蕊的同事问："那本'又哭又笑'的书叫什么？"\n\n走进百新书局，找到以这本书命名的空间——它甚至把书名化用成了房间的名字。那本书叫什么？',
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
```

- [ ] **Step 2: Verify file syntax**

Run: `cd app && node -e "import('./src/data/cities/shanghai2/puzzles.js').then(m => console.log('OK:', m.TOTAL_STAGES, 'stages, prologue:', !!m.PROLOGUE))"`
Expected: `OK: 7 stages, prologue: true`

- [ ] **Step 3: Commit**

```bash
git add app/src/data/cities/shanghai2/puzzles.js
git commit -m "feat(shanghai2): add puzzles.js with prologue + 7 stages skeleton"
```

---

### Task 4: Create narrative.js

**Files:**
- Create: `app/src/data/cities/shanghai2/narrative.js`

- [ ] **Step 1: Create the narrative data file**

Create `app/src/data/cities/shanghai2/narrative.js`:

```js
/**
 * 墨迹 — Narrative data
 *
 * Second Shanghai script: Fuzhou Road literary theme.
 * Protagonist: Su Rui (苏蕊), 1930s female editor at World Book Bureau.
 *
 * Acrostic: 字里行间都是你
 * Full message: 书不会消失，它只是在等一个人重新翻开。你就是那个人。
 */

// ──────────────────────────────────────────────────────────────────────────
// Intro Story
// ──────────────────────────────────────────────────────────────────────────

export const INTRO_STORY = `你在福州路的一家旧书摊上买到了一本笔记本。

封面只写着两个字："墨迹"。翻开，是一个女人的字迹——工整、利落，偶尔在页边画一个小圆圈，像是在给自己的生活打分。

她叫苏蕊，1930年代世界书局的编辑。福州路390号，那栋红砖楼，是她每天上班的地方。

笔记本里有她的编辑手记、给作者的信、私人账本、甚至编辑室八卦。但有七页被撕掉了——只剩撕痕和页码。

笔记本里还夹着一封退稿信。字句漂亮得像散文。但你读着读着，觉得哪里不对——

有些字上面，有奇怪的校对符号。`

// ──────────────────────────────────────────────────────────────────────────
// Finale Data
// ──────────────────────────────────────────────────────────────────────────

/**
 * The complete message, reconstructed from all 7 fragments.
 * Correct fragment order (by card back numbers 1→7):
 *   back#1 = 书不会 (Stage 5)
 *   back#2 = 消失 (Stage 6)
 *   back#3 = 它只是在 (Stage 1)
 *   back#4 = 等一个人 (Stage 3)
 *   back#5 = 重新 (Stage 4)
 *   back#6 = 翻开 (Stage 2)
 *   back#7 = 你就是那个人 (Stage 7)
 *
 * Full message: 书不会消失，它只是在等一个人重新翻开。你就是那个人。
 */
export const FINALE = {
  fullMessage: '书不会消失，它只是在等一个人重新翻开。你就是那个人。',

  fragmentOrder: [
    { backNumber: 1, stageId: 5, fragment: '书不会' },
    { backNumber: 2, stageId: 6, fragment: '消失' },
    { backNumber: 3, stageId: 1, fragment: '它只是在' },
    { backNumber: 4, stageId: 3, fragment: '等一个人' },
    { backNumber: 5, stageId: 4, fragment: '重新' },
    { backNumber: 6, stageId: 2, fragment: '翻开' },
    { backNumber: 7, stageId: 7, fragment: '你就是那个人' }
  ],

  acrostic: {
    lines: [
      { stageId: 1, keyChar: '字', quote: '月饼二盒三元四角。这条街最甜的坐标。' },
      { stageId: 2, keyChar: '里', quote: '晨光里是琥珀，午后是铁锈，黄昏是干掉的玫瑰。三种红。' },
      { stageId: 3, keyChar: '行', quote: '入则墨香袭人，如坠旧梦。' },
      { stageId: 4, keyChar: '间', quote: '方寸之间藏着一座花园。' },
      { stageId: 5, keyChar: '都', quote: '1897年，一切从这里开始。' },
      { stageId: 6, keyChar: '是', quote: '一家书店有几种活法，就有几条命。' },
      { stageId: 7, keyChar: '你', quote: '从绮云阁望下去，整条福州路像一本摊开的书。' }
    ],
    characters: ['字', '里', '行', '间', '都', '是', '你'],
    hiddenMessage: '字里行间都是你',
    reveal: '字里行间都是你'
  },

  envelopePrompt: '现在，打开那个信封。',

  // Three-layer finale reveal
  revealLayers: [
    // Layer 1: The street IS the book
    '《墨迹集》从未出版。1937年8月13日，淞沪会战爆发，苏蕊再也没有回到福州路。\n\n但她藏下的那些文字，以各种形式存活了下来——变成了今天你走进的每一家书店的一部分。\n\n福州路本身，就是她编的那本书。',
    // Layer 2: You completed the book
    '你注意到了吗？笔记本里有七页空白。\n\n但它们不再是空白的了——你在杏花楼闻到的甜，你在红房子看到的砖，你在古籍铺深吸的那口气，你在博物馆前停下的那一刻……\n\n你今天填满了那七页。她写了前半本，你写了后半本。',
    // Layer 3: Acrostic reveal (the meta layer is in the physical prop — the review form in the envelope)
    '还有一件事。回去翻翻每篇日记的第一个字。'
  ],

  completionMessage:
    '字里行间都是你。\n\n从第一页开始，她就在跟你说话。\n\n——世界书局编辑部，苏蕊'
}

// ──────────────────────────────────────────────────────────────────────────
// Checklist & Location Data
// ──────────────────────────────────────────────────────────────────────────

export const HEYING_CHECKLIST = [
  '杏花楼的门面',
  '红砖楼的光线',
  '最美的书架角落',
  '方寸花园——墨模',
  '出版业诞生的拐角',
  '百新书局的一角',
  '回望福州路的方向'
]

export const STAGE_LOCATIONS = [
  '杏花楼',
  '外文书店',
  '古籍书店',
  '笔墨博物馆',
  '商务印书馆旧址',
  '百新书局',
  '永安百货'
]

// ──────────────────────────────────────────────────────────────────────────
// Photo-Diary Pairs
// ──────────────────────────────────────────────────────────────────────────

/**
 * diaryExcerpt: cryptic diary notes used as puzzle components.
 * First character of each diaryExcerpt forms the acrostic: 字里行间都是你
 *
 * Each diary uses a different literary style (see spec for details):
 * 1=ledger, 2=editorial marginalia, 3=classical notes, 4=letter,
 * 5=news report, 6=office gossip, 7=final editorial note
 */
export const PHOTO_DIARY_PAIRS = [
  {
    stage: 1,
    prompt: '拍下杏花楼——苏蕊说第一好闻是新书油墨，第二好闻就是这里',
    diary: '月饼二盒三元四角。这条街最甜的坐标。',
    diaryExcerpt:
      '字写在账本上就是数字，写在匾上就是历史。十一月十五，月饼二盒，三元四角。给赵先生寄一盒，剩一盒留编辑室。被主编骂"公款私用"。我说这是"读者关怀经费"。楼下那块匾的字比我编的任何一本书都老。这条街还叫四马路的时候，它就挂在那里了。'
  },
  {
    stage: 2,
    prompt: '拍下红砖楼——苏蕊叫它"红房子"，九十年了一块砖都没换',
    diary: '晨光里是琥珀，午后是铁锈，黄昏是干掉的玫瑰。三种红。',
    diaryExcerpt:
      '里弄里的人叫它"红房子"。我每天上班经过，数过那些砖的颜色——晨光里是琥珀，午后是铁锈，黄昏是干掉的玫瑰。三种红，看你什么时候来。墙上有几位先生一直站在那里，从不下班。比我们任何一个编辑都敬业。底楼的拱门有█个（墨水洇了），我最喜欢从东边那个进。'
  },
  {
    stage: 3,
    prompt: '拍下书架一角——苏蕊说"闻到墨香的地方就不会真正迷路"',
    diary: '入则墨香袭人，如坠旧梦。',
    diaryExcerpt:
      '行至古籍铺，入则墨香袭人，如坠旧梦。架上之书循四部之法：经、史、子、集，各有其所。余常于子部中寻得妙文——彼处多为诸子百家之言，最是不守规矩，恰合吾意。铺中有琴音若断若续，又有一香，名曰"博雅"，闻之心定。余每至此处，必先闻香，再触书脊，最后方开卷。'
  },
  {
    stage: 4,
    prompt: '拍下墨模——"方寸之间藏下一座花园"',
    diary: '方寸之间藏着一座花园。',
    diaryExcerpt:
      '间或去笔墨店逛逛，给赵先生回一封信。你上次来稿写到"墨分五色"，我查了——确实是焦、浓、重、淡、清。但你漏了最重要的一色：人的手温渗进墨锭的那种黑。博物馆里有两位老先生：一位姓周，生于康熙年间；一位姓曹，更老，比整个清朝都老。把那个墨模上的纹样数清楚。我赌你数不对。'
  },
  {
    stage: 5,
    prompt: '拍下这个拐角——中国现代出版业从这里开始，苏蕊从这里出发',
    diary: '1897年，一切从这里开始。',
    diaryExcerpt:
      '都说商务印书馆是中国现代出版的起点。我今天特地拐到河南路去看了一眼。1897年，几个排字工人在这个拐角开了一间小小的印刷作坊，谁知道后来印出了整套《四库全书》。铅字碰撞的声音——啪嗒啪嗒——像下了一场金属的雨。我录了一张声音清单，怕以后忘了。'
  },
  {
    stage: 6,
    prompt: '拍下百新的一角——一家活了一百年的书店，换了无数种活法',
    diary: '一家书店有几种活法，就有几条命。',
    diaryExcerpt:
      '是夜，编辑室闲聊。百新书局的老板又来炫耀——说张恨水先生的新书又加印了。那本书名字起得好，又哭又笑的，跟我们编辑室一模一样。百新最早是租书摊起家的，现在居然有好几间不同的屋子。这条街上的店，活下来的都有本事。活不下来的——连名字都没人记得了。'
  },
  {
    stage: 7,
    prompt: '最后一张——站在苏蕊站过的方向，回望福州路。你替她看了这条街',
    diary: '从绮云阁望下去，整条福州路像一本摊开的书。',
    diaryExcerpt:
      '你好。如果你读到这里，说明有人替我走完了福州路。一九三七年八月十二日，炮声已经能从虹口那边听到。我把最后一份目录藏在永安公司——不是因为那里安全，是因为从绮云阁望下去，能看到整条福州路。一笔是杏花楼的甜，一画是红房子的砖，一笔是旧书铺的香，一画是笔墨店的黑。书不会消失。它只是在等。'
  }
]
```

- [ ] **Step 2: Verify file syntax and acrostic correctness**

Run: `cd app && node -e "import('./src/data/cities/shanghai2/narrative.js').then(m => { console.log('Acrostic:', m.PHOTO_DIARY_PAIRS.map(p => p.diaryExcerpt[0]).join('')); console.log('Locations:', m.STAGE_LOCATIONS.length); console.log('Checklist:', m.HEYING_CHECKLIST.length); })"`
Expected:
```
Acrostic: 字里行间都是你
Locations: 7
Checklist: 7
```

- [ ] **Step 3: Commit**

```bash
git add app/src/data/cities/shanghai2/narrative.js
git commit -m "feat(shanghai2): add narrative.js with intro, finale, acrostic, diary pairs"
```

---

### Task 5: Verify full build and runtime

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build**

Run: `cd app && npm run build`
Expected: Build completes with no errors. Warnings about CRLF are OK.

- [ ] **Step 2: Run dev server and verify platform home shows the new city**

Run: `cd app && npm run dev`

Open `http://localhost:3000` in browser. Verify:
- PlatformHome shows "上海·福州路" card with script name "墨迹" and tagline
- Clicking the card navigates to `/city/shanghai2`
- CityHome shows the intro story text
- Clicking "接受任务" navigates to `/city/shanghai2/prologue`
- Prologue page loads correctly with the proofreading-symbol puzzle instruction
- Entering "福州路" as the answer is accepted
- After completing prologue, navigates to `/city/shanghai2/stage/1`
- Stage 1 (杏花楼) loads with correct instruction text

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(shanghai2): verify build passes for 墨迹 script"
```

Only create this commit if there are actual changes to commit (e.g., build artifacts or fixes found during verification). If the build passes clean with no changes, skip this commit.

---

### Task 6: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add shanghai2 to the city list in CLAUDE.md**

In the directory structure section, add `shanghai2/` to the cities list. In the "当前状态与注意事项" section, add a note about the new script.

Add to the cities directory listing:
```
│   ├── shanghai2/        # puzzles.js + narrative.js (墨迹·福州路)
```

Add to 当前状态与注意事项:
```
- **上海第二剧本「墨迹」骨架已完成**：福州路文艺主题，7站+序章数据就位，大量 `__FIELD__` 答案待踩线填入
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with shanghai2 (墨迹) entry"
```
