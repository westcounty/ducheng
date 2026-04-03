# 「姑苏折子」苏州城市解谜游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Suzhou city puzzle game ("姑苏折子") including app data, narrative content, printable prop templates, and fieldwork checklist — following the design spec at `docs/superpowers/specs/2026-04-03-suzhou-puzzle-game-design.md`.

**Architecture:** Each city is a self-contained data module (`puzzles.js` + `narrative.js`) loaded dynamically by the Vue app. Narrative content lives as Markdown in `content/suzhou/`. Printable props are HTML templates in `props/suzhou/templates/` rendered to PDF by Puppeteer. The city registers itself in the shared city index and cross-city thread system.

**Tech Stack:** Vue 3, JavaScript (ES modules), HTML/CSS (print-ready prop templates), Markdown (content files), Puppeteer (PDF generation)

---

## File Map

### App Data (create)
- `app/src/data/cities/suzhou/puzzles.js` — 7-stage puzzle definitions with steps, answers, hints
- `app/src/data/cities/suzhou/narrative.js` — intro story, finale, acrostic, photo-diary pairs, locations

### App Data (modify)
- `app/src/data/cities/index.js` — add Suzhou to CITIES array
- `app/src/data/cross-city-threads.js` — replace xian→shanghai with xian→suzhou + suzhou→shanghai

### Content (create)
- `content/suzhou/diary-1-panmen.md` — 站1日记：场记/走台笔记
- `content/suzhou/diary-2-wenmiao.md` — 站2日记：唱词旁批
- `content/suzhou/diary-3-shuangta.md` — 站3日记：妆台碎语
- `content/suzhou/diary-4-ouyuan.md` — 站4日记：致某人的未寄信
- `content/suzhou/diary-5-pingjiang.md` — 站5日记：戏班账册夹注
- `content/suzhou/diary-6-taohuawu.md` — 站6日记：散场后园中独白
- `content/suzhou/diary-7-shantang.md` — 站7日记：空白页上自己的话
- `content/suzhou/cipher-fragments.md` — 密电片段分割与排列映射
- `content/suzhou/riddles-and-clues.md` — 过渡线索与子谜题详解
- `content/suzhou/envelope-letter.md` — 沈云筝最后的信
- `content/suzhou/envelope-garden-blueprint.md` — 不可能的园·蓝图文字描述
- `content/suzhou/envelope-blank-ticket.md` — 空白戏票

### Props (create)
- `props/suzhou/templates/cipher-cards.html` — 7张密电卡片（正面戏词/背面编号+密电片段+造园指令）
- `props/suzhou/templates/diary-pages.html` — 7篇日记页
- `props/suzhou/templates/envelope-contents.html` — 信封内容（信+蓝图+戏票）
- `props/suzhou/templates/waterway-map.html` — 旧城水道图（导航+站1解密）
- `props/suzhou/templates/costume-color-cards.html` — 戏衫色卡×7
- `props/suzhou/templates/rubbing-overlay.html` — 碑文拓片+桃红滤镜
- `props/suzhou/templates/half-window-card.html` — 花窗卡（半幅镜像）
- `props/suzhou/templates/window-catalog.html` — 窗谱卡
- `props/suzhou/templates/opera-catalog.html` — 折子戏目录折页
- `props/suzhou/templates/woodblock-base.html` — 年画底版
- `props/suzhou/templates/color-overlays.html` — 三色透明片打印指引
- `props/suzhou/templates/garden-blueprint.html` — 园林底图

### Fieldwork (create)
- `fieldwork/suzhou-checklist.md` — 实地踩点清单

---

## Task 1: City Registration & Cross-City Threads

**Files:**
- Modify: `app/src/data/cities/index.js`
- Modify: `app/src/data/cross-city-threads.js`

- [ ] **Step 1: Add Suzhou to city index**

In `app/src/data/cities/index.js`, add before the closing `]` of the CITIES array:

```javascript
  {
    id: 'suzhou',
    name: '苏州',
    scriptName: '姑苏折子',
    tagline: '她演了一辈子别人的戏，只有苏州记得她自己的台词',
    themeClass: 'theme-suzhou',
    available: true,
    totalStages: 7
  }
```

- [ ] **Step 2: Update cross-city threads**

In `app/src/data/cross-city-threads.js`, replace the existing `xian → shanghai` entry:

```javascript
  // REMOVE this entry:
  {
    from: 'xian',
    to: 'shanghai',
    quote: '有人说东海尽头有个渔港，将来也许会变成大城。我到不了那么远。',
    source: '康安旅记·第七站·大雁塔',
    character: '康安'
  }

  // REPLACE with these two entries:
  {
    from: 'xian',
    to: 'suzhou',
    quote: '东边有个地方叫姑苏，听说那里的人把戏唱进了园子里，连石头假山都会听戏。',
    source: '康安旅记·第七站·大雁塔',
    character: '康安'
  },
  {
    from: 'suzhou',
    to: 'shanghai',
    quote: '听说松江那边在修港口，洋人带来了一种会动的皮影。不知道还需不需要唱戏的人。',
    source: '沈云筝账册·第五站·平江路',
    character: '沈云筝'
  }
```

- [ ] **Step 3: Verify the 5-city loop is correct**

Trace the `from → to` chain: shanghai→nanjing→hangzhou→xian→suzhou→shanghai. All 5 cities are covered and form a closed loop.

- [ ] **Step 4: Commit**

```bash
git add app/src/data/cities/index.js app/src/data/cross-city-threads.js
git commit -m "feat: register Suzhou city and update cross-city thread loop to 5 cities"
```

---

## Task 2: Puzzle Data (puzzles.js)

**Files:**
- Create: `app/src/data/cities/suzhou/puzzles.js`

- [ ] **Step 1: Create suzhou directory**

```bash
mkdir -p app/src/data/cities/suzhou
```

- [ ] **Step 2: Write puzzles.js**

Create `app/src/data/cities/suzhou/puzzles.js`. Follow exact structure of `app/src/data/cities/shanghai/puzzles.js`:
- 1-indexed STAGES array (STAGES[0] = null)
- Each stage: id, title, location, address, photoPrompt, photoSubject, diaryQuote, cipherFragment, cardBackNumber, steps[], transition{}
- Each step: id (format 'N-M'), title, instruction, answerType ('number'|'text'|'confirm'), answer, hints[3], skipVerification (optional)
- Answers not yet field-verified use `'__FIELD__'`

Full content for all 7 stages:

