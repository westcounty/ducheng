# 「第七封密电」实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, playable real-world puzzle game set in Shanghai — including all narrative text, printable prop PDFs, and an H5 web app for answer verification, photo capture, and the finale reveal.

**Architecture:** Three workstreams converge into one deliverable: (1) narrative content feeds into both (2) printable prop PDFs and (3) a mobile-first H5 web app. The app is a static SPA (no backend) — game state lives in localStorage, photos in IndexedDB. Props are generated as print-ready PDFs from HTML/CSS templates. All puzzle answers use placeholder values (marked `__FIELD__`) until field trip data is collected.

**Tech Stack:** Vue 3 + Vite (H5 app), Puppeteer (PDF generation from HTML templates), vanilla HTML/CSS (prop templates), Markdown (narrative content)

**Spec:** `docs/superpowers/specs/2026-04-02-shanghai-spy-puzzle-game-design.md`

---

## File Structure

```
shanghaitrip/
├── content/                           # 叙事内容（纯文本/Markdown）
│   ├── diary-1-peace-hotel.md         # 日记第1篇（首字="你"）
│   ├── diary-2-customs-house.md       # 日记第2篇（首字="走"）
│   ├── diary-3-hsbc.md               # 日记第3篇（首字="过"）
│   ├── diary-4-yuyuan.md             # 日记第4篇（首字="的"）
│   ├── diary-5-xintiandi.md          # 日记第5篇（首字="每"）
│   ├── diary-6-sinan.md              # 日记第6篇（首字="一"）
│   ├── diary-7-wukang.md             # 日记第7篇（首字="步"）
│   ├── cipher-fragments.md            # 密电7段拆分方案 + 重排映射
│   ├── riddles-and-clues.md           # 每关的谜语、过渡线索、加密原文
│   ├── envelope-letter.md             # 信封内遗书全文
│   └── envelope-checklist.md          # 信封内鹤影清单
│
├── props/                             # 可打印道具
│   ├── templates/                     # HTML/CSS 模板（用于生成 PDF）
│   │   ├── cipher-wheel.html          # 密码转盘（两个圆盘）
│   │   ├── old-map.html              # 网格老地图
│   │   ├── intel-paper.html           # 情报纸（镜像半图）
│   │   ├── maze-grid.html            # 方格迷宫图
│   │   ├── photo-cards.html          # 建筑细节照片卡（6张）
│   │   ├── cardan-grille.html        # 窗格卡
│   │   ├── paper-ruler.html          # 纸尺
│   │   ├── diary-pages.html          # 日记残页（7页，双面）
│   │   ├── cipher-cards.html         # 密电卡片（7张，正反面）
│   │   ├── envelope-contents.html    # 信封内容物（遗书+清单）
│   │   └── shared-styles.css         # 共用样式（旧纸质感、字体）
│   ├── generate-pdfs.js              # Puppeteer 批量生成脚本
│   └── output/                        # 生成的 PDF 文件
│       └── .gitkeep
│
├── app/                               # H5 Web 应用
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   └── fonts/                     # 手写体/旧报纸字体
│   ├── src/
│   │   ├── main.js                    # 入口
│   │   ├── App.vue                    # 根组件
│   │   ├── router.js                  # 路由
│   │   ├── stores/
│   │   │   └── game.js               # 游戏状态（Pinia）：当前关卡、已解密电、照片
│   │   ├── data/
│   │   │   ├── puzzles.js            # 7关谜题数据（答案、提示、叙事文本）
│   │   │   └── narrative.js          # 终章文本、日记藏字揭示文本
│   │   ├── utils/
│   │   │   ├── cipher.js             # 凯撒密码加解密
│   │   │   └── photo-store.js        # IndexedDB 照片存取
│   │   ├── pages/
│   │   │   ├── Home.vue              # 首页（开始游戏/继续游戏）
│   │   │   ├── Stage.vue             # 关卡页（通用模板：叙事+子步骤+验证+拍照）
│   │   │   ├── Transit.vue           # 关卡间过渡页（路线导航+叙事）
│   │   │   ├── Finale.vue            # 终章（三层Meta揭晓）
│   │   │   └── Archive.vue           # 鹤影档案（通关后查看照片+日记）
│   │   └── components/
│   │       ├── AnswerInput.vue        # 答案输入框+验证反馈
│   │       ├── HintSystem.vue         # 三级提示系统
│   │       ├── PhotoCapture.vue       # 拍照组件（调用摄像头）
│   │       ├── NarrativeText.vue      # 叙事文字展示（打字机效果）
│   │       └── Timer.vue             # 可选计时器
│   └── styles/
│       └── theme.css                  # 全局样式（旧档案主题）
│
├── fieldwork/                         # 实地踩点
│   ├── checklist.md                   # 踩点清单（打印带去现场）
│   └── data.json                      # 踩点数据记录（回来后填入）
│
└── docs/
    └── superpowers/
        ├── specs/
        │   └── 2026-04-02-shanghai-spy-puzzle-game-design.md
        └── plans/
            └── 2026-04-02-seventh-cipher-implementation.md
```

---

## Phase 1: 项目初始化与踩点准备

### Task 1: 初始化项目与 Git 仓库

**Files:**
- Create: `package.json` (root)
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: 初始化 Git 仓库**

```bash
cd D:/work/shanghaitrip
git init
```

- [ ] **Step 2: 创建 .gitignore**

```gitignore
node_modules/
dist/
props/output/*.pdf
.DS_Store
*.log
fieldwork/data.json
```

- [ ] **Step 3: 创建根目录 package.json**

```json
{
  "name": "seventh-cipher",
  "version": "0.1.0",
  "private": true,
  "description": "「第七封密电」上海实景解谜游戏",
  "workspaces": ["app", "props"],
  "scripts": {
    "dev": "cd app && npm run dev",
    "build": "cd app && npm run build",
    "props": "cd props && node generate-pdfs.js"
  }
}
```

- [ ] **Step 4: 创建目录结构**

```bash
mkdir -p content props/templates props/output app/src fieldwork
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json docs/
git commit -m "init: project structure and design docs"
```

---

### Task 2: 创建实地踩点工具包

这是你去上海之前打印带在身上的清单，以及回来后录入数据的模板。

**Files:**
- Create: `fieldwork/checklist.md`
- Create: `fieldwork/data.json`

- [ ] **Step 1: 创建踩点清单（可打印）**

创建 `fieldwork/checklist.md`:

```markdown
# 「第七封密电」实地踩点清单

打印此文件，带上手机（拍照）、卷尺（量铜狮距离）、笔。
按路线顺序走一遍全程，预计 3-4 小时。

---

## 站点1：和平饭店（外滩20号）

- [ ] 站在南京东路侧，拍摄正立面全景
- [ ] 找到 Art Deco 重复装饰元素，拍特写，记录数量：______
- [ ] 找到东侧入口门楣，拍照，记录铭刻内容（年份等）：______
- [ ] 环顾建筑，记录其他可数的重复元素备选：______
- [ ] 备注/意外发现：

## 站点2：海关大楼（外滩13号）

- [ ] 拍摄钟面，确认罗马数字4的写法（IIII / IV）：______
- [ ] 数正立面可见立柱数量：______
- [ ] 记录大钟报时规律（如果恰好遇到整点）：______
- [ ] 拍摄立柱特写
- [ ] 备注/意外发现：

## 站点3：汇丰银行大楼（外滩12号）

- [ ] 确认两尊铜狮是否仍在原位：是 / 否
- [ ] 张嘴狮在哪侧（面对建筑）：左 / 右
- [ ] 闭嘴狮前爪踩着什么：______
- [ ] 拍摄两狮特写（包括爪下物品）
- [ ] 用卷尺量两狮鼻尖间距离（厘米）：______
- [ ] 抬头看穹顶/屋脊，记录可数元素及数量：______
- [ ] 拍摄屋顶特写
- [ ] 备注/意外发现：

## 站点3→4：步行路线

- [ ] 从外滩南端步行至豫园，记录实际用时：______分钟
- [ ] 拍摄沿途有氛围的街道

## 站点4：豫园九曲桥

- [ ] 从桥头走到桥尾，逐一记录每个转弯方向
  - 弯1：L / R
  - 弯2：L / R
  - 弯3：L / R
  - 弯4：L / R
  - 弯5：L / R
  - 弯6：L / R
  - 弯7：L / R
  - 弯8：L / R
  - 弯9：L / R
  - （如有更多弯道继续记录）
- [ ] 拍摄桥上回望的景色
- [ ] 湖心亭飞檐脊兽数量：______
- [ ] 脊兽面朝方向描述：______
- [ ] 拍摄脊兽特写
- [ ] 备注/意外发现：

## 站点4→5：地铁

- [ ] 豫园站到新天地站，确认地铁线路和站数：______
- [ ] 实际用时（含换乘步行）：______分钟

## 站点5：中共一大会址 / 新天地

- [ ] 搜索周边石库门门楣，寻找卷草纹中隐含人脸的装饰
  - 找到位置：______路______号
  - 拍照
- [ ] 选定6个可用于照片卡的建筑细节（拍特写+记录位置）
  - 细节1：______路______号，特征：______
  - 细节2：______路______号，特征：______
  - 细节3：______路______号，特征：______
  - 细节4：______路______号，特征：______
  - 细节5：______路______号，特征：______
  - 细节6：______路______号，特征：______
- [ ] 步行至思南路，记录用时：______分钟

## 站点6：思南公馆

- [ ] 确认周公馆位置（思南路______号）
- [ ] 沿思南路搜索有文字内容的铭牌/展板
  - 铭牌位置：______
  - 内容全文抄录或拍照：
  - 是否正对周公馆方向：是 / 否
- [ ] 从选定铭牌向南数梧桐树，记录间距：
  - 第1棵距离铭牌：______米
  - 树间平均间距：约______米
- [ ] 记录地砖花纹类型（拍照）：______
- [ ] 拍摄梧桐树影落在墙上的照片
- [ ] 步行至武康路，记录用时：______分钟

## 站点7：武康大楼（武康路393号）

- [ ] 站在船头正前方，拍摄正立面全景
- [ ] 数清每层阳台数量和栏杆风格：
  - 1层拱廊：______个拱
  - 2层阳台：______个，栏杆样式：______
  - 3层阳台：______个，栏杆样式：______
  - （继续记录每层）
- [ ] 标注6个视觉上有区分度的位置（用于密电卡片背面线图）
- [ ] 拍摄各层细节特写
- [ ] 备注/意外发现：

## 全程汇总

- 总步行时间（不含解谜）：______
- 总地铁时间：______
- 任何路线问题（施工、围挡、关闭等）：
```

- [ ] **Step 2: 创建数据录入模板**

创建 `fieldwork/data.json`:

```json
{
  "_comment": "踩点数据——回来后填入，用于生成最终谜题参数",
  "station1_peace_hotel": {
    "deco_element_count": null,
    "deco_element_description": "",
    "east_entrance_inscription": "",
    "inscription_year": null,
    "photos": []
  },
  "station2_customs_house": {
    "roman_numeral_4_style": "IIII",
    "visible_column_count": null,
    "clock_chime_pattern": "",
    "photos": []
  },
  "station3_hsbc": {
    "lions_present": true,
    "roaring_lion_side": "",
    "silent_lion_paw_object": "",
    "lion_nose_distance_cm": null,
    "roof_countable_element": "",
    "roof_element_count": null,
    "photos": []
  },
  "station4_yuyuan": {
    "bridge_turn_sequence": [],
    "pavilion_ridge_beast_count": null,
    "ridge_beast_facing": "",
    "photos": []
  },
  "station5_xintiandi": {
    "face_in_scrollwork_address": "",
    "detail_photos": [],
    "photos": []
  },
  "station6_sinan": {
    "zhou_residence_address": "",
    "selected_plaque_location": "",
    "plaque_full_text": "",
    "plaque_faces_zhou_residence": true,
    "tree_spacing_meters": null,
    "tile_pattern_description": "",
    "photos": []
  },
  "station7_wukang": {
    "floors": [],
    "six_distinct_points": [],
    "photos": []
  },
  "route_timing": {
    "bund_walk_minutes": null,
    "bund_to_yuyuan_minutes": null,
    "metro_minutes": null,
    "xintiandi_to_sinan_minutes": null,
    "sinan_to_wukang_minutes": null,
    "total_walk_minutes": null
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add fieldwork/
git commit -m "feat: add fieldwork checklist and data template"
```