```javascript
/**
 * 姑苏折子 — Stage puzzle data
 *
 * STAGES is 1-indexed; STAGES[0] is null, STAGES[1]–STAGES[7] contain stage data.
 * Answers marked __FIELD__ must be verified during fieldwork.
 */

export const STAGES = [
  null, // index 0 — unused

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 1: 盘门·吴门桥
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 1,
    title: '盘门·吴门桥',
    location: '吴门桥及盘门外运河沿岸',
    address: '盘门路（盘门景区西南侧），吴门桥跨运河',
    photoPrompt: '拍下吴门桥的倒影——她在水里看见过另一个自己，那个不用唱戏的自己',
    photoSubject: '吴门桥桥洞及水面倒影',
    diaryQuote:
      '她在水里看见过另一个自己，那个不用唱戏的自己。',
    cipherFragment: '台上的人散了',
    cardBackNumber: 1,
    steps: [
      {
        id: '1-1',
        title: '数桥洞',
        instruction:
          '站在吴门桥一侧，数清这座桥有几个桥洞。「赵五娘数过多少次月亮从桥洞里升起——你替她数数这座桥有几个眼睛。」',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '站在桥的一侧，从河岸上看清水面上方的拱洞。',
          '这是一座多孔石拱桥，苏州最大的单拱/多拱古桥之一。',
          '参考答案区间：1-5个。'
        ]
      },
      {
        id: '1-2',
        title: '倒影折叠',
        instruction:
          '取出道具「旧城水道图」，找到标记"吴门桥"的区域。图上有半幅图案——将纸沿中线对折，上下镜像拼出完整汉字。「水里的倒影会告诉你怎么看这张纸。」',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '沿图上标注的虚线对折，让上半部分与下半部分重合。',
          '透光看——上下镜像构成一个完整的汉字。',
          '直接给出答案。'
        ]
      },
      {
        id: '1-3',
        title: '桥上寻字',
        instruction:
          '在吴门桥的栏杆或桥面上，找到与上一步汉字相关的刻字或纹样，记录它旁边出现的数字。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '在桥的栏杆上仔细看，有石刻文字。',
          '注意石刻上的年份或编号。',
          '直接给出答案。'
        ]
      }
    ],
    transition: {
      clue: '琵琶声断处，古柏森森立碑丛——她说那里的石头上刻着比她更久的话。',
      nextLocation: '苏州文庙（碑刻博物馆）',
      hint: '沿盘门路向东北步行约15分钟。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 2: 苏州文庙
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 2,
    title: '苏州文庙',
    location: '苏州文庙（碑刻博物馆）',
    address: '人民路613号',
    photoPrompt: '拍下古柏的树干纹路——年轮是石头记不住的东西，但树替它记了',
    photoSubject: '文庙院内古柏树干特写',
    diaryQuote:
      '年轮是石头记不住的东西，但树替它记了。',
    cipherFragment: '台下那个人也散了',
    cardBackNumber: 2,
    steps: [
      {
        id: '2-1',
        title: '星宿辨识',
        instruction:
          '在文庙内找到宋代天文图碑（大成殿东侧）。这块碑刻着1000多颗星——找到碑上标注的二十八宿中的某一个特定星宿名。「她把血溅在扇面上。我把字藏在星星里。」',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '天文图碑是文庙四大宋碑之一，碑面布满星点和圈线。',
          '寻找碑上用文字标注的二十八宿名称。',
          '直接给出答案。'
        ]
      },
      {
        id: '2-2',
        title: '桃红滤镜',
        instruction:
          '取出道具「碑文拓片」和桃红色透明卡片。将卡片平铺覆盖在拓片上——红色文字隐入背景，灰色文字浮现。读出浮现的文字。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '卡片要完全覆盖拓片，确保光线充足。',
          '忽略模糊的字，只读清晰浮现的灰色文字。',
          '直接给出答案。'
        ]
      },
      {
        id: '2-3',
        title: '星文组合',
        instruction:
          '将星宿名与浮现文字组合——用星宿名的字数作为位置编号，在浮现文字中取对应位置的字，得到本站密电片段的验证码。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '星宿名是几个字？那就取浮现文字的第几个字。',
          '如果星宿名是两个字，就取第2个字。',
          '直接给出答案。'
        ]
      }
    ],
    transition: {
      clue: '血色扇面收起后，双影并肩如两座塔——站在两座塔中间，你看见的到底是真的还是梦里的？',
      nextLocation: '双塔·定慧寺巷',
      hint: '向东北步行约10分钟，经凤凰街到定慧寺巷。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 3: 双塔·定慧寺巷
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 3,
    title: '双塔·定慧寺巷',
    location: '双塔（宋代罗汉院双塔）及定慧寺巷',
    address: '定慧寺巷（近凤凰街）',
    photoPrompt: '拍下两座塔的影子——她说梦里的那个人长得和她一模一样，只是左右反了',
    photoSubject: '双塔并立的全景或塔影',
    diaryQuote:
      '梦里的那个人长得和她一模一样，只是左右反了。',
    cipherFragment: '窗是偷的',
    cardBackNumber: 4,
    steps: [
      {
        id: '3-1',
        title: '找不同',
        instruction:
          '站在两塔正中的轴线上，仔细对比。它们看起来几乎一模一样——但找出一处差异。「杜丽娘在梦里见过一个人。哪座塔是真的？」',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '从底层向上逐层对比两塔的细节。',
          '注意某层的窗洞形状、数量或装饰是否有差别。',
          '直接给出答案。'
        ]
      },
      {
        id: '3-2',
        title: '镜像拼字',
        instruction:
          '取出道具「花窗卡」——上面只有半幅图案。打开手机前置摄像头，将卡片放在镜头前，屏幕上出现镜像。将实体卡片与屏幕镜像左右拼合——图形中隐含一个汉字。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '用前置摄像头拍卡片，注意屏幕上是镜像的。',
          '将屏幕截图与实体卡片左右对拼，看整体轮廓。',
          '直接给出答案。'
        ]
      },
      {
        id: '3-3',
        title: '定位出戏句',
        instruction:
          '将3-1发现的差异描述中的关键数字作为行号，3-2的汉字作为偏移量，在本站日记中定位那句「出戏」的话——不属于杜丽娘的那句。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '差异处对应的数字就是日记的行号。',
          '汉字的笔画数是该行第几个字。',
          '直接给出答案。'
        ]
      }
    ],
    transition: {
      clue: '梦醒不知身在何处。沿水向东，有一座园的名字里有两个人——但墙里的人从来不知道墙外有人在看她。',
      nextLocation: '耦园外·仓街水巷',
      hint: '向东步行约10分钟，穿过小巷到仓街。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 4: 耦园外·仓街水巷
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 4,
    title: '耦园外·仓街水巷',
    location: '耦园外围·仓街/小新桥巷',
    address: '仓街小新桥巷（耦园东侧沿河）',
    photoPrompt: '拍下漏窗里透出来的那一点绿——她说「够不着的最好看，够着了就是戏散了」',
    photoSubject: '耦园外墙漏窗透出的园内景色',
    diaryQuote:
      '够不着的最好看，够着了就是戏散了。',
    cipherFragment: '但这座园是我的',
    cardBackNumber: 3,
    steps: [
      {
        id: '4-1',
        title: '漏窗采集',
        instruction:
          '沿仓街/小新桥巷行走，找到耦园外墙上的漏窗（至少3个不同图案）。将实物图案与道具「窗谱卡」上的编号一一对应，按从南到北的顺序记录编号序列。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '漏窗不止在正门附近，沿墙多走一些。',
          '有些图案是几何形，有些是花草形——与窗谱卡仔细比对。',
          '直接给出答案。'
        ]
      },
      {
        id: '4-2',
        title: '折子索引',
        instruction:
          '用编号序列在道具「折子戏目录」上索引——每个编号对应一出折子戏。取每出折子名的第一个字，连起来。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '每个窗谱编号在目录中有对应的折子。',
          '只取折子戏名的第一个字。',
          '直接给出答案。'
        ]
      },
      {
        id: '4-3',
        title: '窗内之物',
        instruction:
          '透过最大的那个漏窗往园内看——能看见什么植物？这个植物名与4-2中某个折子名有一字重合。重合的字就是密电验证码。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '仔细透过漏窗观察，辨认园内的树或花。',
          '植物名与折子名共有的那个字是什么？',
          '直接给出答案。'
        ]
      }
    ],
    transition: {
      clue: '信写完了没寄出去。沿河往北走，走到桥多的地方，颜色就多了——她说那条路有一扇门是杨妃的颜色。',
      nextLocation: '平江路·悬桥巷',
      hint: '沿平江河向北步行约10分钟。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 5: 平江路·悬桥巷
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 5,
    title: '平江路·悬桥巷',
    location: '平江路中段·悬桥巷/大儒巷一带',
    address: '平江路（悬桥巷与大儒巷之间）',
    photoPrompt: '拍下平江路上你觉得最好看的一种颜色——她在账册边上写过：「今日路过悬桥巷，有一扇门是杨妃的颜色」',
    photoSubject: '平江路沿街最打动你的一处色彩',
    diaryQuote:
      '今日路过悬桥巷，有一扇门是杨妃的颜色。',
    cipherFragment: '水是梦里的',
    cardBackNumber: 6,
    steps: [
      {
        id: '5-1',
        title: '七色采集',
        instruction:
          '取出全部7张「戏衫色卡」。在平江路/悬桥巷/大儒巷实地找到与每张色卡颜色最接近的实物（门板、窗框、苔藓、布帘、砖墙、花朵、灯笼……）。记录每种颜色对应实物名称的第一个字。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '不需要精确匹配，找视觉上最接近的实物。',
          '青灰→老砖墙？桃红→灯笼？明黄→秋叶？多走多看。',
          '直接给出所有7个首字。'
        ]
      },
      {
        id: '5-2',
        title: '出场排序',
        instruction:
          '将7个首字按色卡背面「出场序」（各角色所属剧本故事年代从早到晚）重新排列，连读。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '翻看每张色卡的背面右下角，有出场序编号。',
          '按编号1→7重新排列首字。',
          '直接给出答案。'
        ]
      },
      {
        id: '5-3',
        title: '账册密码',
        instruction:
          '在本站日记（账册夹注）中找到提及颜色的文字。这些颜色对应的色卡首字就是密电验证码。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '账册夹注中写了哪几种颜色？',
          '注意「桂花糕，二文」旁边的小字。',
          '直接给出答案。'
        ]
      }
    ],
    transition: {
      clue: '金粉褪去，往西走。桃花坞里有人刻年画，红的绿的蓝的——比戏服还浓。',
      nextLocation: '桃花坞',
      hint: '乘公交向西约15分钟（或沿观前街步行20分钟）。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 6: 桃花坞
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 6,
    title: '桃花坞',
    location: '桃花坞大街/唐寅故居遗址一带',
    address: '桃花坞大街（近皋桥）',
    photoPrompt: '拍下桃花坞最鲜艳的一抹颜色——她说「唱戏要淡，做人要浓。我搞反了一辈子」',
    photoSubject: '桃花坞街区中最鲜艳的色彩元素',
    diaryQuote:
      '唱戏要淡，做人要浓。我搞反了一辈子。',
    cipherFragment: '石是借的',
    cardBackNumber: 5,
    steps: [
      {
        id: '6-1',
        title: '年画观察',
        instruction:
          '在桃花坞街区寻找年画相关元素（店招、墙上年画、年画店的展示品）。观察传统桃花坞年画的配色——注意颜色是一层一层套上去的。「陈妙常是道姑，该六根清净。但桃花坞的红绿比她的心还热闹。」',
        answerType: 'confirm',
        skipVerification: true,
        answer: 'confirm',
        hints: [
          '注意年画中的颜色层次关系。',
          '传统套色顺序：先墨线轮廓，再套红、套绿、套蓝。',
          '理解这个工序就可以进入下一步。'
        ]
      },
      {
        id: '6-2',
        title: '三色拆层',
        instruction:
          '取出道具「年画底版」（黑白线描）和3张彩色透明片。依次叠加——先覆盖红片，记录新浮现的文字；再叠绿片，再记录；最后叠蓝片，再记录。三轮拆色，三组文字。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '叠红片后，红色区域隐去，注意非红色区域浮现了什么字。',
          '再叠绿片，注意又浮现了哪些新的字。',
          '直接给出三组文字。'
        ]
      },
      {
        id: '6-3',
        title: '虚实分拣',
        instruction:
          '三组文字拼合成一句话。对照本站日记——哪些是「戏词」（陈妙常的台词），哪些是「她自己的话」？提取「她自己的话」中的关键字作为密电验证码。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '三组文字连起来是一句完整的话。',
          '读本站日记，找到这句话出现的位置——前后文能帮你分辨虚实。',
          '直接给出答案。'
        ]
      }
    ],
    transition: {
      clue: '红绿褪尽是月白。沿山塘河走到最安静的地方——她在那里等了很久了。',
      nextLocation: '山塘街深处·星桥',
      hint: '向西步行约15分钟，沿山塘河走到星桥/普济桥一带。'
    }
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stage 7: 山塘街深处·星桥
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 7,
    title: '山塘街·星桥',
    location: '山塘街西段·星桥/普济桥一带',
    address: '山塘街（半塘以西，近星桥）',
    photoPrompt: '拍下山塘河的尽头——她说「戏演完了，别鼓掌。安安静静走就好」',
    photoSubject: '山塘街深处的河道尽头或古桥暮色',
    diaryQuote:
      '戏演完了，别鼓掌。安安静静走就好。',
    cipherFragment: '你走进来就算有人来过',
    cardBackNumber: 7,
    // Fragment order by back#: 1=台上的人散了 2=台下那个人也散了 3=但这座园是我的 4=窗是偷的 5=石是借的 6=水是梦里的 7=你走进来就算有人来过
    steps: [
      {
        id: '7-1',
        title: '密电拼合',
        instruction:
          '将前6站收集的密电卡片加上本站第7张，翻到背面，按编号1→7排列。连读所有密电片段。',
        answerType: 'confirm',
        skipVerification: true,
        answer: 'confirm',
        hints: [
          '背面编号从1到7排列。',
          '连读编号顺序的片段，不是收集顺序。',
          '完整信息应该是一段有意义的话。'
        ]
      },
      {
        id: '7-2',
        title: '七色藏头',
        instruction:
          '将7张戏衫色卡按颜色从浓到淡排列：朱红→桃红→明黄→鹅黄→粉白→青灰→月白。翻到背面，每张有一个字。连读7个字。',
        answerType: 'text',
        answer: '借景入梦戏如真',
        hints: [
          '从最浓烈的红色开始，到最淡的月白结束。',
          '翻到背面，每张卡各有一个字。',
          '七个字连读：借景入梦戏如真。'
        ]
      },
      {
        id: '7-3',
        title: '造园拼合',
        instruction:
          '取出道具「园林底图」，将7站收集的7条借景片段（印在密电卡片背面）对应填入底图的7个位置：入口=水，正厅=石，东廊=窗，西墙=漏窗，中庭=花木，后院=叠石，尽头=亭。',
        answerType: 'confirm',
        skipVerification: true,
        answer: 'confirm',
        hints: [
          '底图上7个位置都标了建筑/景观名称。',
          '将每个借景片段的关键词与底图位置匹配。',
          '完成后你会看到一座完整的园林蓝图——这是她一辈子偷来的园。'
        ]
      }
    ],
    transition: {
      clue: '现在，打开那个信封。——戏散后再拆。',
      hint: '恭喜通关。'
    }
  }
]

export function getStage(id) {
  return STAGES[id] || null
}

export const TOTAL_STAGES = 7
```

- [ ] **Step 3: Verify structure matches Shanghai pattern**

Check that exports match: `STAGES`, `getStage()`, `TOTAL_STAGES`. Verify each stage has all required fields. Verify all 7 `cipherFragment` values concatenate (by back number order) to form the complete message.

Back number order 1→7: 也散了但这座 (3→back1) + 石是借的 (5→back2) + 台上的人散了 (1→back3) + 水是梦里的 (6→back4) + 台下那个人 (2→back5) + 窗是偷的 (4→back6) + 你走进来就算有人来过 (7→back7)

Full message by back number: 「也散了但这座石是借的台上的人散了水是梦里的台下那个人窗是偷的你走进来就算有人来过」

**Verification:** Reading fragments by back number 1→7: 台上的人散了(S1) + 台下那个人也散了(S2) + 但这座园是我的(S4) + 窗是偷的(S3) + 石是借的(S6) + 水是梦里的(S5) + 你走进来就算有人来过(S7) = complete message ✓

- [ ] **Step 4: Commit**

```bash
git add app/src/data/cities/suzhou/puzzles.js
git commit -m "feat(suzhou): add puzzle data for 7 stages"
```

---

## Task 3: Narrative Data (narrative.js)

**Files:**
- Create: `app/src/data/cities/suzhou/narrative.js`