---

## Phase 2: 叙事内容创作

### Task 3: 写7篇日记残页

这是全游戏最重要的文本。每篇日记需要满足三重约束：
1. **首字** 组成 "你走过的每一步"
2. **嵌入一句** "无法留住所见"的感叹（终章Meta铺垫）
3. **包含解谜线索**（有些当下有用，有些要到后面的关卡才用到）

**Files:**
- Create: `content/diary-1-peace-hotel.md`
- Create: `content/diary-2-customs-house.md`
- Create: `content/diary-3-hsbc.md`
- Create: `content/diary-4-yuyuan.md`
- Create: `content/diary-5-xintiandi.md`
- Create: `content/diary-6-sinan.md`
- Create: `content/diary-7-wukang.md`

- [ ] **Step 1: 写第1篇日记（和平饭店，首字="你"）**

创建 `content/diary-1-peace-hotel.md`:

```markdown
# 日记第1篇：和平饭店

> 首字约束：你
> 暗线句：绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。
> 解谜线索：引出"数装饰元素"、暗含后续关卡用的密码线索

---

**你**站在和平饭店的门前了吗？

我第一次到这里是1941年的冬天。那时候她还叫华懋饭店，大堂里坐满了各国人——有些在喝酒，有些在交换不该交换的东西。我是后者。

绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。

你要做的第一件事：抬头看。不是看那座所有人都会拍照的绿色金字塔——而是看她下面的脸。Art Deco风格的建筑总是在重复某种图案，像一个执念。数清那个图案重复了多少次。这个数字是你的第一把钥匙。

绿塔之下的那张脸，她重复自己多少次，就是打开第一把锁的钥匙。

还有一件事——你如果碰到了那扇东面的门，抬头看看她的眉心。建筑的生日通常藏在那种地方。

我今天在那扇门前站了很久。门里传来爵士乐。我没有进去。

[暗格7] 海关的心跳每刻钟响几下？这件事你迟早需要知道。
[暗格12] 鹤影只信任能看到周公故居的那面墙。
```

- [ ] **Step 2: 写第2篇日记（海关大楼，首字="走"）**

创建 `content/diary-2-customs-house.md`:

```markdown
# 日记第2篇：海关大楼

> 首字约束：走
> 暗线句：钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。
> 解谜线索：引出"罗马数字的谎"和"数柱子"

---

**走**过钟楼之下的时候，你听到钟声了吗？

海关大楼的钟是上海的心跳。整个租界区的人靠她对表。我也是。每次接头前我都在这里校准时间——特工最不能出错的就是时间。

钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。

你注意过她脸上的数字吗？罗马人总是骄傲地在所有东西上刻字，但他们在这里撒了一个谎。仔细看那个"四"。看到了吗？这件事全上海可能只有你和我注意过。

钟楼是我们的校准器。记住她脸上那个谎言代表的数字，再数数她脚下的巨腿——那些支撑整栋大楼的柱子。但只数你站在这里能看见的。一个数字指引行，一个数字指引列。在你的地图上找到那个交叉点。

找到交叉点之后别急——那里的文字还需要再翻译一次。用什么翻译？你翻翻我之前写的东西，有一句话现在应该有意义了。
```

- [ ] **Step 3: 写第3篇日记（汇丰银行，首字="过"）**

创建 `content/diary-3-hsbc.md`:

```markdown
# 日记第3篇：汇丰银行大楼

> 首字约束：过
> 暗线句：那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。
> 解谜线索：引出"镜像解密"和"纸尺丈量"

---

**过**了江边最后一头狮子，就没有退路了。

汇丰大楼门前蹲着两头铜狮子。一头张着嘴——据说它在吼，可我觉得它在笑。另一头闭着嘴。我更喜欢第二头。

那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。

你去看看那头沉默的狮子——它在左边还是右边？它的脚下踩着什么东西？记住这些。然后取出我留给你的那张纸——就是那张看上去什么都没写的纸。

真相只在对称之中。你需要一面镜子。现在每个人口袋里都揣着一面，只是多数人只用它来照自己。

但纸上的话是不完整的。你还需要抬头看——看这栋楼的脊背上面。数那些长在天际线上的东西。

等你补全了那句话，它会让你做一件你大概没做过的事：去量一量两头狮子之间有多远。用我给你的那把特殊的尺。
```

- [ ] **Step 4: 写第4篇日记（豫园九曲桥，首字="的"）**

创建 `content/diary-4-yuyuan.md`:

```markdown
# 日记第4篇：豫园九曲桥

> 首字约束：的
> 暗线句：桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。
> 解谜线索：引出"走桥记弯"和"脊兽观察"

---

**的**确，这座桥连鬼都追不上。

你知道为什么这座桥要修成弯的吗？上海人说，鬼只能走直线。桥修成九曲，鬼走到第一个弯就会掉进水里。

我不信鬼。但我信一件事：特工也不能走直线。直线意味着可预测，可预测意味着死。所以我喜欢这座桥。

走过那座鬼都追不上的桥，把每一次转弯记下来——左还是右，一个都不能漏。弯道就是密码。

桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。

走到桥尽头，你会看到一座老亭子。抬头看她的屋檐——上面蹲着一排小兽。中国人叫它们瑞兽，或者脊兽。它们永远看着外面，永远不回头。数清它们。

然后，你要回到那张迷宫上——第二次。这一次规则变了。瑞兽的数量就是新规则的钥匙。

从石头的世界里找到一张脸。在石门之上，卷草纹里，有人在等你。
```

- [ ] **Step 5: 写第5篇日记（一大会址，首字="每"）**

创建 `content/diary-5-xintiandi.md`:

```markdown
# 日记第5篇：一大会址/新天地

> 首字约束：每
> 暗线句：石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。
> 解谜线索：引出"照片配对"和"石库门寻找"

---

**每**一扇石库门都有不同的眉。

你见过上海的石库门吗？不是新天地里翻修过的那种——我说的是原来的。每一扇门上面都有一道石头雕的眉毛，有些是西洋的卷草，有些是中国的花纹，有些两样都有。这就是上海。什么都混在一起，但奇怪地好看。

石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。

你手里应该有几张照片了。那些照片里的东西，都藏在这附近的石头门上。你要一个一个去找到它们。但是注意——照片没有告诉你的东西，实物会告诉你。

认得出这些门面的人，才配读这封信。

找到之后把门牌号记下来。奇数归奇数，偶数归偶数。两组各自拼出一句话。一个问题，一个答案——虽然答案不会那么直接。

法国梧桐的阴影里，有一面墙在等你。
```

- [ ] **Step 6: 写第6篇日记（思南公馆，首字="一"）**

创建 `content/diary-6-sinan.md`:

```markdown
# 日记第6篇：思南公馆

> 首字约束：一
> 暗线句：梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。
> 解谜线索：引出"格栅叠加"和"梧桐树下地砖"

---

**一**面墙可以藏住多少秘密？

我在思南路上有一个死信箱。"死信箱"——这个名字听着吓人，但它是我们最安全的通信方式。不需要见面，不需要说话。只需要在一个约定的地方放一段看似无关的文字，然后等你的同志带着正确的窗格来读。

情报员从不直接传递消息。在所有人都看得到的地方放一段文字，只有持有正确窗格的人才能读出真正的内容。

梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。

你要找到那面墙。我给你一个提示——我只信任一面墙，就是从那里能看到周公的老房子的那面。找到它，然后拿出你的窗格。

窗格会告诉你下一步。你可能需要低下头，看看我们脚下这座城市最不引人注意的东西。
```

- [ ] **Step 7: 写第7篇日记（武康大楼，首字="步"）**

创建 `content/diary-7-wukang.md`:

```markdown
# 日记第7篇：武康大楼

> 首字约束：步
> 暗线句：这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。
> 解谜线索：引出"卡片背面拼图"和"终极拼合"

---

**步**入这艘永不启航的船。

武康路尽头有一栋楼，像一艘大船的船头。一个匈牙利人设计了她——我有时候想，他是不是也想离开上海，但是走不了。所以他造了一艘走不了的船。

这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。

你现在手里应该有六张卡片了。把它们翻过来。你一路上都没注意过它们的背面吧？

把六张背面拼在一起。你会看到一幅画。画上有六个记号——它们指向这艘船身上的六个位置。你要站在船头，一个一个看过去。

第七段不在任何藏匿点——它在你来时的路上。

等你集齐了所有碎片，你还需要把它们排对。直接读是不通的。从东到西，从旧到新，从喧嚣到宁静——船头看向东方，那是开始的方向。

然后你就可以打开那个信封了。
```

- [ ] **Step 8: 验证首字连读**

手动确认7篇日记首字：
- 第1篇："**你**站在和平饭店…" → 你
- 第2篇："**走**过钟楼之下…" → 走
- 第3篇："**过**了江边最后…" → 过
- 第4篇："**的**确，这座桥…" → 的
- 第5篇："**每**一扇石库门…" → 每
- 第6篇："**一**面墙可以…" → 一
- 第7篇："**步**入这艘永不…" → 步

连读：**你走过的每一步** ✓

- [ ] **Step 9: Commit**

```bash
git add content/diary-*.md
git commit -m "feat: complete 7 diary entries with acrostic '你走过的每一步'"
```

---

### Task 4: 写信封内容物

**Files:**
- Create: `content/envelope-letter.md`
- Create: `content/envelope-checklist.md`

- [ ] **Step 1: 写鹤影遗书**

创建 `content/envelope-letter.md`:

```markdown
# 鹤影遗书

> 通关后拆开的信封内第一张纸。仿手写体，泛黄纸张质感。

---

如果你正在读这封信，说明有人走完了我最后走过的路。

我必须对你坦白——没有什么军事密电。从来没有。

我知道自己活不过这个冬天。我只是想把这条路留下来。我想让一个人——哪怕是一个素不相识的人，在很多年以后——走一遍我最后看过的上海。从饭店的绿塔，到钟楼的谎言，到狮子的沉默，到九曲桥的弯道，到石库门的脸，到梧桐树的阴影，到那艘永远不会开走的船。

这些地方不会记住我，但如果你今天认真看了它们，那你的记忆里就有了我看过的东西。

这样的话，我就没有真的消失。

——鹤影
1943年秋，上海
```

- [ ] **Step 2: 写鹤影清单**

创建 `content/envelope-checklist.md`:

```markdown
# 鹤影清单

> 信封内第二张纸。更小的纸条，同样仿手写体。
> 每一条必须用删除线划掉——表达"写了又觉得不敢奢望"的心理。

---

**标题：** 如果有一天有人替我走这条路——帮我留住这些。

1. ~~绿塔在光线里的样子~~
2. ~~钟的脸~~
3. ~~那头不说话的狮子~~
4. ~~桥上回头看到的水面~~
5. ~~石头门楣上那张脸~~
6. ~~梧桐的影子~~
7. ~~那艘船的船头~~
```

- [ ] **Step 3: Commit**

```bash
git add content/envelope-*.md
git commit -m "feat: add envelope contents - letter and checklist"
```

---

### Task 5: 设计密电拆分方案与谜语/线索文本

**Files:**
- Create: `content/cipher-fragments.md`
- Create: `content/riddles-and-clues.md`

- [ ] **Step 1: 设计密电7段拆分**

创建 `content/cipher-fragments.md`:

```markdown
# 密电拆分方案

## 完整密电

> 此生未能再见，但你走过的每一条路，我都提前走过一遍。

## 拆分方案

游戏中密电的获取顺序（关卡1-7）和最终阅读顺序不同。
每张卡片背面的隐藏数字标示了正确的阅读位置。

| 获取顺序（关卡） | 卡片背面隐藏数字 | 密电片段 |
|:---:|:---:|:---|
| 关卡1 | 5 | 每一条路 |
| 关卡2 | 3 | 但你 |
| 关卡3 | 7 | 走过一遍 |
| 关卡4 | 1 | 此生 |
| 关卡5 | 4 | 走过的 |
| 关卡6 | 6 | 我都提前 |
| 关卡7 | 2 | 未能再见 |

## 正确阅读顺序

按隐藏数字 1→7 排列：

1. 此生（关卡4获得）
2. 未能再见（关卡7获得）
3. 但你（关卡2获得）
4. 走过的（关卡5获得）
5. 每一条路（关卡1获得）
6. 我都提前（关卡6获得）
7. 走过一遍（关卡3获得）

→ **此生未能再见，但你走过的每一条路，我都提前走过一遍。**

## 设计意图

- 获取顺序刻意打乱，直接按关卡顺序读不通
- 每张卡片背面有建筑轮廓局部图（拼成武康大楼），隐藏数字融入线图中
- 第7关的"排列之谜"就是发现并使用这些隐藏数字
```