- [ ] **Step 1: Write narrative.js**

Create `app/src/data/cities/suzhou/narrative.js`. Follow exact structure of `app/src/data/cities/shanghai/narrative.js`:

```javascript
/**
 * 姑苏折子 — Narrative data
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
  fullMessage: '台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。',

  fragmentOrder: [
    { backNumber: 1, stageId: 1, fragment: '台上的人散了' },
    { backNumber: 2, stageId: 2, fragment: '台下那个人也散了' },
    { backNumber: 3, stageId: 4, fragment: '但这座园是我的' },
    { backNumber: 4, stageId: 3, fragment: '窗是偷的' },
    { backNumber: 5, stageId: 6, fragment: '石是借的' },
    { backNumber: 6, stageId: 5, fragment: '水是梦里的' },
    { backNumber: 7, stageId: 7, fragment: '你走进来就算有人来过' }
  ],

  acrostic: {
    lines: [
      { stageId: 1, keyChar: '借', quote: '她在水里看见过另一个自己，那个不用唱戏的自己。' },
      { stageId: 2, keyChar: '景', quote: '年轮是石头记不住的东西，但树替它记了。' },
      { stageId: 3, keyChar: '入', quote: '梦里的那个人长得和她一模一样，只是左右反了。' },
      { stageId: 4, keyChar: '梦', quote: '够不着的最好看，够着了就是戏散了。' },
      { stageId: 5, keyChar: '戏', quote: '今日路过悬桥巷，有一扇门是杨妃的颜色。' },
      { stageId: 6, keyChar: '如', quote: '唱戏要淡，做人要浓。我搞反了一辈子。' },
      { stageId: 7, keyChar: '真', quote: '戏演完了，别鼓掌。安安静静走就好。' }
    ],
    characters: ['借', '景', '入', '梦', '戏', '如', '真'],
    hiddenMessage: '借景入梦戏如真',
    reveal: '借景入梦戏如真'
  },

  envelopePrompt: '现在，打开那个信封。——戏散后再拆。',

  completionMessage:
    '所有角色都演完了。\n\n沈云筝藏在七出折子戏缝隙里的话，跨越两百年，终于被听见了。\n\n台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。\n\n——借景入梦戏如真'
}

// ──────────────────────────────────────────────────────────────────────────
// Checklist & Location Data
// ──────────────────────────────────────────────────────────────────────────

/** 沈云筝的7条借景 — the garden elements shown in Finale and Archive */
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
// ──────────────────────────────────────────────────────────────────────────

/**
 * @type {Array<{stage: number, prompt: string, diary: string, diaryExcerpt: string}>}
 */
export const PHOTO_DIARY_PAIRS = [
  {
    stage: 1,
    prompt: '拍下吴门桥的倒影——她在水里看见过另一个自己，那个不用唱戏的自己',
    diary: '她在水里看见过另一个自己，那个不用唱戏的自己。',
    diaryExcerpt:
      '借这座桥走一遍台位。赵五娘从桥东上，走到桥心停住——低头看水，水里有另一个她。这段戏要演得慢，脚步不能急。我站在吴门桥上，替她走了一遍。水里也有另一个我。那个人不用唱戏。'
  },
  {
    stage: 2,
    prompt: '拍下古柏的树干纹路——年轮是石头记不住的东西，但树替它记了',
    diary: '年轮是石头记不住的东西，但树替它记了。',
    diaryExcerpt:
      '景致再好也要记在碑上才算数——这是李香君教我的。她把血溅在扇面上，我把字藏在星星里。文庙的柏树比碑还老。碑上的字会模糊，树的年轮不会。'
  },
  {
    stage: 3,
    prompt: '拍下两座塔的影子——她说梦里的那个人长得和她一模一样，只是左右反了',
    diary: '梦里的那个人长得和她一模一样，只是左右反了。',
    diaryExcerpt:
      '入了妆就不是自己了。杜丽娘的粉要薄，像刚睡醒。她是真的在梦里见过那个人，还是自己编的？两座塔站在一起，像一个人和她的影子。我有时候也分不清——台上那个是我，还是台下这个是我？'
  },
  {
    stage: 4,
    prompt: '拍下漏窗里透出来的那一点绿——她说「够不着的最好看，够着了就是戏散了」',
    diary: '够不着的最好看，够着了就是戏散了。',
    diaryExcerpt:
      '梦里隔着墙听见有人念书。我站在耦园墙外，透过漏窗看见里面的绿。崔莺莺也是这样——隔着墙听见张生的琴声。你大概不记得了。那天在沧浪亭演《西厢》，你坐在第三排。散戏后你站起来，我在台上还没卸妆。'
  },
  {
    stage: 5,
    prompt: '拍下平江路上你觉得最好看的一种颜色——她在账册边上写过：「今日路过悬桥巷，有一扇门是杨妃的颜色」',
    diary: '今日路过悬桥巷，有一扇门是杨妃的颜色。',
    diaryExcerpt:
      '戏班账册，三月初九，沧浪亭堂会，包银二两四钱，茶点自备。——旁注：今日路过悬桥巷，有一扇门是杨妃的颜色。桂花糕，二文。'
  },
  {
    stage: 6,
    prompt: '拍下桃花坞最鲜艳的一抹颜色——她说「唱戏要淡，做人要浓。我搞反了一辈子」',
    diary: '唱戏要淡，做人要浓。我搞反了一辈子。',
    diaryExcerpt:
      '如果不是这身道袍，陈妙常大概早就跑了。但她穿着它，只好把心事藏在袖子里。桃花坞的年画红得发烫、绿得冒烟。我散场后走到这里，满眼的颜色像打翻了妆奁。唱戏要淡，做人要浓——我搞反了一辈子。'
  },
  {
    stage: 7,
    prompt: '拍下山塘河的尽头——她说「戏演完了，别鼓掌。安安静静走就好」',
    diary: '戏演完了，别鼓掌。安安静静走就好。',
    diaryExcerpt:
      '真话只说一次。你走完了我走过的路。那座园——水是盘门的，石是文庙的，窗是双塔的，漏窗是耦园的，桂花是平江路的，石头是桃花坞的，亭子是这里的。都是偷来的。但你走进来了，就算有人来过。'
  }
]
```

- [ ] **Step 2: Verify all exports match Shanghai pattern**

Required exports: `INTRO_STORY`, `FINALE`, `GARDEN_ELEMENTS` (equivalent to `HEYING_CHECKLIST`), `STAGE_LOCATIONS`, `PHOTO_DIARY_PAIRS`. All present.

- [ ] **Step 3: Commit**

```bash
git add app/src/data/cities/suzhou/narrative.js
git commit -m "feat(suzhou): add narrative data with intro, finale, acrostic, photo-diary pairs"
```

---

## Task 4: Content — 7 Diary Entries

**Files:**
- Create: `content/suzhou/diary-1-panmen.md` through `content/suzhou/diary-7-shantang.md`

- [ ] **Step 1: Create content/suzhou/ directory**

```bash
mkdir -p content/suzhou
```

- [ ] **Step 2: Write diary-1-panmen.md (场记/走台笔记)**

Follow frontmatter format from `content/shanghai/diary-1-peace-hotel.md`. Include YAML fields: station, location, opera, role, costume_color, acrostic_char, hidden_regret, garden_element, garden_quote. Body: 200-400 words, scene-record style, cold/professional, Paprika-style bleed from stage directions into real bridge. Opening must start with character 「借」.

- [ ] **Step 3: Write diary-2-wenmiao.md (唱词旁批)**

Format as marginal notes on a 《桃花扇》script. Left column = printed lyrics, right = handwritten comments. Opening starts with 「景」. Shift from professional annotations to personal feelings.

- [ ] **Step 4: Write diary-3-shuangta.md (妆台碎语)**

Makeup table stream-of-consciousness. Rambling, intimate, jumping between applying powder and real memories. Opening starts with 「入」. Most blurred Paprika boundary — slides between talking about 杜丽娘's makeup and her own face.

- [ ] **Step 5: Write diary-4-ouyuan.md (致某人的未寄信)**

Letter to an unnamed 「你」. Restrained, serious, painful. First explicit appearance of the person in the third row. Opening starts with 「梦」. The most emotionally direct entry so far.

- [ ] **Step 6: Write diary-5-pingjiang.md (戏班账册夹注)**

Formatted as actual accounting entries with tiny marginal notes. Most compressed format. Include: 「桂花糕，二文。」 Opening starts with 「戏」. Color references for the puzzle.

- [ ] **Step 7: Write diary-6-taohuawu.md (散场后园中独白)**

Most literary entry. Night, alone in a garden. Speaking as herself but involuntarily slipping into 陈妙常's voice, then yanking back. Opening starts with 「如」. Peak Paprika instability.

- [ ] **Step 8: Write diary-7-shantang.md (空白页上自己的话)**

No format. Short, clean, direct. First time speaking without any role. Opening starts with 「真」. Addresses 「你」 — both the person and the player. Includes the garden reveal.

- [ ] **Step 9: Verify all 7 diaries**

Check: acrostic characters match (借景入梦戏如真), each uses a distinct literary format, each has correct frontmatter, food thread appears in diaries 3/5/6, the 「出戏」 sentences are identifiable in each.

- [ ] **Step 10: Commit**

```bash
git add content/suzhou/diary-*.md
git commit -m "feat(suzhou): add 7 diary entries in 7 literary styles"
```

---

## Task 5: Content — Supporting Materials

**Files:**
- Create: `content/suzhou/cipher-fragments.md`
- Create: `content/suzhou/riddles-and-clues.md`
- Create: `content/suzhou/envelope-letter.md`
- Create: `content/suzhou/envelope-garden-blueprint.md`
- Create: `content/suzhou/envelope-blank-ticket.md`