- [ ] **Step 2: 设计各关谜语和过渡线索**

创建 `content/riddles-and-clues.md`:

```markdown
# 谜语与线索汇总

## 关卡间过渡线索

| 来源 | 线索文字 | 指向 |
|------|---------|------|
| 关卡1 解出 | "钟声之下，罗马人撒了谎。" | 海关大楼钟面IIII |
| 关卡2 解出 | "去问沉默的那头狮子，它的脚下踩着什么。" | 汇丰银行闭嘴铜狮 |
| 关卡3 解出 | "鬼走不了的那条路上，每个弯道都是一个字。" | 豫园九曲桥 |
| 关卡4 解出 | "石门之上，卷草纹里藏着一张脸。" | 一大会址石库门门楣 |
| 关卡5 解出 | "法国梧桐的阴影里，有一面墙在等你。" | 思南公馆铭牌 |
| 关卡6 解出 | "去找那艘永远不会开走的船。" | 武康大楼 |

## 关卡内谜语

### 第1关

转盘解密后得到的谜语：
> "她诞生之年藏在东面入口的眉心。找到它，用首尾相减。"

- "她" = 和平饭店
- "眉心" = 门楣
- "诞生之年" = 建造年份铭刻
- "首尾相减" = 年份首位数字 - 末位数字

### 第2关

日记暗格中的线索（当时看起来无意义，第2关会用到）：
> "海关的心跳每刻钟响几下？"

答案 = 海关大钟每刻钟报时次数 → 密码转盘第二次偏移量

### 第3关

镜像解密后得到的不完整文字：
> "从左狮鼻尖到右狮鼻尖，用纸尺量。尺上______刻度处的字母，就是第三段密电的钥匙。"
> （空格 = "脊上之数"对应的数值，需观察屋顶后填入）

### 第4关

迷宫第一遍路径解出的指令：
> "湖心亭顶上，数瑞兽。它们注视的方向藏着第二条桥。"

### 第5关

两组门牌号排列后形成的问答对：
> 问："鹤影最后一次使用这个信箱是哪一年？"
> 答线索：[由照片配对结果动态生成——取决于实地踩点确认的具体门牌号]

### 第6关

格栅叠加后的指令：
> "从这里向南走，数第__FIELD__棵梧桐树。它脚下的地砖纹路是最后的钥匙。"

## 加密文本设计

所有加密使用凯撒密码（字母/拼音位移），偏移量由关卡内观察获得。

具体加密文本需在踩点确认数值后生成。

### 加密参数占位

| 关卡 | 加密原文 | 偏移量来源 | 偏移量值 |
|------|---------|-----------|---------|
| 1 | 转盘解密谜语 | Art Deco装饰数量 | __FIELD__ |
| 2 | 地图坐标格中的密电片段 | 大钟报时次数 | __FIELD__ |
| 3 | 日记中提取密电片段的索引 | 纸尺丈量结果 | __FIELD__ |
```

- [ ] **Step 3: Commit**

```bash
git add content/cipher-fragments.md content/riddles-and-clues.md
git commit -m "feat: add cipher fragment mapping and riddle/clue texts"
```

---

## Phase 3: H5 Web 应用开发

### Task 6: 搭建 H5 应用骨架

**Files:**
- Create: `app/package.json`
- Create: `app/vite.config.js`
- Create: `app/index.html`
- Create: `app/src/main.js`
- Create: `app/src/App.vue`
- Create: `app/src/router.js`
- Create: `app/src/styles/theme.css`

- [ ] **Step 1: 初始化 app 项目**

创建 `app/package.json`:

```json
{
  "name": "seventh-cipher-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.5.0",
    "pinia": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "vite": "^6.1.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

创建 `app/vite.config.js`:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    host: true,
    port: 3000
  }
})
```

- [ ] **Step 3: 创建 index.html 入口**

创建 `app/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>第七封密电</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建全局主题样式**

创建 `app/src/styles/theme.css`:

```css
:root {
  --bg-primary: #f5f0e8;
  --bg-secondary: #ebe4d4;
  --text-primary: #2c1810;
  --text-secondary: #5c4a3a;
  --accent: #8b4513;
  --accent-light: #a0522d;
  --border: #c4b59a;
  --success: #4a7c59;
  --error: #8b2500;
  --font-body: 'Noto Serif SC', 'Songti SC', serif;
  --font-handwriting: 'ZCOOL XiaoWei', 'STKaiti', cursive;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* 旧纸质感背景 */
.paper-texture {
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(160, 82, 45, 0.04) 0%, transparent 50%);
  background-color: var(--bg-primary);
}

/* 打字机文字动画 */
@keyframes typewriter {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.typewriter-line {
  animation: typewriter 0.4s ease-out forwards;
  opacity: 0;
}

/* 密电卡片样式 */
.cipher-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 16px;
  font-family: var(--font-handwriting);
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn-primary {
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  font-family: var(--font-body);
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.2s;
}

.btn-primary:active {
  background: var(--accent-light);
}

/* 输入框 */
.input-answer {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  font-size: 18px;
  font-family: var(--font-body);
  color: var(--text-primary);
  border-radius: 2px;
}

.input-answer:focus {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
```

- [ ] **Step 5: 创建 main.js 入口**

创建 `app/src/main.js`:

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router.js'
import './styles/theme.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 6: 创建路由**

创建 `app/src/router.js`:

```js
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./pages/Home.vue') },
  { path: '/stage/:id', name: 'stage', component: () => import('./pages/Stage.vue'), props: true },
  { path: '/transit/:from/:to', name: 'transit', component: () => import('./pages/Transit.vue'), props: true },
  { path: '/finale', name: 'finale', component: () => import('./pages/Finale.vue') },
  { path: '/archive', name: 'archive', component: () => import('./pages/Archive.vue') },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
```

- [ ] **Step 7: 创建 App.vue**

创建 `app/src/App.vue`:

```vue
<template>
  <div class="app-shell paper-texture">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 8: 安装依赖并验证启动**

```bash
cd D:/work/shanghaitrip/app && npm install
npm run dev
```

预期：Vite dev server 启动，浏览器访问 `http://localhost:3000` 显示空白页（无报错）。

- [ ] **Step 9: Commit**

```bash
cd D:/work/shanghaitrip
git add app/
git commit -m "feat: scaffold H5 app with Vue 3 + Vite + router"
```

---

### Task 7: 实现游戏状态管理

**Files:**
- Create: `app/src/stores/game.js`
- Create: `app/src/utils/photo-store.js`

- [ ] **Step 1: 创建照片存储工具（IndexedDB）**

创建 `app/src/utils/photo-store.js`:

```js
const DB_NAME = 'seventh-cipher'
const STORE_NAME = 'photos'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePhoto(stageId, blob) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, `stage-${stageId}`)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPhoto(stageId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(`stage-${stageId}`)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function getAllPhotos() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const photos = {}
    const req = store.openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor) {
        photos[cursor.key] = cursor.value
        cursor.continue()
      } else {
        resolve(photos)
      }
    }
    req.onerror = () => reject(req.error)
  })
}
```

- [ ] **Step 2: 创建 Pinia 游戏状态 store**

创建 `app/src/stores/game.js`:

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 持久化到 localStorage
  const saved = JSON.parse(localStorage.getItem('game-state') || 'null')

  const currentStage = ref(saved?.currentStage ?? 0) // 0=未开始, 1-7=关卡, 8=终章, 9=通关
  const currentStep = ref(saved?.currentStep ?? 0)
  const cipherFragments = ref(saved?.cipherFragments ?? {}) // { 1: "每一条路", 2: "但你", ... }
  const photosTaken = ref(saved?.photosTaken ?? []) // [1, 3, 5] = 已拍第1、3、5关
  const hintsUsed = ref(saved?.hintsUsed ?? {}) // { "1-2": 1 } = 第1关第2步用了1次提示
  const startTime = ref(saved?.startTime ?? null)
  const stageStartTimes = ref(saved?.stageStartTimes ?? {})
  const stageClearTimes = ref(saved?.stageClearTimes ?? {})

  const isStarted = computed(() => currentStage.value > 0)
  const isFinished = computed(() => currentStage.value >= 9)
  const collectedCount = computed(() => Object.keys(cipherFragments.value).length)

  function persist() {
    localStorage.setItem('game-state', JSON.stringify({
      currentStage: currentStage.value,
      currentStep: currentStep.value,
      cipherFragments: cipherFragments.value,
      photosTaken: photosTaken.value,
      hintsUsed: hintsUsed.value,
      startTime: startTime.value,
      stageStartTimes: stageStartTimes.value,
      stageClearTimes: stageClearTimes.value,
    }))
  }

  function startGame() {
    currentStage.value = 1
    currentStep.value = 1
    startTime.value = Date.now()
    stageStartTimes.value[1] = Date.now()
    persist()
  }

  function advanceStep() {
    currentStep.value++
    persist()
  }

  function completeStage(stageId, fragment) {
    cipherFragments.value[stageId] = fragment
    stageClearTimes.value[stageId] = Date.now()
    persist()
  }

  function goToNextStage() {
    if (currentStage.value < 8) {
      currentStage.value++
      currentStep.value = 1
      stageStartTimes.value[currentStage.value] = Date.now()
    }
    persist()
  }

  function enterFinale() {
    currentStage.value = 8
    currentStep.value = 1
    persist()
  }

  function completeGame() {
    currentStage.value = 9
    persist()
  }

  function recordPhoto(stageId) {
    if (!photosTaken.value.includes(stageId)) {
      photosTaken.value.push(stageId)
    }
    persist()
  }

  function useHint(stageId, stepId) {
    const key = `${stageId}-${stepId}`
    hintsUsed.value[key] = (hintsUsed.value[key] || 0) + 1
    persist()
  }

  function resetGame() {
    currentStage.value = 0
    currentStep.value = 0
    cipherFragments.value = {}
    photosTaken.value = []
    hintsUsed.value = {}
    startTime.value = null
    stageStartTimes.value = {}
    stageClearTimes.value = {}
    localStorage.removeItem('game-state')
  }

  return {
    currentStage, currentStep, cipherFragments, photosTaken, hintsUsed,
    startTime, stageStartTimes, stageClearTimes,
    isStarted, isFinished, collectedCount,
    startGame, advanceStep, completeStage, goToNextStage,
    enterFinale, completeGame, recordPhoto, useHint, resetGame, persist,
  }
})
```

- [ ] **Step 3: Commit**

```bash
git add app/src/stores/ app/src/utils/
git commit -m "feat: add game state store and photo IndexedDB storage"
```

---

### Task 8: 实现谜题数据层

**Files:**
- Create: `app/src/data/puzzles.js`
- Create: `app/src/data/narrative.js`
- Create: `app/src/utils/cipher.js`

- [ ] **Step 1: 创建凯撒密码工具**

创建 `app/src/utils/cipher.js`:

```js
// 用于玩家在小程序内验证密码转盘解密结果
// 支持中文字符的简单位移密码

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * 凯撒密码加密（拉丁字母）
 * @param {string} text 明文
 * @param {number} shift 偏移量
 * @returns {string} 密文
 */
export function caesarEncrypt(text, shift) {
  return text.split('').map(ch => {
    const idx = ALPHABET.indexOf(ch.toUpperCase())
    if (idx === -1) return ch // 非字母原样保留
    const shifted = ALPHABET[(idx + shift) % 26]
    return ch === ch.toLowerCase() ? shifted.toLowerCase() : shifted
  }).join('')
}

/**
 * 凯撒密码解密
 */
export function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, 26 - (shift % 26))
}

/**
 * 简单数字验证——检查答案是否匹配（忽略空格和大小写）
 */
export function checkAnswer(input, expected) {
  const normalize = s => s.toString().trim().toLowerCase().replace(/\s+/g, '')
  return normalize(input) === normalize(expected)
}
```

- [ ] **Step 2: 创建谜题数据**

创建 `app/src/data/puzzles.js`:

```js
// __FIELD__ 标记的值需要踩点后替换为真实数据