- [ ] **Step 1: Write cipher-fragments.md**

Follow format of `content/shanghai/cipher-fragments.md`. Include:
- Complete message
- Game order → reading order table (7 rows)
- Reading order table (by back number 1→7)
- Assembly explanation

```markdown
# 密电碎片映射

## 完整消息
**台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。**

## 碎片分割与顺序映射

### 游戏获得顺序 → 阅读顺序

| 游戏阶段 | 卡片背面编号 | 碎片内容 |
|:---:|:---:|:---|
| 第一阶段（盘门） | 1 | 台上的人散了 |
| 第二阶段（文庙） | 2 | 台下那个人也散了 |
| 第三阶段（双塔） | 4 | 窗是偷的 |
| 第四阶段（耦园） | 3 | 但这座园是我的 |
| 第五阶段（平江路） | 6 | 水是梦里的 |
| 第六阶段（桃花坞） | 5 | 石是借的 |
| 第七阶段（山塘街） | 7 | 你走进来就算有人来过 |

### 阅读顺序（按编号 1→7）

| 顺序 | 来源阶段 | 碎片内容 |
|:---:|:---:|:---|
| 1 | 第一阶段 | 台上的人散了 |
| 2 | 第二阶段 | 台下那个人也散了 |
| 3 | 第四阶段 | 但这座园是我的 |
| 4 | 第三阶段 | 窗是偷的 |
| 5 | 第六阶段 | 石是借的 |
| 6 | 第五阶段 | 水是梦里的 |
| 7 | 第七阶段 | 你走进来就算有人来过 |

**组合结果：** 台上的人散了 + 台下那个人也散了 + 但这座园是我的 + 窗是偷的 + 石是借的 + 水是梦里的 + 你走进来就算有人来过
= **台上的人散了，台下那个人也散了。但这座园是我的——窗是偷的，石是借的，水是梦里的。你走进来，就算有人来过。**

## 机制说明

- 每个阶段获得一张戏票卡片，正面是折子戏唱词，背面有编号和密电片段
- 编号并非按游戏获得顺序排列（第三阶段的卡片背面编号为4，不是3）
- 将碎片按背面编号1→7重新排列，得到完整信息
- 另外，7张卡片背面各有一条「借景」造园指令，拼合后构成「不可能的园」蓝图
```

- [ ] **Step 2: Write riddles-and-clues.md**

Follow format of `content/shanghai/riddles-and-clues.md`. Include all 6 transition clues and all sub-puzzle hint details for each stage (already defined in puzzles.js, expand with narrative context here).

- [ ] **Step 3: Write envelope-letter.md**

Shen Yunzheng's final letter. Short, direct, no role. Follow tone of `content/shanghai/envelope-letter.md`:

```markdown
# 沈云筝的最后一封信

> 通关后拆开信封内第一张纸。仿手写体，泛黄纸张质感。

---

你走完了我走过的路。

我必须对你坦白——没有什么散佚的戏本。从来没有。

那七张戏票上印的唱词都是真的。但背面的字不属于任何剧本。那些是我自己的话。我一辈子只会用别人的台词说话，最后还是没出息——把真心话藏在了角色的缝隙里。

你在盘门看到的水，是我散场后一个人蹲在桥头看的。文庙的柏树，是我背台词背累了靠着歇过的。双塔的影子，是我化妆时在铜镜里看见的自己。耦园的漏窗，是我隔着墙听见一个声音的地方。平江路的颜色，是我走了一百遍还是觉得好看的路。桃花坞的红绿，是我觉得自己这辈子该有但没有的热闹。山塘街的尽头，是我决定不再演了的地方。

那座园你已经看到蓝图了。窗是偷的，石是借的，水是梦里的。但你走进来了——就算有人来过。

如果你走完这条路饿了，去平江路买一块桂花糕。替我吃的。我当年在账册上记过价钱，但没舍得买。

——沈云筝
```

- [ ] **Step 4: Write envelope-garden-blueprint.md**

Description of the "impossible garden" blueprint — 7 borrowed elements and their sources:

```markdown
# 不可能的园

> 信封内第二张纸。手绘风格园林平面图。

---

## 园林蓝图——七件借来的东西

**入口·水池**
借自盘门护城河。「够映一个人的影子就行。」

**正厅·碑石**
借自苏州文庙。「不刻功名，只刻一个人站过的位置。」

**东廊·花窗**
借自双塔旁某户人家。「从这边看是真的，从那边看是梦里的。分不出来最好。」

**西墙·漏窗**
借自耦园。「看得见又够不着，像隔着一堵墙听见有人念书。」

**中庭·桂花树**
借自平江路某户院墙内。「秋天的时候满园都是甜的。她们说贵妃爱桂花，其实是我爱。」

**后院·太湖石**
借自桃花坞某石桥旁。「丑的那种。像人跪着——不对，像人终于站起来了。」

**尽头·无名亭**
借自山塘街星桥桥头。「没有匾。谁来了就坐坐。走了也不必说。」

---

*这不是一座园。这是她的一生。*
```

- [ ] **Step 5: Write envelope-blank-ticket.md**

```markdown
# 空白戏票

> 信封内第三张纸。仿旧戏票格式。

---

**姑苏·某年某月某日**

今日演出：___________

角色：你自己。
```

- [ ] **Step 6: Commit**

```bash
git add content/suzhou/
git commit -m "feat(suzhou): add supporting content files (cipher map, clues, envelope materials)"
```

---

## Task 6: Props — Shared Template Overrides (cipher-cards, diary-pages, envelope)

**Files:**
- Create: `props/suzhou/templates/cipher-cards.html`
- Create: `props/suzhou/templates/diary-pages.html`
- Create: `props/suzhou/templates/envelope-contents.html`

- [ ] **Step 1: Create props/suzhou/templates/ directory**

```bash
mkdir -p props/suzhou/templates
```

- [ ] **Step 2: Write cipher-cards.html**

Copy structure from `props/xian/templates/cipher-cards.html`. Adapt:
- Title: `密电碎片卡 — 姑苏折子`
- Border color: `#C85A5A` (朱砂红, Suzhou accent)
- 7 cards, each with:
  - Front: opera title + role name + short lyrics quote
  - Back: back number + cipher fragment + garden element quote
- Card dimensions: 85mm × 55mm (match existing)

- [ ] **Step 3: Write diary-pages.html**

Copy structure from `props/xian/templates/diary-pages.html`. Adapt:
- 7 pages, each with different visual treatment matching the literary style:
  - Page 1: typewriter/report style (场记)
  - Page 2: two-column (printed lyrics left, handwritten right)
  - Page 3: mirror/vanity style (scattered, intimate)
  - Page 4: letter format (formal header, careful handwriting)
  - Page 5: ledger format (columns, numbers, tiny marginal notes)
  - Page 6: free prose (night garden atmosphere)
  - Page 7: minimal, centered, lots of whitespace
- Suzhou theme colors: moon-white base, ink text, 朱砂 accents

- [ ] **Step 4: Write envelope-contents.html**

Copy structure from `props/xian/templates/envelope-contents.html`. Include:
- Letter (envelope-letter.md content)
- Garden blueprint (envelope-garden-blueprint.md content, styled as hand-drawn map)
- Blank ticket (envelope-blank-ticket.md content)
- Seal/stamp: 「借景」篆书小印

- [ ] **Step 5: Commit**

```bash
git add props/suzhou/templates/cipher-cards.html props/suzhou/templates/diary-pages.html props/suzhou/templates/envelope-contents.html
git commit -m "props(suzhou): add cipher cards, diary pages, and envelope templates"
```

---

## Task 7: Props — Suzhou-Specific Templates (color system)

**Files:**
- Create: `props/suzhou/templates/costume-color-cards.html`
- Create: `props/suzhou/templates/rubbing-overlay.html`
- Create: `props/suzhou/templates/color-overlays.html`
- Create: `props/suzhou/templates/woodblock-base.html`

- [ ] **Step 1: Write costume-color-cards.html**

7 cards (name-card size, ~90mm × 54mm), each representing one opera role:

| Card | Role | Color | Hex | Traditional Name |
|------|------|-------|-----|-----------------|
| 1 | 赵五娘·琵琶记 | 青灰 | #7D8B8A | 石青 |
| 2 | 李香君·桃花扇 | 桃红 | #E8788A | 桃夭 |
| 3 | 杜丽娘·牡丹亭 | 粉白 | #F2E4E1 | 退红 |
| 4 | 崔莺莺·西厢记 | 鹅黄 | #F0E68C | 缃叶 |
| 5 | 杨玉环·长生殿 | 明黄 | #F5C542 | 明黄 |
| 6 | 陈妙常·玉簪记 | 朱红 | #C85A5A | 朱砂 |
| 7 | 沈云筝 | 月白 | #E8ECF0 | 月白 |

- Front: role name, opera name, large color block, traditional color name
- Back: back number (出场序), one character of acrostic (借/景/入/梦/戏/如/真), garden element keyword
- Print note: cards 2 and 6 should be printed on transparency film for overlay puzzles; others on cardstock

- [ ] **Step 2: Write rubbing-overlay.html**