export const STAGES = [
  null, // index 0 unused, stages are 1-indexed
  // ============ 第1关：和平饭店 ============
  {
    id: 1,
    title: '绿塔之下',
    location: '和平饭店',
    address: '外滩20号（南京东路口）',
    photoPrompt: '拍下接头点外观，存档备查',
    photoSubject: '绿塔在光线里的样子',
    diaryQuote: '绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。',
    cipherFragment: '每一条路', // 密电第1段（阅读顺序为第5）
    cardBackNumber: 5,
    steps: [
      {
        id: 1,
        title: '数她的面孔',
        instruction: '抬头看和平饭店正立面——找到那种不断重复的 Art Deco 装饰图案。数清它出现了多少次。',
        answerType: 'number',
        answer: '__FIELD__', // 踩点后填入实际数字
        hints: [
          '不是看绿色金字塔本身，而是看它下面的墙面装饰。',
          '寻找一种几何形状的重复纹饰——扇形、孔雀尾、或放射线条。',
          '答案是 __FIELD__。'
        ],
      },
      {
        id: 2,
        title: '转盘初解',
        instruction: '用你刚才数到的数字设置密码转盘的偏移量，解密档案袋中"第一封密函"的加密文字。',
        answerType: 'text',
        answer: '她诞生之年藏在东面入口的眉心', // 解密后的谜语（前半）
        answerNormalized: '她诞生之年藏在东面入口的眉心',
        hints: [
          '把密码转盘外圈的指针对准你数到的数字，然后逐字母对照解密。',
          '解出来的是一条谜语，不是密电本身。',
          '谜语全文：她诞生之年藏在东面入口的眉心。找到它，用首尾相减。'
        ],
        // 小程序只验证玩家是否正确理解了谜语，接受"找到了"作为通过
        skipVerification: true,
        narrativeAfter: '很好。"眉心"就是门楣——建筑入口上方的装饰。去找和平饭店东侧入口的门楣，看看她的"诞生之年"。',
      },
      {
        id: 3,
        title: '眉心之数',
        instruction: '找到东面入口门楣上的年份铭刻。用首位数字减去末位数字。然后把这个数字乘以第一步的数字——得到的结果就是日记暗格编号。',
        answerType: 'text',
        answer: '__FIELD__', // 密电片段，踩点后计算并填入
        hints: [
          '门楣 = 入口正上方的石刻装饰区域。年份通常刻在那里。',
          '比如如果年份是1929，首尾相减 = 1-9 = ？取绝对值。',
          '暗格编号 = 第一步的数字 × 首尾相减的结果。在日记第1页找这个编号。'
        ],
      },
    ],
    transition: {
      clue: '钟声之下，罗马人撒了谎。',
      direction: '沿外滩向南步行约3分钟，找到那座有巨大钟楼的建筑。',
      walkMinutes: 3,
    },
  },
  // ============ 第2关：海关大楼 ============
  {
    id: 2,
    title: '罗马人的谎言',
    location: '海关大楼',
    address: '外滩13号',
    photoPrompt: '记录校准器，以备后续对表',
    photoSubject: '钟的脸',
    diaryQuote: '钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。',
    cipherFragment: '但你',
    cardBackNumber: 3,
    steps: [
      {
        id: 1,
        title: '找到那个谎',
        instruction: '抬头看海关大楼的钟面。仔细看罗马数字——找到那个"谎言"。那个数字应该怎么写？实际上写成了什么？',
        answerType: 'text',
        answer: 'IIII',
        hints: [
          '罗马数字中的4通常写作……？',
          '标准写法是 IV，但钟面上写的是？',
          '钟面上的4写成了 IIII —— 这是钟表界的传统，但和标准罗马数字不同。谎言之数 = 4。'
        ],
      },
      {
        id: 2,
        title: '丈量殿堂',
        instruction: '现在看钟楼下方——数一数你面前可见的大柱子有多少根。只数你从正面能看到的。',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '面对海关大楼正门，数底层的大型立柱。',
          '不需要走到侧面——只数正面视角可见的柱子。',
          '答案是 __FIELD__ 根。'
        ],
      },
      {
        id: 3,
        title: '地图坐标',
        instruction: '用"谎言之数"4作为行号，柱子数量作为列号。在你的网格老地图上找到这个坐标。',
        answerType: 'text',
        answer: '__FIELD__', // 坐标格中的加密文字，踩点后设计
        hints: [
          '行 = 4（从谎言之数得来），列 = 你刚数的柱子数。',
          '在老地图上找到第4行第__FIELD__列的格子。',
          '格子里有一小段加密文字，你需要再用密码转盘解密一次。'
        ],
      },
      {
        id: 4,
        title: '二次解密',
        instruction: '回头看日记——"海关的心跳每刻钟响几下？"这个数字就是新的密码转盘偏移量。用它解密地图格中的文字。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '海关大钟每刻钟（15分钟）的报时次数是多少？',
          '如果你恰好在整点或刻钟可以听到。否则想想：通常大钟的报时规律是什么？',
          '偏移量 = __FIELD__。用密码转盘解密后得到密电片段。'
        ],
      },
    ],
    transition: {
      clue: '去问沉默的那头狮子，它的脚下踩着什么。',
      direction: '向南走一分钟，到外滩12号门口。找到两头铜狮。',
      walkMinutes: 1,
    },
  },
  // ============ 第3关：汇丰银行大楼 ============
  {
    id: 3,
    title: '双面狮',
    location: '汇丰银行大楼',
    address: '外滩12号',
    photoPrompt: '拍下沉默之狮，确认接头标记',
    photoSubject: '那头不说话的狮子',
    diaryQuote: '那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。',
    cipherFragment: '走过一遍',
    cardBackNumber: 7,
    steps: [
      {
        id: 1,
        title: '沉默之狮',
        instruction: '找到两尊铜狮。哪一头闭着嘴？它在你面对建筑时的左边还是右边？它的前爪踩着什么？',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '两头狮子一头张嘴（吼狮），一头闭嘴（沉默之狮）。',
          '面对建筑大门观察——哪一侧是闭嘴的？',
          '闭嘴狮在__FIELD__侧，前爪踩着__FIELD__。'
        ],
      },
      {
        id: 2,
        title: '镜像初现',
        instruction: '取出情报纸。根据沉默之狮的方向，打开手机前置摄像头，将屏幕竖在情报纸对应侧的边缘当镜子。看镜中与纸面拼合后出现了什么。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '手机前置摄像头 = 镜子。把手机屏幕垂直立在纸的边缘。',
          '如果沉默之狮在左侧，就把手机立在纸的左边缘；反之亦然。',
          '你会看到一幅建筑简笔画和一行文字——但文字有空格需要填。'
        ],
      },
      {
        id: 3,
        title: '脊上之数',
        instruction: '镜像中的简笔画是这栋楼的穹顶轮廓。抬头看实物——数屋顶天际线上的可数元素。用这个数字填入文字的空格。',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '看汇丰银行的穹顶和屋脊线。',
          '找旗杆、雕塑、装饰球等可数元素。',
          '数量是 __FIELD__。'
        ],
      },
      {
        id: 4,
        title: '纸尺丈量',
        instruction: '补全后的文字告诉你：用纸尺量两头狮子鼻尖之间的距离。纸尺上那个刻度位置的字符就是解密钥匙。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '拿出档案袋里的纸尺，从一头狮子的鼻子量到另一头。',
          '纸尺上不是真实厘米——上面每隔一段标了不同的字母/汉字。',
          '两狮距离对应的刻度字符 = 第三段密电的解密钥匙。用它从日记中提取密电。'
        ],
      },
    ],
    transition: {
      clue: '鬼走不了的那条路上，每个弯道都是一个字。',
      direction: '向南步行约12分钟，穿过老街，前往豫园九曲桥。',
      walkMinutes: 12,
    },
  },
  // ============ 第4关：豫园九曲桥 ============
  {
    id: 4,
    title: '鬼道',
    location: '豫园九曲桥',
    address: '豫园商城内',
    photoPrompt: '记录来路，确认未被跟踪',
    photoSubject: '桥上回头看到的水面',
    diaryQuote: '桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。',
    cipherFragment: '此生',
    cardBackNumber: 1,
    steps: [
      {
        id: 1,
        title: '记录弯道',
        instruction: '走上九曲桥。从桥头走到桥尾，每到一个转弯处记录方向：左（L）还是右（R）。把完整序列输入。',
        answerType: 'text',
        answer: '__FIELD__', // 如 "RLLRRLRLR"
        hints: [
          '从商城侧桥头开始走，面朝湖心亭方向。',
          '每次路明显转弯时记录 L 或 R。',
          '完整序列是 __FIELD__。'
        ],
      },
      {
        id: 2,
        title: '迷宫追踪',
        instruction: '取出方格迷宫图，从标记的起点出发。按你记录的 L/R 序列走：遇 R 右转，遇 L 左转。读出路径经过的格子中的字。',
        answerType: 'text',
        answer: '湖心亭顶上数瑞兽它们注视的方向藏着第二条桥',
        hints: [
          '从迷宫图上标着★的格子开始。',
          '每遇到一个弯，按序列下一个字母转向。',
          '读出每个经过的格子中的字，连成一句话。'
        ],
      },
      {
        id: 3,
        title: '瑞兽与方位',
        instruction: '走到湖心亭，抬头看飞檐——数脊兽有几只。',
        answerType: 'number',
        answer: '__FIELD__',
        hints: [
          '脊兽是蹲在屋脊边缘的小型神兽雕塑。',
          '数飞檐角上排列的那些小动物。',
          '一共 __FIELD__ 只。'
        ],
      },
      {
        id: 4,
        title: '第二条桥',
        instruction: '回到迷宫图，再走一遍。新规则：每走脊兽数量步就反转方向（L变R，R变L）。读出新路径的格子文字。',
        answerType: 'text',
        answer: '__FIELD__', // 密电片段 + 过渡线索
        hints: [
          '比如脊兽数是3，就每走3步把之后的L全变R、R全变L，再走3步又变回来。',
          '新序列产生新路径——经过的格子拼成新句子。',
          '新句子包含密电片段和下一站线索。'
        ],
      },
    ],
    transition: {
      clue: '石门之上，卷草纹里藏着一张脸。',
      direction: '前往豫园地铁站，乘10号线2站到新天地站。',
      walkMinutes: 5,
      metro: { line: '10号线', from: '豫园', to: '新天地', stops: 2 },
    },
  },
  // ============ 第5关：一大会址/新天地 ============
  {
    id: 5,
    title: '石库门暗语',
    location: '中共一大会址 / 新天地',
    address: '兴业路76号及周边',
    photoPrompt: '存档信箱位置',
    photoSubject: '石头门楣上那张脸',
    diaryQuote: '石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。',
    cipherFragment: '走过的',
    cardBackNumber: 4,
    steps: [
      {
        id: 1,
        title: '寻找那张脸',
        instruction: '在一大会址周边的石库门建筑群中，找到门楣卷草纹装饰里隐含人脸图案的那一处。记录门牌号。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '卷草纹是一种卷曲的藤蔓装饰，常见于石库门的门楣上方。',
          '有些卷草纹的曲线如果仔细看，会组成一张脸的轮廓（眼睛、鼻子、嘴巴）。',
          '位置在__FIELD__路__FIELD__号。'
        ],
      },
      {
        id: 2,
        title: '照片配对',
        instruction: '取出6张建筑细节照片卡。在一大会址和新天地街区中找到每张照片对应的实物。注意观察照片中没有但实物上有的东西——特别是门牌号。',
        answerType: 'text',
        answer: '__FIELD__', // 6个门牌号序列
        hints: [
          '拿着照片在附近街区逐个比对。',
          '找到实物后看照片边缘之外的东西——门牌号、旁边的标识等。',
          '六个位置分别在：__FIELD__'
        ],
      },
      {
        id: 3,
        title: '排列重组',
        instruction: '按门牌号的奇偶分成两组。奇数组和偶数组各自拼出一句话——一个是问题，一个是答案线索。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '奇数门牌号对应的卡片排一起，偶数排一起。',
          '每张卡片除了照片还标注了一个汉字——排起来就成句。',
          '问题："鹤影最后一次使用这个信箱是哪一年？" 答案从交叉线索中推导。'
        ],
      },
      {
        id: 4,
        title: '信箱密码',
        instruction: '用答案年份的各位数字，从日记残页第5页的特定段落逐字提取。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '比如年份是1943，就取日记第5页正文的第1、9、4、3个字。',
          '提取出来的字连成密电片段。',
          '密电第5段：__FIELD__'
        ],
      },
    ],
    transition: {
      clue: '法国梧桐的阴影里，有一面墙在等你。',
      direction: '向西南步行约8分钟，穿过新天地，沿马当路转入思南路。',
      walkMinutes: 8,
    },
  },
  // ============ 第6关：思南公馆 ============
  {
    id: 6,
    title: '死信箱',
    location: '思南公馆',
    address: '思南路沿线',
    photoPrompt: '拍下死信箱周围环境',
    photoSubject: '梧桐的影子',
    diaryQuote: '梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。',
    cipherFragment: '我都提前',
    cardBackNumber: 6,
    steps: [
      {
        id: 1,
        title: '找到那面墙',
        instruction: '沿思南路走，找到一面同时满足两个条件的墙：①上面有文字铭牌/展板 ②正对着周公馆的方向。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '日记里写过："鹤影只信任能看到周公故居的那面墙。"',
          '周公馆（周恩来旧居）在思南路__FIELD__号。先找到它。',
          '然后找一面有文字铭牌且面朝周公馆方向的墙。位置在__FIELD__。'
        ],
      },
      {
        id: 2,
        title: '格栅叠加',
        instruction: '取出窗格卡（Cardan grille），对准铭牌上的文字。读出透过孔洞露出的汉字。',
        answerType: 'text',
        answer: '__FIELD__', // 格栅解密后的指令
        hints: [
          '把窗格卡平整地覆盖在铭牌文字上——孔洞和文字对齐。',
          '可能需要旋转或移动窗格卡找到正确的对齐位置。',
          '透出的字连起来是一条指令——告诉你向南走并数梧桐树。'
        ],
      },
      {
        id: 3,
        title: '梧桐树下',
        instruction: '按指令向南数梧桐树到指定的那棵。低头看树池周围的地砖纹路。在老地图上找到相同纹路的图例。',
        answerType: 'text',
        answer: '__FIELD__',
        hints: [
          '从铭牌位置向南走，数第__FIELD__棵梧桐树。',
          '看树池（树根周围的方形砖框）附近的地砖花纹。',
          '花纹形状对应老地图上的一个图例符号——找到它旁边的文字。'
        ],
      },
    ],
    transition: {
      clue: '去找那艘永远不会开走的船。',
      direction: '继续沿思南路向西南走，经淮海中路，前往武康路尽头。步行约15分钟。',
      walkMinutes: 15,
    },
  },
  // ============ 第7关：武康大楼 ============
  {
    id: 7,
    title: '永不启航的船',
    location: '武康大楼',
    address: '武康路393号',
    photoPrompt: '拍下最终接头点全貌',
    photoSubject: '那艘船的船头',
    diaryQuote: '这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。',
    cipherFragment: '未能再见',
    cardBackNumber: 2,
    steps: [
      {
        id: 1,
        title: '六道门',
        instruction: '站在武康大楼船头正前方。翻出全部6张密电卡片的背面——拼在一起，看看组成了什么。找到线图上标注的6个圆圈。',
        answerType: 'confirm',
        answer: 'ok',
        hints: [
          '把6张卡片并排放在一起，背面朝上。',
          '调整顺序直到线条连贯——组成的是武康大楼正立面的轮廓。',
          '线图上有6个圆圈标记——每个指向大楼立面上的一个具体位置。'
        ],
      },
      {
        id: 2,
        title: '逐一比对',
        instruction: '对照线图和实物建筑，确认6个标记位置的建筑细节特征。用线图图例对照每个特征对应的汉字。',
        answerType: 'text',
        answer: '__FIELD__', // 6个汉字
        hints: [
          '每个圆圈指向一个阳台、拱券或栏杆。',
          '观察该处细节：栏杆是直条还是卷曲？拱是圆弧还是尖弧？',
          '线图图例中每种特征对应一个汉字。6个汉字 = 密电第7段。'
        ],
      },
      {
        id: 3,
        title: '第七段密电',
        instruction: '把6个汉字填入最后一张空白密电卡片。',
        answerType: 'text',
        answer: '未能再见',
        hints: [
          '如果6个汉字连起来读不通，检查你对建筑细节的观察是否准确。',
          '可以互相对比——有些特征的差异很微妙。',
          '第7段密电是：未能再见。'
        ],
      },
      {
        id: 4,
        title: '排列之谜',
        instruction: '7段密电齐了，但按获取顺序读不通。翻看每张卡片背面线图中隐藏的小数字（1-7）——这才是正确的阅读顺序。',
        answerType: 'text',
        answer: '此生未能再见但你走过的每一条路我都提前走过一遍',
        hints: [
          '每张卡片背面的建筑轮廓图里藏了一个小数字。',
          '按数字 1→7 的顺序重新排列卡片。',
          '正确顺序：此生 / 未能再见 / 但你 / 走过的 / 每一条路 / 我都提前 / 走过一遍'
        ],
      },
      {
        id: 5,
        title: '揭晓',
        instruction: '读出完整的密电。',
        answerType: 'confirm',
        answer: 'ok',
        narrativeAfter: '此生未能再见，但你走过的每一条路，我都提前走过一遍。',
      },
    ],
    transition: null, // 最后一关，进入终章
  },
]