Station 2 puzzle prop:
- A5 size document styled as a stone rubbing (碑文拓片)
- Background: dark charcoal texture
- Text: mix of deep red (#C85A5A at various opacities) and gray (#666) characters
- When桃红 transparent card is placed over it, red characters disappear into the card color, gray characters become clearly visible
- Include print/assembly instructions

- [ ] **Step 3: Write woodblock-base.html**

Station 6 puzzle prop:
- A5 black-and-white line drawing in traditional 桃花坞年画 style
- Hidden text encoded in three color channels:
  - Red channel: text visible only when red overlay removes red background
  - Green channel: text visible only when green overlay is added
  - Blue channel: text visible only when blue overlay is added
- Include technical notes on print color calibration

- [ ] **Step 4: Write color-overlays.html**

Print guide for the 3 transparent color sheets (red, green, blue):
- Each A5 size
- Solid color with ~70% opacity when printed on transparency film
- Alignment marks to match woodblock-base.html
- Instructions for printing on OHP transparency film

- [ ] **Step 5: Commit**

```bash
git add props/suzhou/templates/costume-color-cards.html props/suzhou/templates/rubbing-overlay.html props/suzhou/templates/woodblock-base.html props/suzhou/templates/color-overlays.html
git commit -m "props(suzhou): add color puzzle props (costume cards, rubbing overlay, woodblock base, color overlays)"
```

---

## Task 8: Props — Navigation and Puzzle Props

**Files:**
- Create: `props/suzhou/templates/waterway-map.html`
- Create: `props/suzhou/templates/half-window-card.html`
- Create: `props/suzhou/templates/window-catalog.html`
- Create: `props/suzhou/templates/opera-catalog.html`
- Create: `props/suzhou/templates/garden-blueprint.html`

- [ ] **Step 1: Write waterway-map.html**

A4 single-page prop:
- Stylized map of Suzhou old city waterways (hand-drawn aesthetic, 仿旧)
- 7 stations marked with small opera mask icons
- Walking route shown as dotted line
- At 吴门桥 area: half-image that reveals a character when folded along center line
- Grid overlay for coordinate puzzles
- Visual style: ink wash (水墨) with moon-white background, 朱砂 accent marks
- 「借景」seal stamp in corner

- [ ] **Step 2: Write half-window-card.html**

Small card (poker-card size):
- Half of a symmetrical pattern (花窗 lattice design)
- When mirrored (via phone front camera), the complete pattern reveals a hidden Chinese character
- Include cut line and fold reference marks
- Print on thick cardstock

- [ ] **Step 3: Write window-catalog.html**

Strip card or small booklet:
- 6-8 different 漏窗 (lattice window) patterns, each with a number
- Patterns should include: geometric (ice-crack, hexagonal), floral (plum blossom, peony), symbolic (vase, scroll)
- Each pattern is a simple black-and-white line drawing ~30mm × 30mm
- Numbered for reference in puzzle step 4-1

- [ ] **Step 4: Write opera-catalog.html**

Accordion-fold booklet (折页):
- List of 12-15 classic Kunqu折子戏 titles with numbers
- Each entry: number + 折子名 + 出自哪部戏 + one-line description
- Styled as an old theater program (仿旧戏单)
- Used for index lookup in station 4 puzzle

- [ ] **Step 5: Write garden-blueprint.html**

A4 single-page prop:
- Bird's-eye view of a traditional Suzhou garden layout
- 7 labeled positions: 入口(水), 正厅(石), 东廊(窗), 西墙(漏窗), 中庭(花木), 后院(叠石), 尽头(亭)
- Positions are empty/outlined — player fills them in during finale
- Elegant hand-drawn style with dotted paths between positions
- Title: 「沈云筝的园」(faded, like a secret title)

- [ ] **Step 6: Commit**

```bash
git add props/suzhou/templates/waterway-map.html props/suzhou/templates/half-window-card.html props/suzhou/templates/window-catalog.html props/suzhou/templates/opera-catalog.html props/suzhou/templates/garden-blueprint.html
git commit -m "props(suzhou): add navigation map, window cards, opera catalog, and garden blueprint"
```

---

## Task 9: Fieldwork Checklist

**Files:**
- Create: `fieldwork/suzhou-checklist.md`

- [ ] **Step 1: Write suzhou-checklist.md**

Follow format of `fieldwork/checklist.md` (Shanghai). Include all items from the spec's section 八 (踩点清单). Structure:

```markdown
# 「姑苏折子」实地踩点清单

打印此文件，带上手机（拍照）、笔、7张戏衫色卡样品（用于实地色彩匹配测试）。
按路线顺序走一遍全程，预计 4-5 小时。

## 全局确认
- [ ] 全程步行+公交实测总时间：______小时______分钟
- [ ] 公交线路（站5→站6）：______路，上车站______，下车站______
- [ ] 最佳出发时间确认（目标站7在傍晚5-6点）：建议______点出发
- [ ] 雨天备选方案逐站标注

## 站点1：盘门·吴门桥
- [ ] 吴门桥桥洞数量：______
- [ ] 桥栏石刻内容拍照+记录：______
- [ ] 桥面/栏杆可用于谜题的文字/数字：______
- [ ] 从桥上看盘门水门的视角拍照
- [ ] 桥洞+水面倒影最佳拍摄角度和时间：______
- [ ] 周边座位和遮蔽处标注

## 站点1→2 步行路线
- [ ] 实际步行时间：______分钟
- [ ] 路线描述：______

## 站点2：苏州文庙
- [ ] 确认免费开放：是/否
- [ ] 开放时间：______至______
- [ ] 宋代天文图碑位置确认（大成殿东侧？）：______
- [ ] 碑上可辨识的星宿名称列举：______
- [ ] 可用于谜题的具体碑文文字拍照记录
- [ ] 院内古柏位置和状态

## 站点2→3 步行路线
- [ ] 实际步行时间：______分钟

## 站点3：双塔·定慧寺巷
- [ ] 两塔对称差异点逐层记录（附照片）：
  - 第一层：______
  - 第二层：______
  - 第三层：______
  - ...
- [ ] 两塔中轴线最佳观察站位标注
- [ ] 定慧寺巷氛围和安静程度：______
- [ ] 居民区注意事项：______

## 站点3→4 步行路线
- [ ] 实际步行时间：______分钟
- [ ] 路线经过哪些有趣的巷子：______

## 站点4：耦园外·仓街
- [ ] 耦园外墙漏窗逐一记录：
  - 窗1（位置/图案/照片）：______
  - 窗2：______
  - 窗3：______
  - 窗4：______
  - （继续）
- [ ] 透过各漏窗能看见的园内元素：______
- [ ] 仓街/小新桥巷最佳水巷倒影拍摄点
- [ ] 从仓街到平江路的步行路线

## 站点4→5 步行路线
- [ ] 实际步行时间：______分钟

## 站点5：平江路·悬桥巷
- [ ] 悬桥巷/大儒巷入口位置和氛围确认
- [ ] 7色实地匹配测试：
  - 青灰（石青）：匹配实物______，稳定性______
  - 桃红（桃夭）：匹配实物______，稳定性______
  - 粉白（退红）：匹配实物______，稳定性______
  - 鹅黄（缃叶）：匹配实物______，稳定性______
  - 明黄（明黄）：匹配实物______，稳定性______
  - 朱红（朱砂）：匹配实物______，稳定性______
  - 月白（月白）：匹配实物______，稳定性______
- [ ] 色彩匹配是否依赖季节性元素：______
- [ ] 桂花糕店铺具体位置和营业时间：______

## 站点5→6 公交路线
- [ ] 公交线路号：______
- [ ] 上车站：______
- [ ] 下车站：______
- [ ] 实际乘车时间：______分钟
- [ ] 备选步行路线和时间：______

## 站点6：桃花坞
- [ ] 街区可见年画元素逐一记录（店招/墙画/展示品）：
  - 元素1：______
  - 元素2：______
  - ...
- [ ] 唐寅故居遗址位置和可观察性：______
- [ ] 街区市井氛围适合拍摄的点位

## 站点6→7 步行路线
- [ ] 实际步行时间：______分钟
- [ ] 路线描述（经过哪些桥/巷）：______

## 站点7：山塘街深处
- [ ] 半塘以西安静程度确认：______
- [ ] 星桥/普济桥位置和状态：______
- [ ] 从桥上看虎丘塔的可见度：可见/部分/不可见
- [ ] 傍晚5-6点光线和氛围拍照
- [ ] 终章适合停留的位置（桥头石凳等）：______
- [ ] 周边餐饮/桂花糕推荐：______

## 道具验证
- [ ] 碑文拓片+桃红滤镜同色相消效果实测：成功/需调整
- [ ] 年画底版+三色透明片叠加效果实测：成功/需调整
- [ ] 花窗卡+手机前置摄像头镜像可读性：成功/需调整
- [ ] 所有道具户外阳光下可读性
- [ ] A4打印效果验证
```

- [ ] **Step 2: Commit**

```bash
git add fieldwork/suzhou-checklist.md
git commit -m "docs(suzhou): add fieldwork verification checklist"
```

---

## Task 10: Final Integration Verification

- [ ] **Step 1: Verify file structure completeness**

Run:
```bash
echo "=== App Data ===" && ls app/src/data/cities/suzhou/ && echo "=== Content ===" && ls content/suzhou/ && echo "=== Props ===" && ls props/suzhou/templates/ && echo "=== Fieldwork ===" && ls fieldwork/suzhou-*
```

Expected output should show all files from the File Map.

- [ ] **Step 2: Verify city index has 5 cities**

```bash
grep -c "id:" app/src/data/cities/index.js
```

Expected: `5`

- [ ] **Step 3: Verify cross-city thread loop**

```bash
grep "from:" app/src/data/cross-city-threads.js
```

Expected: 5 entries forming the loop shanghai→nanjing→hangzhou→xian→suzhou→shanghai.

- [ ] **Step 4: Verify puzzles.js exports**

```bash
grep "export" app/src/data/cities/suzhou/puzzles.js
```

Expected: `STAGES`, `getStage`, `TOTAL_STAGES`

- [ ] **Step 5: Verify narrative.js exports**

```bash
grep "export" app/src/data/cities/suzhou/narrative.js
```

Expected: `INTRO_STORY`, `FINALE`, `GARDEN_ELEMENTS`, `STAGE_LOCATIONS`, `PHOTO_DIARY_PAIRS`

- [ ] **Step 6: Verify acrostic consistency**

Check that diary files' `acrostic_char` fields spell 借景入梦戏如真:

```bash
grep "acrostic_char:" content/suzhou/diary-*.md
```

- [ ] **Step 7: Final commit (if any fixes needed)**

```bash
git add -A && git status
# Only commit if there are changes
git commit -m "fix(suzhou): integration verification fixes"
```