// 所有关卡的照片指令汇总（终章用）
export const PHOTO_DIARY_PAIRS = [
  { stage: 1, prompt: '绿塔在光线里的样子', diary: '绿塔在夕阳里的样子，我只能记在脑子里。特工不留痕迹。' },
  { stage: 2, prompt: '钟的脸', diary: '钟声四点响了。我想把这个声音装进口袋带走，但我只能带走数字。' },
  { stage: 3, prompt: '那头不说话的狮子', diary: '那头不说话的狮子，表情比我见过的任何人都诚实。可惜我没法把它的脸撕下来夹进档案。' },
  { stage: 4, prompt: '桥上回头看到的水面', diary: '桥上回头看，水面碎成一千块镜子。这种东西，纸和笔留不住。' },
  { stage: 5, prompt: '石头门楣上那张脸', diary: '石头门楣上那张脸少说看了一百年的人来人往。我从它面前经过的这一次，它不会记得。' },
  { stage: 6, prompt: '梧桐的影子', diary: '梧桐的影子落在墙上，像还没干的墨水。风一吹就会变。明天再来，什么也看不到了。' },
  { stage: 7, prompt: '那艘船的船头', diary: '这艘船哪儿也去不了。但我站在船头的这几分钟，天光是好的。' },
]
```

- [ ] **Step 3: 创建终章叙事数据**

创建 `app/src/data/narrative.js`:

```js
export const FINALE = {
  // 第一层 Meta：日记藏字
  acrostic: {
    prompt: '鹤影在每一站的日记中都藏了一个字。回头看看——每一篇日记残页正文的第一个字。',
    characters: ['你', '走', '过', '的', '每', '一', '步'],
    reveal: '你走过的每一步',
  },

  // 第二层 Meta：信封
  envelope: {
    prompt: '现在，打开那个信封。',
  },

  // 第三层 Meta：档案更名
  archive: {
    renameFrom: '任务档案',
    renameTo: '鹤影档案',
  },
}

export const INTRO_STORY = `1943年秋，代号"鹤影"的情报员截获了一份足以改变战局的日军密电。为防止被捕后情报落入敌手，他将密电拆成7段，分别藏匿于上海7个地点，每一处都留下了只有同志才能读懂的暗号。

鹤影随后失踪，密电再未被拼合。

80年后的今天，一份旧档案意外解封，其中只有一句话——

**"从和平饭店的绿塔开始。"**`
```

- [ ] **Step 4: Commit**

```bash
git add app/src/data/ app/src/utils/cipher.js
git commit -m "feat: add puzzle data, narrative data, and cipher utility"
```

---

### Task 9: 实现核心 UI 组件

**Files:**
- Create: `app/src/components/NarrativeText.vue`
- Create: `app/src/components/AnswerInput.vue`
- Create: `app/src/components/HintSystem.vue`
- Create: `app/src/components/PhotoCapture.vue`
- Create: `app/src/components/Timer.vue`

- [ ] **Step 1: 叙事文字组件（打字机效果）**

创建 `app/src/components/NarrativeText.vue`:

```vue
<template>
  <div class="narrative" :class="{ handwriting: isHandwriting }">
    <p
      v-for="(line, i) in visibleLines"
      :key="i"
      class="typewriter-line"
      :style="{ animationDelay: `${i * 0.6}s` }"
    >{{ line }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  isHandwriting: { type: Boolean, default: false },
  speed: { type: Number, default: 600 }, // ms per line
})

const emit = defineEmits(['complete'])

const lines = computed(() => props.text.split('\n').filter(l => l.trim()))
const shownCount = ref(0)
const visibleLines = computed(() => lines.value.slice(0, shownCount.value))

onMounted(() => {
  const timer = setInterval(() => {
    shownCount.value++
    if (shownCount.value >= lines.value.length) {
      clearInterval(timer)
      emit('complete')
    }
  }, props.speed)
})
</script>

<style scoped>
.narrative {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.narrative.handwriting {
  font-family: var(--font-handwriting);
  font-size: 18px;
}

.narrative p {
  margin-bottom: 12px;
}
</style>
```

- [ ] **Step 2: 答案输入组件**

创建 `app/src/components/AnswerInput.vue`:

```vue
<template>
  <div class="answer-box">
    <div v-if="type === 'confirm'" class="confirm-box">
      <button class="btn-primary" @click="emit('correct')">确认</button>
    </div>
    <div v-else class="input-box">
      <input
        v-model="input"
        :type="type === 'number' ? 'number' : 'text'"
        :placeholder="placeholder"
        class="input-answer"
        @keyup.enter="check"
      />
      <button class="btn-primary" :disabled="!input.trim()" @click="check">验证</button>
      <p v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { checkAnswer } from '../utils/cipher.js'

const props = defineProps({
  answer: { type: [String, Number], required: true },
  type: { type: String, default: 'text' }, // 'text' | 'number' | 'confirm'
  placeholder: { type: String, default: '输入你的答案…' },
})

const emit = defineEmits(['correct'])

const input = ref('')
const feedback = ref('')
const feedbackType = ref('')

function check() {
  if (checkAnswer(input.value, props.answer)) {
    feedback.value = '✓ 正确'
    feedbackType.value = 'success'
    setTimeout(() => emit('correct'), 800)
  } else {
    feedback.value = '答案不对，再想想。'
    feedbackType.value = 'error'
  }
}
</script>

<style scoped>
.input-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback {
  font-size: 14px;
  padding: 8px 0;
}

.feedback.success { color: var(--success); }
.feedback.error { color: var(--error); }
</style>
```

- [ ] **Step 3: 三级提示系统**

创建 `app/src/components/HintSystem.vue`:

```vue
<template>
  <div class="hint-system">
    <button
      v-if="currentLevel < hints.length"
      class="hint-btn"
      @click="showNext"
    >
      {{ currentLevel === 0 ? '需要提示？' : '还是没头绪？再来一条' }}
      <span class="hint-level">（{{ currentLevel }}/{{ hints.length }}）</span>
    </button>
    <div v-for="(hint, i) in shownHints" :key="i" class="hint-card">
      <span class="hint-label">提示 {{ i + 1 }}</span>
      <p>{{ hint }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  hints: { type: Array, required: true },
  stageId: { type: Number, required: true },
  stepId: { type: Number, required: true },
})

const game = useGameStore()
const currentLevel = ref(0)
const shownHints = computed(() => props.hints.slice(0, currentLevel.value))

function showNext() {
  currentLevel.value++
  game.useHint(props.stageId, props.stepId)
}
</script>

<style scoped>
.hint-btn {
  background: none;
  border: 1px dashed var(--border);
  color: var(--text-secondary);
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
}

.hint-level {
  opacity: 0.5;
  font-size: 12px;
}

.hint-card {
  background: var(--bg-secondary);
  border-left: 3px solid var(--accent);
  padding: 12px 16px;
  margin-bottom: 8px;
  font-size: 14px;
}

.hint-label {
  font-size: 12px;
  color: var(--accent);
  text-transform: uppercase;
  display: block;
  margin-bottom: 4px;
}
</style>
```

- [ ] **Step 4: 拍照组件**

创建 `app/src/components/PhotoCapture.vue`:

```vue
<template>
  <div class="photo-capture">
    <div v-if="!captured" class="capture-prompt">
      <p class="prompt-text">📋 情报存档指令</p>
      <p class="prompt-detail">{{ prompt }}</p>
      <label class="capture-btn btn-primary">
        拍照存档
        <input
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden-input"
          @change="onCapture"
        />
      </label>
    </div>
    <div v-else class="captured-preview">
      <img :src="previewUrl" alt="情报存档" class="preview-img" />
      <p class="captured-text">已存入任务档案</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { savePhoto } from '../utils/photo-store.js'
import { useGameStore } from '../stores/game.js'

const props = defineProps({
  stageId: { type: Number, required: true },
  prompt: { type: String, required: true },
})

const emit = defineEmits(['done'])

const game = useGameStore()
const captured = ref(false)
const previewUrl = ref('')

async function onCapture(e) {
  const file = e.target.files[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  captured.value = true

  const blob = await file.arrayBuffer().then(buf => new Blob([buf], { type: file.type }))
  await savePhoto(props.stageId, blob)
  game.recordPhoto(props.stageId)

  setTimeout(() => emit('done'), 1500)
}
</script>

<style scoped>
.prompt-text {
  font-size: 14px;
  color: var(--accent);
  margin-bottom: 4px;
}

.prompt-detail {
  font-size: 16px;
  margin-bottom: 16px;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.capture-btn {
  display: inline-block;
  cursor: pointer;
}

.preview-img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.captured-text {
  text-align: center;
  color: var(--success);
  font-size: 14px;
}
</style>
```

- [ ] **Step 5: Commit**

```bash
git add app/src/components/
git commit -m "feat: add core UI components - narrative, answer, hints, photo"
```

---

### Task 10: 实现页面——首页与关卡页

**Files:**
- Create: `app/src/pages/Home.vue`
- Create: `app/src/pages/Stage.vue`
- Create: `app/src/pages/Transit.vue`

- [ ] **Step 1: 首页**

创建 `app/src/pages/Home.vue`:

```vue
<template>
  <div class="home">
    <div class="title-block">
      <h1 class="title">第七封密电</h1>
      <p class="subtitle">一段跨越80年的秘密，藏在上海的街头巷尾</p>
    </div>

    <div v-if="!game.isStarted" class="intro">
      <NarrativeText :text="introStory" @complete="showStart = true" />
      <button
        v-if="showStart"
        class="btn-primary start-btn"
        @click="start"
      >
        接受任务
      </button>
    </div>

    <div v-else class="continue">
      <p class="progress-text">
        任务进行中 —— 第 {{ game.currentStage }} / 7 站
      </p>
      <p class="progress-sub">已收集 {{ game.collectedCount }} 段密电</p>
      <button class="btn-primary" @click="resume">继续任务</button>
      <button class="reset-btn" @click="confirmReset">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { INTRO_STORY } from '../data/narrative.js'
import NarrativeText from '../components/NarrativeText.vue'

const game = useGameStore()
const router = useRouter()
const showStart = ref(false)
const introStory = INTRO_STORY

function start() {
  game.startGame()
  router.push('/stage/1')
}

function resume() {
  if (game.currentStage >= 8) {
    router.push('/finale')
  } else {
    router.push(`/stage/${game.currentStage}`)
  }
}

function confirmReset() {
  if (confirm('确定要重新开始吗？所有进度和照片将会丢失。')) {
    game.resetGame()
  }
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 80vh;
}

.title-block {
  text-align: center;
  padding: 48px 0 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

.start-btn {
  margin-top: 24px;
  width: 100%;
}

.progress-text {
  font-size: 18px;
  margin-bottom: 4px;
}

.progress-sub {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.continue {
  text-align: center;
}

.reset-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  margin-top: 16px;
  cursor: pointer;
  text-decoration: underline;
}
</style>
```

- [ ] **Step 2: 关卡页（通用模板）**

创建 `app/src/pages/Stage.vue`:

```vue
<template>
  <div v-if="stage" class="stage-page">
    <header class="stage-header">
      <span class="stage-number">第 {{ stage.id }} 站</span>
      <h2 class="stage-title">{{ stage.title }}</h2>
      <p class="stage-location">📍 {{ stage.location }}（{{ stage.address }}）</p>
    </header>

    <!-- 当前子步骤 -->
    <div v-if="currentStepData" class="step-block">
      <h3 class="step-title">
        Step {{ currentStepData.id }} / {{ stage.steps.length }}：{{ currentStepData.title }}
      </h3>

      <NarrativeText
        v-if="currentStepData.instruction"
        :text="currentStepData.instruction"
        :speed="200"
      />

      <AnswerInput
        :answer="currentStepData.answer"
        :type="currentStepData.answerType"
        @correct="onStepCorrect"
      />

      <HintSystem
        :hints="currentStepData.hints || []"
        :stage-id="stage.id"
        :step-id="currentStepData.id"
      />

      <NarrativeText
        v-if="showAfterNarrative && currentStepData.narrativeAfter"
        :text="currentStepData.narrativeAfter"
        :is-handwriting="true"
      />
    </div>

    <!-- 所有步骤完成 → 拍照 → 显示密电片段 → 过渡 -->
    <div v-else-if="stageCleared" class="stage-complete">
      <div class="fragment-reveal cipher-card">
        <p class="fragment-label">密电碎片获取</p>
        <p class="fragment-text">「{{ stage.cipherFragment }}」</p>
      </div>

      <PhotoCapture
        v-if="!photoTaken"
        :stage-id="stage.id"
        :prompt="stage.photoPrompt"
        @done="onPhotoTaken"
      />

      <div v-if="photoTaken && stage.transition" class="transition-prompt">
        <p class="next-clue">{{ stage.transition.clue }}</p>
        <button class="btn-primary" @click="goToTransit">
          前往下一站
        </button>
      </div>

      <div v-if="photoTaken && !stage.transition" class="finale-prompt">
        <button class="btn-primary" @click="goToFinale">
          打开最后一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { STAGES } from '../data/puzzles.js'
import NarrativeText from '../components/NarrativeText.vue'
import AnswerInput from '../components/AnswerInput.vue'
import HintSystem from '../components/HintSystem.vue'
import PhotoCapture from '../components/PhotoCapture.vue'

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()
const game = useGameStore()

const stage = computed(() => STAGES[parseInt(props.id)])
const stepIndex = computed(() => game.currentStep - 1)
const currentStepData = computed(() => {
  if (!stage.value) return null
  return stage.value.steps[stepIndex.value] ?? null
})
const stageCleared = computed(() => !currentStepData.value && game.currentStep > stage.value.steps.length)
const photoTaken = ref(game.photosTaken.includes(parseInt(props.id)))
const showAfterNarrative = ref(false)

function onStepCorrect() {
  if (currentStepData.value?.narrativeAfter) {
    showAfterNarrative.value = true
    setTimeout(() => {
      showAfterNarrative.value = false
      advanceOrComplete()
    }, 3000)
  } else {
    advanceOrComplete()
  }
}

function advanceOrComplete() {
  if (game.currentStep < stage.value.steps.length) {
    game.advanceStep()
  } else {
    game.completeStage(stage.value.id, stage.value.cipherFragment)
    game.advanceStep() // move past last step to trigger stageCleared
  }
}

function onPhotoTaken() {
  photoTaken.value = true
}

function goToTransit() {
  const nextId = stage.value.id + 1
  router.push(`/transit/${stage.value.id}/${nextId}`)
}

function goToFinale() {
  game.enterFinale()
  router.push('/finale')
}
</script>

<style scoped>
.stage-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.stage-number {
  font-size: 12px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.stage-title {
  font-size: 22px;
  margin: 4px 0;
}

.stage-location {
  font-size: 13px;
  color: var(--text-secondary);
}

.step-block {
  margin-bottom: 32px;
}

.step-title {
  font-size: 16px;
  color: var(--accent);
  margin-bottom: 16px;
}

.fragment-reveal {
  text-align: center;
  margin-bottom: 24px;
}

.fragment-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.fragment-text {
  font-size: 24px;
  font-family: var(--font-handwriting);
}

.next-clue {
  font-family: var(--font-handwriting);
  font-size: 18px;
  text-align: center;
  margin-bottom: 20px;
  color: var(--accent);
}

.transition-prompt, .finale-prompt {
  text-align: center;
}
</style>
```

- [ ] **Step 3: 过渡页**

创建 `app/src/pages/Transit.vue`:

```vue
<template>
  <div class="transit-page">
    <div class="transit-header">
      <span class="from-label">{{ fromStage?.location }}</span>
      <span class="arrow">→</span>
      <span class="to-label">{{ toStage?.location ?? '???' }}</span>
    </div>

    <div class="transit-info">
      <p v-if="transition?.metro" class="metro-info">
        🚇 {{ transition.metro.line }}：{{ transition.metro.from }} → {{ transition.metro.to }}（{{ transition.metro.stops }}站）
      </p>
      <p v-else class="walk-info">
        🚶 步行约 {{ transition?.walkMinutes }} 分钟
      </p>
      <p class="direction">{{ transition?.direction }}</p>
    </div>

    <div class="diary-preview">
      <p class="diary-label">在路上回顾一下鹤影的日记……</p>
      <blockquote class="diary-quote">
        "{{ toStage?.diaryQuote }}"
      </blockquote>
    </div>

    <button class="btn-primary" @click="arrive">
      我到了
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/game.js'
import { STAGES } from '../data/puzzles.js'

const props = defineProps({
  from: { type: String, required: true },
  to: { type: String, required: true },
})

const router = useRouter()
const game = useGameStore()

const fromStage = computed(() => STAGES[parseInt(props.from)])
const toStage = computed(() => STAGES[parseInt(props.to)])
const transition = computed(() => fromStage.value?.transition)

function arrive() {
  game.goToNextStage()
  router.push(`/stage/${props.to}`)
}
</script>

<style scoped>
.transit-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 32px;
}

.transit-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 18px;
}

.arrow { color: var(--accent); }

.metro-info, .walk-info {
  font-size: 16px;
  text-align: center;
}

.direction {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

.diary-quote {
  font-family: var(--font-handwriting);
  font-size: 16px;
  border-left: 3px solid var(--accent);
  padding-left: 16px;
  color: var(--text-secondary);
}

.diary-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add app/src/pages/Home.vue app/src/pages/Stage.vue app/src/pages/Transit.vue
git commit -m "feat: add home, stage, and transit pages"
```

---

### Task 11: 实现终章页面（三层 Meta 揭晓）

这是整个游戏的高潮——必须精心控制节奏和呈现。

**Files:**
- Create: `app/src/pages/Finale.vue`

- [ ] **Step 1: 创建终章页面**

创建 `app/src/pages/Finale.vue`:

```vue
<template>
  <div class="finale-page">
    <!-- 第一层 Meta：日记藏字 -->
    <section v-if="phase >= 1" class="meta-layer">
      <NarrativeText
        :text="acrosticPrompt"
        @complete="showAcrostic = true"
      />
      <div v-if="showAcrostic" class="acrostic-reveal">
        <div class="acrostic-grid">
          <div
            v-for="(char, i) in acrosticChars"
            :key="i"
            class="acrostic-char typewriter-line"
            :style="{ animationDelay: `${i * 0.4}s` }"
          >
            <span class="char-stage">第{{ i + 1 }}篇</span>
            <span class="char-value">{{ char }}</span>
          </div>
        </div>
        <p
          class="acrostic-result typewriter-line"
          :style="{ animationDelay: `${acrosticChars.length * 0.4 + 0.5}s` }"
        >
          「{{ acrosticResult }}」
        </p>
        <button
          v-if="phase === 1"
          class="btn-primary advance-btn typewriter-line"
          :style="{ animationDelay: `${acrosticChars.length * 0.4 + 2}s` }"
          @click="phase = 2"
        >
          继续
        </button>
      </div>
    </section>

    <!-- 第二层 Meta：信封 -->
    <section v-if="phase >= 2" class="meta-layer envelope-layer">
      <NarrativeText
        :text="envelopePrompt"
        :is-handwriting="false"
        @complete="showEnvelope = true"
      />
      <div v-if="showEnvelope" class="envelope-content">
        <div class="envelope-letter cipher-card">
          <NarrativeText
            :text="envelopeLetter"
            :is-handwriting="true"
            :speed="800"
            @complete="showAdvanceToChecklist = true"
          />
        </div>
        <button
          v-if="showAdvanceToChecklist && phase === 2"
          class="btn-primary advance-btn"
          @click="phase = 3"
        >
          信封里还有一张纸……
        </button>
      </div>
    </section>

    <!-- 第三层 Meta：鹤影清单 + 照片 -->
    <section v-if="phase >= 3" class="meta-layer checklist-layer">
      <div class="checklist cipher-card">
        <p class="checklist-title">如果有一天有人替我走这条路——帮我留住这些。</p>
        <ul class="checklist-items">
          <li
            v-for="(item, i) in checklistItems"
            :key="i"
            class="checklist-item typewriter-line"
            :style="{ animationDelay: `${i * 0.6}s` }"
          >
            <s>{{ item }}</s>
          </li>
        </ul>
      </div>

      <!-- 照片 timeline -->
      <div
        v-if="showPhotos"
        class="photo-timeline"
      >
        <div
          v-for="(pair, i) in photoPairs"
          :key="i"
          class="photo-entry typewriter-line"
          :style="{ animationDelay: `${i * 1}s` }"
        >
          <img
            v-if="pair.photoUrl"
            :src="pair.photoUrl"
            :alt="pair.prompt"
            class="archive-photo"
          />
          <div v-else class="photo-placeholder">📷</div>
          <p class="photo-diary">{{ pair.diary }}</p>
        </div>
      </div>

      <!-- 最后一屏 -->
      <div
        v-if="showRename"
        class="archive-rename typewriter-line"
        :style="{ animationDelay: '1s' }"
      >
        <p class="rename-text">
          「任务档案」已自动更名为「<strong>鹤影档案</strong>」。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/game.js'
import { FINALE } from '../data/narrative.js'
import { PHOTO_DIARY_PAIRS } from '../data/puzzles.js'
import { getPhoto } from '../utils/photo-store.js'
import NarrativeText from '../components/NarrativeText.vue'

const game = useGameStore()

const phase = ref(1) // 1=藏字, 2=信封, 3=清单+照片

// 第一层
const acrosticPrompt = FINALE.acrostic.prompt
const acrosticChars = FINALE.acrostic.characters
const acrosticResult = FINALE.acrostic.reveal
const showAcrostic = ref(false)

// 第二层
const envelopePrompt = FINALE.envelope.prompt
const envelopeLetter = `如果你正在读这封信，说明有人走完了我最后走过的路。

我必须对你坦白——没有什么军事密电。从来没有。

我知道自己活不过这个冬天。我只是想把这条路留下来。我想让一个人——哪怕是一个素不相识的人，在很多年以后——走一遍我最后看过的上海。从饭店的绿塔，到钟楼的谎言，到狮子的沉默，到九曲桥的弯道，到石库门的脸，到梧桐树的阴影，到那艘永远不会开走的船。

这些地方不会记住我，但如果你今天认真看了它们，那你的记忆里就有了我看过的东西。

这样的话，我就没有真的消失。

——鹤影
1943年秋，上海`
const showEnvelope = ref(false)
const showAdvanceToChecklist = ref(false)

// 第三层
const checklistItems = [
  '绿塔在光线里的样子',
  '钟的脸',
  '那头不说话的狮子',
  '桥上回头看到的水面',
  '石头门楣上那张脸',
  '梧桐的影子',
  '那艘船的船头',
]

const photoPairs = ref([])
const showPhotos = ref(false)
const showRename = ref(false)

onMounted(async () => {
  // 预加载照片
  const pairs = []
  for (const pair of PHOTO_DIARY_PAIRS) {
    const blob = await getPhoto(pair.stage)
    pairs.push({
      ...pair,
      photoUrl: blob ? URL.createObjectURL(blob) : null,
    })
  }
  photoPairs.value = pairs
})

// 当 phase 变为 3 时，展示照片 timeline
import { watch } from 'vue'
watch(phase, (val) => {
  if (val === 3) {
    // 清单动画结束后展示照片
    setTimeout(() => { showPhotos.value = true }, checklistItems.length * 600 + 1000)
    // 照片全部展示后显示更名
    setTimeout(() => {
      showRename.value = true
      game.completeGame()
    }, checklistItems.length * 600 + 1000 + PHOTO_DIARY_PAIRS.length * 1000 + 1500)
  }
})
</script>

<style scoped>
.finale-page {
  padding-bottom: 100px;
}

.meta-layer {
  margin-bottom: 48px;
}

.acrostic-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 24px 0;
}

.acrostic-char {
  display: flex;
  align-items: center;
  gap: 16px;
}

.char-stage {
  font-size: 12px;
  color: var(--text-secondary);
  width: 48px;
}

.char-value {
  font-size: 32px;
  font-family: var(--font-handwriting);
  color: var(--accent);
}

.acrostic-result {
  font-size: 24px;
  font-family: var(--font-handwriting);
  text-align: center;
  color: var(--accent);
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--border);
}

.advance-btn {
  width: 100%;
  margin-top: 16px;
}

.envelope-letter {
  margin-top: 24px;
  padding: 24px;
}

.checklist-title {
  font-family: var(--font-handwriting);
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.checklist-items {
  list-style: none;
  padding: 0;
}

.checklist-item {
  font-family: var(--font-handwriting);
  font-size: 18px;
  padding: 8px 0;
  color: var(--text-secondary);
}

.photo-timeline {
  margin-top: 32px;
}

.photo-entry {
  margin-bottom: 32px;
}

.archive-photo {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.photo-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 8px;
}

.photo-diary {
  font-family: var(--font-handwriting);
  font-size: 14px;
  color: var(--text-secondary);
  font-style: italic;
}

.archive-rename {
  text-align: center;
  padding: 32px 0;
  margin-top: 32px;
  border-top: 1px solid var(--border);
}

.rename-text {
  font-size: 16px;
  color: var(--text-secondary);
}

.rename-text strong {
  color: var(--accent);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/pages/Finale.vue
git commit -m "feat: add finale page with 3-layer meta reveal"
```

---

### Task 12: 实现通关档案页

**Files:**
- Create: `app/src/pages/Archive.vue`

- [ ] **Step 1: 创建档案页**

创建 `app/src/pages/Archive.vue`:

```vue
<template>
  <div class="archive-page">
    <h1 class="archive-title">鹤影档案</h1>
    <p class="archive-subtitle">此生未能再见，但你走过的每一条路，我都提前走过一遍。</p>

    <div class="archive-entries">
      <div v-for="(pair, i) in photoPairs" :key="i" class="archive-entry">
        <div class="entry-header">
          <span class="entry-number">{{ i + 1 }} / 7</span>
          <span class="entry-location">{{ locations[i] }}</span>
        </div>
        <img
          v-if="pair.photoUrl"
          :src="pair.photoUrl"
          :alt="pair.prompt"
          class="entry-photo"
        />
        <p class="entry-wish">{{ pair.prompt }}</p>
        <p class="entry-diary">"{{ pair.diary }}"</p>
      </div>
    </div>

    <div class="archive-footer">
      <p>日记藏字：「你走过的每一步」</p>
      <p class="footer-date">{{ new Date().toLocaleDateString('zh-CN') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PHOTO_DIARY_PAIRS } from '../data/puzzles.js'
import { getPhoto } from '../utils/photo-store.js'

const locations = ['和平饭店', '海关大楼', '汇丰银行', '豫园九曲桥', '一大会址', '思南公馆', '武康大楼']

const photoPairs = ref([])

onMounted(async () => {
  const pairs = []
  for (const pair of PHOTO_DIARY_PAIRS) {
    const blob = await getPhoto(pair.stage)
    pairs.push({
      ...pair,
      photoUrl: blob ? URL.createObjectURL(blob) : null,
    })
  }
  photoPairs.value = pairs
})
</script>

<style scoped>
.archive-page {
  padding-bottom: 64px;
}

.archive-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 4px;
}

.archive-subtitle {
  font-family: var(--font-handwriting);
  font-size: 14px;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.archive-entry {
  margin-bottom: 40px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.entry-photo {
  width: 100%;
  max-height: 250px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

.entry-wish {
  font-size: 16px;
  font-family: var(--font-handwriting);
  color: var(--accent);
  margin-bottom: 4px;
}

.entry-diary {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
}

.archive-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
}

.footer-date {
  margin-top: 4px;
  font-size: 12px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add app/src/pages/Archive.vue
git commit -m "feat: add post-game archive page"
```

---

### Task 13: 端到端验证——本地可运行

- [ ] **Step 1: 启动 dev server 并验证所有页面**

```bash
cd D:/work/shanghaitrip/app && npm run dev
```

在浏览器中验证：
- `http://localhost:3000/#/` → 首页，显示开篇叙事，点击"接受任务"后跳转第1关
- `http://localhost:3000/#/stage/1` → 第1关页面，显示步骤和答案输入
- `http://localhost:3000/#/transit/1/2` → 过渡页，显示路线和日记引用
- `http://localhost:3000/#/finale` → 终章页面，三层Meta依次展示
- `http://localhost:3000/#/archive` → 档案页

预期：所有页面可渲染，无 JS 报错。答案验证因为是 `__FIELD__` 所以暂时无法通过——这是预期行为。

- [ ] **Step 2: 修复任何问题并 Commit**

```bash
git add -A
git commit -m "fix: resolve any issues from e2e verification"
```

---

## Phase 4: 道具模板

### Task 14: 创建道具 HTML 模板共享样式

**Files:**
- Create: `props/templates/shared-styles.css`

- [ ] **Step 1: 创建共享样式**

创建 `props/templates/shared-styles.css`:

```css
/* 所有道具共用的旧档案视觉风格 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=ZCOOL+XiaoWei&display=swap');

@page {
  size: A4;
  margin: 15mm;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Noto Serif SC', serif;
  color: #2c1810;
  background: #f5f0e8;
}

.page {
  width: 210mm;
  min-height: 297mm;
  padding: 15mm;
  background:
    radial-gradient(ellipse at 15% 15%, rgba(139, 69, 19, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 85%, rgba(101, 67, 33, 0.04) 0%, transparent 50%),
    #f5f0e8;
  page-break-after: always;
  position: relative;
}

.page::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
}

.handwriting {
  font-family: 'ZCOOL XiaoWei', cursive;
}

.title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 4px;
}

.subtitle {
  font-size: 14px;
  text-align: center;
  color: #5c4a3a;
  margin-bottom: 30px;
}

.border-frame {
  border: 2px solid #8b4513;
  padding: 20px;
}

.stamp {
  color: #8b2500;
  border: 2px solid #8b2500;
  padding: 4px 12px;
  font-size: 14px;
  letter-spacing: 2px;
  transform: rotate(-5deg);
  display: inline-block;
}

/* 打印时隐藏非打印元素 */
@media print {
  body { background: white; }
  .no-print { display: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add props/templates/shared-styles.css
git commit -m "feat: add shared vintage styles for printable props"
```

---

### Task 15: 创建密码转盘模板

**Files:**
- Create: `props/templates/cipher-wheel.html`

- [ ] **Step 1: 创建密码转盘 HTML（两个可旋转的同心圆盘）**

创建 `props/templates/cipher-wheel.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>密码转盘 - 第七封密电</title>
  <link rel="stylesheet" href="shared-styles.css">
  <style>
    .wheel-container {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 20px;
    }
    .wheel {
      width: 180mm;
      height: 180mm;
      border-radius: 50%;
      border: 2px solid #2c1810;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wheel-outer {
      width: 170mm;
      height: 170mm;
    }
    .wheel-inner {
      width: 120mm;
      height: 120mm;
    }
    .wheel-label {
      text-align: center;
      font-size: 14px;
      margin-top: 8px;
      color: #5c4a3a;
    }
    .letter {
      position: absolute;
      font-size: 16px;
      font-weight: bold;
    }
    .center-dot {
      width: 8mm;
      height: 8mm;
      border-radius: 50%;
      background: #2c1810;
      position: absolute;
    }
    .center-hole {
      width: 4mm;
      height: 4mm;
      border-radius: 50%;
      border: 1px solid #2c1810;
      background: white;
      position: absolute;
    }
    .instructions {
      margin-top: 30px;
      font-size: 13px;
      line-height: 1.8;
      border-top: 1px solid #c4b59a;
      padding-top: 15px;
    }
    .cut-line {
      border: 1px dashed #8b4513;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="page">
    <h1 class="title">密码转盘</h1>
    <p class="subtitle">沿虚线剪下两个圆盘 · 中心用牙签固定 · 旋转外盘对齐数字</p>

    <div class="wheel-container">
      <!-- 外盘 -->
      <div>
        <svg viewBox="0 0 400 400" width="170mm" height="170mm" class="cut-line">
          <circle cx="200" cy="200" r="195" fill="none" stroke="#8b4513" stroke-width="1" stroke-dasharray="8,4"/>
          <circle cx="200" cy="200" r="180" fill="none" stroke="#2c1810" stroke-width="1"/>
          <!-- 26个字母均匀分布在外圈 -->
          <g font-size="18" font-family="'Noto Serif SC', serif" fill="#2c1810" text-anchor="middle">
            <text x="200" y="30">A</text>
            <text x="248" y="33">B</text>
            <text x="292" y="47">C</text>
            <text x="328" y="72">D</text>
            <text x="353" y="108">E</text>
            <text x="367" y="152">F</text>
            <text x="370" y="200">G</text>
            <text x="367" y="248">H</text>
            <text x="353" y="292">I</text>
            <text x="328" y="328">J</text>
            <text x="292" y="353">K</text>
            <text x="248" y="367">L</text>
            <text x="200" y="375">M</text>
            <text x="152" y="367">N</text>
            <text x="108" y="353">O</text>
            <text x="72" y="328">P</text>
            <text x="47" y="292">Q</text>
            <text x="33" y="248">R</text>
            <text x="30" y="200">S</text>
            <text x="33" y="152">T</text>
            <text x="47" y="108">U</text>
            <text x="72" y="72">V</text>
            <text x="108" y="47">W</text>
            <text x="152" y="33">X</text>
          </g>
          <!-- 26个数字在内圈 -->
          <g font-size="14" font-family="'Noto Serif SC', serif" fill="#5c4a3a" text-anchor="middle">
            <text x="200" y="55">1</text>
            <text x="240" y="58">2</text>
            <text x="275" y="70">3</text>
            <text x="304" y="92">4</text>
            <text x="324" y="120">5</text>
            <text x="335" y="155">6</text>
            <text x="338" y="200">7</text>
            <text x="335" y="240">8</text>
            <text x="324" y="275">9</text>
            <text x="304" y="304">10</text>
            <text x="275" y="324">11</text>
            <text x="240" y="335">12</text>
            <text x="200" y="342">13</text>
            <text x="160" y="335">14</text>
            <text x="125" y="324">15</text>
            <text x="96" y="304">16</text>
            <text x="76" y="275">17</text>
            <text x="65" y="240">18</text>
            <text x="62" y="200">19</text>
            <text x="65" y="155">20</text>
            <text x="76" y="120">21</text>
            <text x="96" y="92">22</text>
            <text x="125" y="70">23</text>
            <text x="160" y="58">24</text>
          </g>
          <!-- 中心孔 -->
          <circle cx="200" cy="200" r="4" fill="none" stroke="#2c1810" stroke-width="1"/>
        </svg>
        <p class="wheel-label">外盘（固定）</p>
      </div>

      <!-- 内盘 -->
      <div>
        <svg viewBox="0 0 300 300" width="120mm" height="120mm" class="cut-line">
          <circle cx="150" cy="150" r="145" fill="none" stroke="#8b4513" stroke-width="1" stroke-dasharray="8,4"/>
          <circle cx="150" cy="150" r="130" fill="none" stroke="#2c1810" stroke-width="1"/>
          <g font-size="18" font-family="'Noto Serif SC', serif" fill="#8b4513" text-anchor="middle" font-weight="bold">
            <text x="150" y="30">A</text>
            <text x="186" y="33">B</text>
            <text x="219" y="44">C</text>
            <text x="246" y="63">D</text>
            <text x="265" y="89">E</text>
            <text x="276" y="121">F</text>
            <text x="278" y="150">G</text>
            <text x="276" y="186">H</text>
            <text x="265" y="219">I</text>
            <text x="246" y="246">J</text>
            <text x="219" y="265">K</text>
            <text x="186" y="276">L</text>
            <text x="150" y="280">M</text>
            <text x="114" y="276">N</text>
            <text x="81" y="265">O</text>
            <text x="54" y="246">P</text>
            <text x="35" y="219">Q</text>
            <text x="24" y="186">R</text>
            <text x="22" y="150">S</text>
            <text x="24" y="121">T</text>
            <text x="35" y="89">U</text>
            <text x="54" y="63">V</text>
            <text x="81" y="44">W</text>
            <text x="114" y="33">X</text>
          </g>
          <circle cx="150" cy="150" r="4" fill="none" stroke="#2c1810" stroke-width="1"/>
          <!-- 指示箭头 -->
          <polygon points="150,8 145,18 155,18" fill="#8b4513"/>
        </svg>
        <p class="wheel-label">内盘（旋转）· 箭头对准偏移数字</p>
      </div>
    </div>

    <div class="instructions">
      <p><strong>使用方法：</strong></p>
      <ol style="padding-left: 20px;">
        <li>沿虚线剪下两个圆盘</li>
        <li>将小圆盘叠在大圆盘中央，用牙签穿过中心孔固定</li>
        <li>将内盘箭头对准外盘上的偏移数字</li>
        <li>密文中的每个字母，在外盘找到后，对应读取内盘上的字母即为明文</li>
      </ol>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add props/templates/cipher-wheel.html
git commit -m "feat: add cipher wheel printable template"
```

---

### Task 16: 创建日记残页和信封内容模板

**Files:**
- Create: `props/templates/diary-pages.html`
- Create: `props/templates/envelope-contents.html`

- [ ] **Step 1: 创建日记残页模板（7页）**

创建 `props/templates/diary-pages.html` — 包含7篇日记的完整排版，每篇一个 `<div class="page">`。引用 `content/diary-*.md` 的文本内容，手写体排版，带暗格编号。

（这个文件内容较长，将日记正文嵌入HTML。每页包含：标题、日记正文、底部暗格区域。使用 `shared-styles.css` 的旧纸质感。）

- [ ] **Step 2: 创建信封内容模板**

创建 `props/templates/envelope-contents.html` — 两张纸：遗书（大纸）和清单（小纸条），都用手写体排版，带泛黄质感。

- [ ] **Step 3: Commit**

```bash
git add props/templates/diary-pages.html props/templates/envelope-contents.html
git commit -m "feat: add diary and envelope printable templates"
```

---

### Task 17: 创建其他道具模板骨架

这些道具的具体内容依赖踩点数据（`__FIELD__`），但 HTML 结构可以先搭好。

**Files:**
- Create: `props/templates/old-map.html` — 网格老地图（踩点后填入坐标格内容）
- Create: `props/templates/intel-paper.html` — 情报纸（踩点后确定镜像半图）
- Create: `props/templates/maze-grid.html` — 方格迷宫（踩点后确定L/R序列和格中文字）
- Create: `props/templates/photo-cards.html` — 建筑细节照片卡（踩点后放入照片）
- Create: `props/templates/cardan-grille.html` — 窗格卡（踩点后确定孔位）
- Create: `props/templates/paper-ruler.html` — 纸尺（踩点后确定刻度对应）
- Create: `props/templates/cipher-cards.html` — 密电卡片正反面（踩点后确定背面线图）

- [ ] **Step 1: 为每个道具创建 HTML 骨架**

每个文件包含：基础布局、`shared-styles.css` 引用、`__FIELD__` 占位标记，以及注释说明踩点后需要填入什么数据。

- [ ] **Step 2: Commit**

```bash
git add props/templates/
git commit -m "feat: add skeleton templates for all printable props (field data pending)"
```

---

### Task 18: 创建 PDF 生成脚本

**Files:**
- Create: `props/package.json`
- Create: `props/generate-pdfs.js`

- [ ] **Step 1: 创建 props package.json**

创建 `props/package.json`:

```json
{
  "name": "seventh-cipher-props",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "generate": "node generate-pdfs.js"
  },
  "dependencies": {
    "puppeteer": "^24.0.0"
  }
}
```

- [ ] **Step 2: 创建 PDF 生成脚本**

创建 `props/generate-pdfs.js`:

```js
import puppeteer from 'puppeteer'
import { readdir } from 'fs/promises'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const TEMPLATES_DIR = join(__dirname, 'templates')
const OUTPUT_DIR = join(__dirname, 'output')

async function generatePDF(browser, htmlPath, outputPath) {
  const page = await browser.newPage()
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })
  await page.close()
  console.log(`  ✓ ${basename(outputPath)}`)
}

async function main() {
  console.log('Generating PDFs...\n')

  const browser = await puppeteer.launch()
  const files = await readdir(TEMPLATES_DIR)
  const htmlFiles = files.filter(f => f.endsWith('.html'))

  for (const file of htmlFiles) {
    const htmlPath = join(TEMPLATES_DIR, file)
    const pdfName = file.replace('.html', '.pdf')
    const outputPath = join(OUTPUT_DIR, pdfName)
    await generatePDF(browser, htmlPath, outputPath)
  }

  await browser.close()
  console.log(`\nDone! ${htmlFiles.length} PDFs generated in props/output/`)
}

main().catch(console.error)
```

- [ ] **Step 3: Commit**

```bash
git add props/package.json props/generate-pdfs.js
git commit -m "feat: add Puppeteer PDF generation script"
```

---

## Phase 5: 踩点后数据集成

### Task 19: 填入踩点数据并生成最终谜题参数

> ⚠️ 此任务需要完成实地踩点后才能执行

**Files:**
- Modify: `fieldwork/data.json` — 填入所有实地采集数据
- Modify: `app/src/data/puzzles.js` — 将所有 `__FIELD__` 替换为真实值
- Modify: `content/riddles-and-clues.md` — 更新加密参数
- Modify: 所有 `props/templates/*.html` — 填入真实数据

- [ ] **Step 1: 填入 `fieldwork/data.json`**
- [ ] **Step 2: 根据数据计算所有谜题的精确参数**
- [ ] **Step 3: 替换 `puzzles.js` 中所有 `__FIELD__`**
- [ ] **Step 4: 更新所有道具模板中的 `__FIELD__` 占位**
- [ ] **Step 5: 生成最终 PDF**

```bash
cd D:/work/shanghaitrip/props && npm install && npm run generate
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: integrate field data - all puzzles finalized"
```

---

## Phase 6: 端到端测试

### Task 20: 完整通关测试

- [ ] **Step 1: 邀请1-2位朋友进行全程实测**

测试清单：
- [ ] 道具包打印效果——文字清晰度、裁剪线可辨
- [ ] 密码转盘——旋转顺滑、对齐准确
- [ ] 每关答案验证——正确答案可通过、错误答案被拒
- [ ] 提示系统——三级提示内容有效、不直接剧透
- [ ] 拍照功能——在户外手机浏览器中可正常调用摄像头
- [ ] 终章流程——三层Meta依次展示、照片正确关联
- [ ] 时间节奏——每关用时合理、总时长在4-5小时
- [ ] 步行路线——无围挡/施工阻碍、导航准确

- [ ] **Step 2: 记录所有问题**
- [ ] **Step 3: 修复问题并重新测试**
- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "fix: post-playtest adjustments"
```

---

## Phase 7: 部署

### Task 21: 部署 H5 应用

- [ ] **Step 1: Build**

```bash
cd D:/work/shanghaitrip/app && npm run build
```

- [ ] **Step 2: 部署到免费静态托管**

可选方案（均免费）：
- Vercel: `npx vercel --prod`
- Netlify: 拖拽 `dist/` 文件夹
- GitHub Pages: push `dist/` 到 `gh-pages` 分支

- [ ] **Step 3: 在微信中测试 H5 链接打开效果**

确认：
- 页面在微信内置浏览器中正常渲染
- 摄像头调用弹出授权提示且可正常拍照
- localStorage 和 IndexedDB 在微信浏览器中正常工作

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: production build and deployment config"
```
