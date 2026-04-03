# 三城内容创建 + 跨城彩蛋UI + 上海物料同步 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为南京/杭州/西安创建完整的内容文件（日记×7、信封、密电碎片、谜语线索、道具模板、踩点清单），同步更新上海优化后未更新的物料，实现跨城彩蛋前端UI。

**Architecture:** 每个城市的内容文件参照上海已有结构（`content/` markdown + `props/templates/` HTML）。三城内容放在各自子目录下。跨城彩蛋在 Archive.vue 底部增加"暗线一瞥"区域 + 新建 CrossCityReveal.vue 全通关揭示页。道具模板复用上海的 CSS 框架 `shared-styles.css`，各城市换色。

**Tech Stack:** Markdown (content), HTML/CSS (prop templates), Vue 3 + Pinia (Easter egg UI)

## 2026-04-03 当前状态

- 南京、杭州、西安三城的 app 数据、content、props 与跨城线索已落地到仓库，不再是“新建三城内容”的状态。
- 跨城闭环当前实现为 `shanghai → nanjing → hangzhou → xian → suzhou → shanghai`，已不是本计划撰写时的四城结构。
- 当前剩余占位以现场参数和史实名单为主：
  - 南京：app 25，content 7，props 36
  - 杭州：app 36，content 0，props 5
  - 西安：app 21，content 0，props 7
- 因此，本计划后续更适合作为“文档对齐 + 实地核查 backlog”，而不是继续按“创建文件/模板/UI”的措辞执行。

**文件结构概览：**

```
content/
├── shanghai/        # 已有7篇diary + envelope，需检查同步
├── nanjing/         # 新建
│   ├── diary-1-zhonghuamen.md ~ diary-7-xuanwuhu.md
│   ├── envelope-letter.md
│   ├── envelope-namelist.md
│   ├── cipher-fragments.md
│   └── riddles-and-clues.md
├── hangzhou/         # 新建
│   ├── diary-1-duanqiao.md ~ diary-7-leifengta.md
│   ├── envelope-seventh-page.md
│   ├── envelope-annotations.md
│   ├── cipher-fragments.md
│   └── riddles-and-clues.md
└── xian/             # 新建
    ├── diary-1-xiaoyanta.md ~ diary-7-dayanta.md
    ├── envelope-letter.md
    ├── envelope-menu.md
    ├── envelope-invitation.md
    ├── cipher-fragments.md
    └── riddles-and-clues.md

props/
├── templates/        # 上海已有11个HTML，需更新diary-pages.html和envelope-contents.html
├── nanjing/templates/   # 新建
├── hangzhou/templates/  # 新建
└── xian/templates/      # 新建

fieldwork/
├── checklist.md         # 上海已有
├── nanjing-checklist.md # 新建
├── hangzhou-checklist.md # 新建
└── xian-checklist.md    # 新建

app/src/pages/
├── Archive.vue          # 修改：增加跨城暗线区域
└── CrossCityReveal.vue  # 新建：全通关揭示页

app/src/router.js        # 修改：增加跨城揭示路由
```

---

### Task 0: 上海物料同步修复

**问题：** 上海日记优化为7种文体后，`props/templates/diary-pages.html` 和 `props/templates/envelope-contents.html` 未同步更新。

**Files:**
- Modify: `props/templates/diary-pages.html` — 用 `content/diary-1~7.md` 的新内容替换7页日记正文
- Modify: `props/templates/envelope-contents.html` — 添加缺失的"拿破仑蛋糕"句

**日记内容源映射：**

| 页 | 文件源 | 文体 | 首字 | 需更新的要点 |
|----|--------|------|------|-------------|
| 1 | `content/diary-1-peace-hotel.md` | 任务简报 | 你 | 整段替换为"你的任务代号：绿塔..." |
| 2 | `content/diary-2-customs-house.md` | 观察笔记 | 走 | 整段替换为"走到外滩这一段..." |
| 3 | `content/diary-3-hsbc.md` | 吐槽体 | 过 | 整段替换为"过了这道门..." |
| 4 | `content/diary-4-yuyuan.md` | 意识流 | 的 | 整段替换为"的确有人说这桥..." |
| 5 | `content/diary-5-xintiandi.md` | 对话体 | 每 | 整段替换为"每条石库门弄堂..." |
| 6 | `content/diary-6-sinan.md` | 家书体 | 一 | 整段替换为"一面墙比另一面墙..." |
| 7 | `content/diary-7-wukang.md` | 遗书体 | 步 | 整段替换为"步子走到这里..." |

**信封内容修复：**
在 `envelope-contents.html` 的信件正文最后一段（"这样的话，我就没有真的消失。"）之后，添加：

```html
<p>如果你走完这条路饿了，去思南路吃一块拿破仑蛋糕。替我吃的。</p>
```

- [ ] Step 1: 读取全部7个 `content/diary-*.md` 文件，提取 frontmatter 后的正文
- [ ] Step 2: 逐页替换 `diary-pages.html` 中的 `<div class="diary-body">` 内容，保持HTML结构不变
- [ ] Step 3: 在 `envelope-contents.html` 的遗书正文中添加拿破仑蛋糕句
- [ ] Step 4: 检查每页的 `acrostic-hint` 首字是否与 frontmatter `acrostic_char` 一致
- [ ] Step 5: Commit

---

### Task 1: 南京 — 7篇验砖吏札记

**Files:**
- Create: `content/nanjing/diary-1-zhonghuamen.md`
- Create: `content/nanjing/diary-2-laomendong.md`
- Create: `content/nanjing/diary-3-keju.md`
- Create: `content/nanjing/diary-4-qinhuai.md`
- Create: `content/nanjing/diary-5-jimingsi.md`
- Create: `content/nanjing/diary-6-taicheng.md`
- Create: `content/nanjing/diary-7-xuanwuhu.md`

**格式模板（每篇统一frontmatter）：**

```markdown
---
station: N
location: 地点中文名（英文名）
acrostic_char: X
hidden_regret: "一句隐含遗憾的话"
---

X开头的正文...（藏头字为首字）

hidden_regret句嵌入正文中...

谜题线索嵌入...

过渡线索暗示下一站...
```

**7篇详细规格：**

| # | 文件名 | 地点 | 首字 | 刻痕格式 | hidden_regret主题 | 嵌入的谜题线索 | 跨城暗线 |
|---|--------|------|------|---------|-----------------|--------------|---------|
| 1 | diary-1-zhonghuamen.md | 中华门城堡 | 城 | 砖铭体 | 那块"不属于这座城的砖"——也许是他自己 | 城门结构数字、城砖索引指令、铭文三栏解读 | — |
| 2 | diary-2-laomendong.md | 老门东 | 巷 | 木匠落款体 | 门框暗处的名字终将被油漆盖住 | 灯谜谜面×3、建筑年代线索、木匠落款位置 | — |
| 3 | diary-3-keju.md | 科举博物馆 | 有 | 八股文体 | "娘，儿必中"四个字前站了很久 | 八股文格式提取规则、明远楼定位线索、状元表检索 | — |
| 4 | diary-4-qinhuai.md | 秦淮河 | 声 | 灯谜/诗词体 | 河上的曲子调子好听，但词里全是别人的故事 | 取景框指令、对联出句、倒影阅读提示 | **"听说杭州西湖边也在修堤，不知那边的泥巴里有没有人偷偷刻字。"** |
| 5 | diary-5-jimingsi.md | 鸡鸣寺 | 音 | 佛偈体 | 还愿墙上写满了别人的愿望，他的愿望不知该怎么写 | 佛塔数学线索、钟声/铭文编码提示、还愿墙定位 | — |
| 6 | diary-6-taicheng.md | 台城城墙 | 尚 | 修缮碑文体 | "无情最是台城柳"——不是无情，是太长命 | 里程铭石丈量指令、高低视角切换提示、修缮碑位置 | — |
| 7 | diary-7-xuanwuhu.md | 玄武湖畔 | 在 | 户籍档案体 | 全天下人的名字都在湖心岛上，但没有人来读 | 碎片拼合指令（排列规则）、回翻札记首字提示 | — |

**写作要求：**
- 每篇 200-400 字中文
- 首字必须是指定的藏头字
- hidden_regret 句必须自然嵌入正文，不可突兀
- 谜题线索嵌入方式参照上海：用叙事语言包裹线索数据，玩家需读懂日记才能提取解谜信息
- 每篇的刻痕格式要在文风上体现出来（砖铭体=公文风、木匠落款体=口语朴实、八股文体=正经古雅、灯谜体=婉约优美、佛偈体=简洁禅意、修缮碑文体=刚劲报告、户籍档案体=冷静陈述）
- 第4篇自然嵌入跨城暗线句

- [ ] Step 1: 创建 `content/nanjing/` 目录
- [ ] Step 2: 逐一创建7篇 diary 文件，每篇按上述规格写作
- [ ] Step 3: 校验7篇首字连读 = "城巷有声音尚在"
- [ ] Step 4: 校验每篇 hidden_regret 与 spec 一致
- [ ] Step 5: Commit

---

### Task 2: 南京 — 信封内容 + 密电碎片 + 谜语线索

**Files:**
- Create: `content/nanjing/envelope-letter.md` — 陆鸣远遗札全文
- Create: `content/nanjing/envelope-namelist.md` — 七人名单
- Create: `content/nanjing/cipher-fragments.md` — 碎片映射
- Create: `content/nanjing/riddles-and-clues.md` — 过渡谜语 + 各关内部线索

**遗札内容（来自spec终章部分）：**

```markdown
# 陆鸣远遗札

> 通关后拆开的信封内第一张纸。仿手写体，泛黄纸张质感。

---

如果你正在读这封信，说明有人走完了我刻过字的七个地方。

我必须对你坦白——这七处刻痕里没有密码，没有暗号，没有藏宝图。

将军刻功，是因为他打了胜仗。诗人刻诗，是因为他喝了酒。考生刻愿，是因为他怕落第。僧人刻经，是因为他信佛。妻子刻平安，是因为她等人回来。

我谁都不是。我只是一个验砖的吏员，识几个字，在这座城里读了一辈子别人刻下的东西。

临了，我想用他们的方式——将军的方式、诗人的方式、考生的方式、僧人的方式、妻子的方式——各说一句自己的话。不是给谁看的。就是想在这座城里留点什么。

留的是七个名字。七个和我一样普通的人。他们的名字真的刻在这座城的砖上、碑上、墙上、档案里。六百年了，没有人读到过他们。

你今天读到了。

——陆鸣远
南京城
```

**七人名单内容：**

```markdown
# 七人名单

> 信封内第二张纸。一张小纸条。

---

**这些是真的。这些人真的存在过。**

1. __FIELD__ ——中华门城砖铭文上的窑匠
2. __FIELD__ ——老门东某处门框上的木匠落款
3. __FIELD__ ——江南贡院碑刻上的一位考生
4. __FIELD__ ——秦淮灯会记载中的一位扎灯艺人
5. __FIELD__ ——鸡鸣寺还愿铭文中的一位香客
6. __FIELD__ ——台城城墙修缮记录中的一位民夫
7. __FIELD__ ——玄武湖黄册库户籍档案中的一位普通户主
```

**密电碎片映射（来自spec）：**

完整消息：将军刻功，诗人刻诗，考生刻愿，僧人刻经，妻子刻平安。我谁都不是，就刻了这座城里最不值钱的东西——七个认真活过的普通人的名字。你现在知道了。够了。

| 游戏阶段 | 卡片背面隐数 | 碎片内容 |
|---------|------------|---------|
| 第一阶段 | 1 | 将军刻功， |
| 第二阶段 | 2 | 诗人刻诗， |
| 第三阶段 | 3 | 考生刻愿， |
| 第四阶段 | 4 | 僧人刻经， |
| 第五阶段 | 5 | 妻子刻平安。 |
| 第六阶段 | 6 | 我谁都不是，就刻了这座城里最不值钱的东西—— |
| 第七阶段 | 7 | 七个认真活过的普通人的名字。你现在知道了。够了。 |

**谜语线索（阶段间过渡）：**

| 过渡 | 线索 |
|------|------|
| 1→2 | "巷深处，门楣上，木匠在百年前落了款。" |
| 2→3 | "天下英才尽入此门，但这扇门只有一米三宽。" |
| 3→4 | "秦淮水面上，倒着写的字才是正的。" |
| 4→5 | "四百八十寺，只有一座在鸡鸣。" |
| 5→6 | "登城头，向东走，柳树还在等那个写诗的人。" |
| 6→7 | "下城向北，湖边有一面墙记着全天下人的名字。" |

- [ ] Step 1: 创建 `content/nanjing/envelope-letter.md`
- [ ] Step 2: 创建 `content/nanjing/envelope-namelist.md`
- [ ] Step 3: 创建 `content/nanjing/cipher-fragments.md`
- [ ] Step 4: 创建 `content/nanjing/riddles-and-clues.md`
- [ ] Step 5: Commit

---

### Task 3: 杭州 — 7页白素贞手稿残页

**Files:**
- Create: `content/hangzhou/diary-1-duanqiao.md`
- Create: `content/hangzhou/diary-2-gushan.md`
- Create: `content/hangzhou/diary-3-longjing.md`
- Create: `content/hangzhou/diary-4-yuewangmiao.md`
- Create: `content/hangzhou/diary-5-sudi.md`
- Create: `content/hangzhou/diary-6-jingcisi.md`
- Create: `content/hangzhou/diary-7-leifengta.md`

**7篇详细规格：**

| # | 文件名 | 地点 | 首字 | 文体 | 白素贞状态 | hidden_regret主题 | 跨城暗线 |
|---|--------|------|------|------|-----------|-----------------|---------|
| 1 | diary-1-duanqiao.md | 断桥 | 湖 | 游记体 | 第一次像人一样逛西湖 | 笑了但不知道为什么该笑 | — |
| 2 | diary-2-gushan.md | 孤山/西泠印社 | 心 | 诗注体 | 读林逋诗，自己也写诗，写得很烂 | 认真和疯了是同一件事 | — |
| 3 | diary-3-longjing.md | 龙井村 | 有 | 茶谱体 | 偷偷学人喝茶，苦但他们很开心 | 等待本身就是享受——她不懂 | **"长安有个胡商，听说也在这世间留了很久。但他是自愿的。"** |
| 4 | diary-4-yuewangmiao.md | 岳王庙 | 一 | 判词体 | 对忠奸困惑，第一次流泪 | 八百年的恨她无法理解但她哭了 | — |
| 5 | diary-5-sudi.md | 苏堤六桥 | 人 | 工匠手记体 | 发现苏东坡伟大在泥不在诗 | 想为一个人做一件没用的事 | — |
| 6 | diary-6-jingcisi.md | 净慈寺 | 未 | 佛偈体 | 第一次觉得安静是好的 | 钟声停了还在听，不知在等什么 | — |
| 7 | diary-7-leifengta.md | 雷峰塔 | 走 | 空白（泪痕墨渍） | 写不下去了 | 三个字后就是空白 | — |

**写作要求：**
- 情感弧线递进：冷静观察→好奇→不解→困惑→动摇→几乎是人→心碎
- 第7篇极短（"走不了了……"+ 空白描述），参照 spec
- 茶谱体用品茶格式模拟（"色：X，香：X，味：X，形：X"）
- 判词体用法官口吻（"查，某人某事..."）
- 佛偈体用四句偈形式
- 游记体笨拙可爱（"我假装是一个游客"）
- 第3篇自然嵌入跨城暗线句

- [ ] Step 1: 创建 `content/hangzhou/` 目录
- [ ] Step 2: 逐一创建7篇 diary 文件
- [ ] Step 3: 校验7篇首字连读 = "湖心有一人未走"
- [ ] Step 4: 校验情感弧线递进和文体差异
- [ ] Step 5: Commit

---

### Task 4: 杭州 — 信封内容 + 密电碎片 + 谜语线索

**Files:**
- Create: `content/hangzhou/envelope-seventh-page.md` — 第七页手稿（白素贞告白）
- Create: `content/hangzhou/envelope-annotations.md` — 七张照片标注卡 + 许仙笔迹
- Create: `content/hangzhou/cipher-fragments.md`
- Create: `content/hangzhou/riddles-and-clues.md`

**第七页手稿（来自spec）：**

```markdown
# 第七页手稿

> 信封内第一张纸。几乎空白的仿旧纸，只有墨渍和水渍。背面极淡一行字。

---

前六种是我在你们身上看到的。第七种是我自己的——不舍。

我观察了你们一千年，以为自己什么都懂了。变成人的第一天我才知道，懂和心疼不是一回事。

没有人把我关在塔下。是我自己留下来的。不是为了他——他已经不在了。

我留下来是因为，变成人的那几年里，我学会了一件蛇永远学不会的事：在乎一个地方。

我舍不得走。
```

**七张照片标注卡：**

| 站 | 白素贞标注 |
|----|-----------|
| 1 | 他们称之为选择 |
| 2 | 他们称之为陪伴 |
| 3 | 他们称之为耐心 |
| 4 | 他们称之为忠诚 |
| 5 | 他们称之为建造 |
| 6 | 他们称之为信仰 |
| 7 | **"我知道你还在。——许仙"**（不同笔迹） |

**密电碎片映射：**

完整消息：我见过一千年的西湖。但值得留下来的理由，只需要一个下午就够了。

| 阶段 | 碎片 |
|------|------|
| 1 | 我见过 |
| 2 | 一千年的 |
| 3 | 西湖 |
| 4 | 但值得 |
| 5 | 留下来的 |
| 6 | 理由只需要 |
| 7 | 一个下午就够了 |

**过渡线索：**

| 过渡 | 线索 |
|------|------|
| 1→2 | "沿白堤向西走。找那个用鹤当妻子的人——他住在湖中间的那座山上。" |
| 2→3 | "山中有泉，泉边有茶。她在学人间最苦的滋味。往西边的山里走——找十八棵树。" |
| 3→4 | "下山回到湖边。有个将军死了八百年，还有人替他生气。去看看那些跪着的人。" |
| 4→5 | "向南走上那条堤。一个写诗的胖子用泥巴做了一件比诗更伟大的事。数一数桥。" |
| 5→6 | "听钟。净慈寺的钟声停了之后，继续听。你听到的不是声音——是回响。" |
| 6→7 | "出寺向南。最后一座塔。她在那里等你。" |

- [ ] Step 1: 创建各文件
- [ ] Step 2: 校验密电碎片拼合结果
- [ ] Step 3: Commit

---

### Task 5: 西安 — 7篇康安旅记

**Files:**
- Create: `content/xian/diary-1-xiaoyanta.md`
- Create: `content/xian/diary-2-chengqiang.md`
- Create: `content/xian/diary-3-beilin.md`
- Create: `content/xian/diary-4-shuyuanmen.md`
- Create: `content/xian/diary-5-zhonggulou.md`
- Create: `content/xian/diary-6-huiminjie.md`
- Create: `content/xian/diary-7-dayanta.md`

**7篇详细规格：**

| # | 文件名 | 地点 | 首字 | 朋友 | 朋友性格亮点 | hidden_regret主题 | 美食元素 | 唐诗 |
|---|--------|------|------|------|-------------|-----------------|---------|------|
| 1 | diary-1-xiaoyanta.md | 小雁塔 | 此 | 般若(天竺僧) | 念经念到一半睡着，打呼比钟响 | 塔裂三次合三次，他的友谊也是 | 荐福寺素斋 | — |
| 2 | diary-2-chengqiang.md | 城墙南门 | 城 | 阿史那(突厥将) | 最大的人但怕猫 | 攻城的人想守城，说明他老了 | — | "秦时明月汉时关" |
| 3 | diary-3-beilin.md | 碑林 | 容 | 约翰(景教士) | 跟般若吵完一起喝酒"你的佛不错" | 也许不是和解，是拥抱 | — | — |
| 4 | diary-4-shuyuanmen.md | 书院门 | 得 | 张怀远(书法家) | 写招牌三天，"能认字就行""那不行" | 看不懂的字才值钱——可他最想被看懂 | 好酒+狂草菜单 | — |
| 5 | diary-5-zhonggulou.md | 钟鼓楼 | 下 | 阿倍仲麻吕(遣唐使) | 17岁来长安30年没回，念和歌哭了 | 鼓声传不到海那边 | — | 阿倍望乡和歌 |
| 6 | diary-6-huiminjie.md | 回民街 | 万 | 伊本(阿拉伯商) | 评价城市只看集市，"我老家"第一 | 孜然要最后放，放早了就苦 | 孜然烤羊肉+"胡"字溯源 | — |
| 7 | diary-7-dayanta.md | 大雁塔/不夜城 | 邦 | 胡禄(波斯拜火) | "这座城不需要神" | 火不灭就是神还在——但他的火灭了 | — | "春风得意马蹄疾" |

**写作要求：**
- 每篇以康安第一人称写，像一个见多识广但重友情的商人
- 每篇必须有该朋友的生动性格描写（幽默、有缺点、有温度）
- 美食描写自然嵌入（至少3站有食物）
- 唐诗从朋友的非汉人视角重新解读
- 安史之乱伏笔自然埋入（"最近听说范阳那边不太平"之类）
- 第7篇（或第6篇批注中）自然嵌入跨城暗线：**"有人说东海尽头有个渔港，将来也许会变成大城。我到不了那么远。"**

- [ ] Step 1: 创建 `content/xian/` 目录
- [ ] Step 2: 逐一创建7篇 diary 文件
- [ ] Step 3: 校验7篇首字连读 = "此城容得下万邦"
- [ ] Step 4: 校验美食线、唐诗线、朋友性格描写完整性
- [ ] Step 5: Commit

---

### Task 6: 西安 — 信封内容 + 密电碎片 + 谜语线索

**Files:**
- Create: `content/xian/envelope-letter.md` — 康安最后一页旅记
- Create: `content/xian/envelope-menu.md` — 七道菜菜单
- Create: `content/xian/envelope-invitation.md` — 请帖全文（七种"文字"）
- Create: `content/xian/cipher-fragments.md`
- Create: `content/xian/riddles-and-clues.md`

**康安最后一页旅记（来自spec）：**

```markdown
# 康安最后一页旅记

> 信封内第一张纸。仿旧纸打印。

---

如果你正在读这一页，说明有人找到了全部七份请帖。

我必须对你坦白——请帖很早就发出去了。般若、阿史那、约翰、张怀远、阿倍、伊本、胡禄，他们都答应来了。

但安史之乱来了。长安陷落了。般若逃回了天竺，阿史那回了草原，约翰不知所踪，张怀远殉了城，阿倍在海上漂了三年，伊本回了巴格达，胡禄的火灭了。

我把请帖重新刻在了他们最常去的七个地方。请帖还在，就说明这场晚宴还没有取消。

等了一千三百年。你来了。

——康安
天宝十四载，长安
```

**七道菜菜单（来自spec）：**

```markdown
# 康安的晚宴菜单

> 信封内第二张纸。

---

1. 般若教的：天竺素斋（荐福寺的做法，不加葱蒜）
2. 阿史那教的：草原炙肉（要用最粗的盐，火要旺）
3. 约翰教的：叙利亚橄榄饼（他说这是他母亲的配方）
4. 张怀远教的：关中凉皮（他说好吃的东西不需要复杂）
5. 阿倍教的：海鱼刺身（他说奈良的海鱼比长安的新鲜一千倍，但他已经吃不到了）
6. 伊本教的：孜然烤羊肉（孜然要最后放，放早了就苦）
7. 胡禄教的：波斯石榴鸡（他说石榴是火的果实）

*七道菜比七种文字更让人心碎。因为菜是要一起吃的。*
```

**请帖全文：**

```markdown
# 请帖全文

> 信封内第三张纸。七种"文字"书写（简化符号），下方统一翻译。

---

如果你读到了全部七种文字，请来赴宴。我已经备好了酒。等了一千三百年，终于凑齐一桌人。
```

**密电碎片映射：**

完整消息：如果你读到了全部七种文字，请来赴宴。我已经备好了酒。等了一千三百年，终于凑齐一桌人。

| 阶段 | 隐数 | 碎片 |
|------|------|------|
| 1 | 1 | 如果你读到了 |
| 2 | 2 | 全部七种文字， |
| 3 | 3 | 请来赴宴。 |
| 4 | 4 | 我已经备好了酒。 |
| 5 | 5 | 等了一千三百年， |
| 6 | 6 | 终于凑齐 |
| 7 | 7 | 一桌人。 |

**过渡线索：**

| 过渡 | 线索 |
|------|------|
| 1→2 | "般若说：'阿史那在南边的大门等你。那个门洞像一只张开的嘴，但吞不下他。'" |
| 2→3 | "阿史那说：'约翰那个洋和尚在城墙里头刻了一块碑。去看看。'" |
| 3→4 | "约翰说：'颜真卿的字是用血写的。张怀远的字是用命写的。往西走，那条街上全是字。'" |
| 4→5 | "张怀远说：'阿倍仲麻吕每天晚上听着鼓声数日子。往北走，去听那面鼓。'" |
| 5→6 | "阿倍说：'伊本说他能在长安的西市找到家的味道。你往北走，那条街现在还在。'" |
| 6→7 | "伊本说：'向南，找那座七层的塔。在塔下，我备好了酒。'" |

- [ ] Step 1: 创建各文件
- [ ] Step 2: 校验密电碎片拼合结果
- [ ] Step 3: Commit

---

### Task 7: 三城踩点清单

**Files:**
- Create: `fieldwork/nanjing-checklist.md`
- Create: `fieldwork/hangzhou-checklist.md`
- Create: `fieldwork/xian-checklist.md`

**格式参照：** `fieldwork/checklist.md`（上海已有）

每个清单包含：
- 每站需确认的实地数据（计数/距离/文字/位置/可见性）
- 路线间交通确认项
- 全程汇总（步行时间、地铁时间、问题记录）

**南京踩点清单核心项（提取自spec §12）：**

```markdown
# 「金陵刻痕」实地踩点清单

打印此文件，带上手机（拍照）、卷尺、笔。
按路线顺序走一遍全程，预计 4-5 小时。

## 站点1：中华门城堡
- [ ] 从南侧街面观察城门正面，记录可见门洞数：______
- [ ] 外墙城砖铭文拍照（选3-5块清晰可读的铭文）
- [ ] 选定用于道具复刻的具体砖铭内容：______
- [ ] 城门立面层数确认：______

## 站点2：老门东
- [ ] 确认箍桶巷路牌位置和可达性
- [ ] 确认剪子巷路牌位置
- [ ] 确认边营路牌位置
- [ ] 明代门楣（简朴莲花纹）拍照+门牌号：______
- [ ] 清代门楣（繁复福禄寿）拍照+门牌号：______
- [ ] 民国门楣（西化几何）拍照+门牌号：______
...（以此类推7站）
```

杭州和西安清单同理，从各自spec的§12/§13提取。

- [ ] Step 1: 创建 `fieldwork/nanjing-checklist.md`
- [ ] Step 2: 创建 `fieldwork/hangzhou-checklist.md`
- [ ] Step 3: 创建 `fieldwork/xian-checklist.md`
- [ ] Step 4: Commit

---

### Task 8: 南京道具模板

**Files:**
- Create: `props/nanjing/templates/shared-styles.css` — 复制上海版，改色调为城砖土色系
- Create: `props/nanjing/templates/diary-pages.html` — 7页验砖吏札记
- Create: `props/nanjing/templates/envelope-contents.html` — 遗札 + 七人名单
- Create: `props/nanjing/templates/cipher-cards.html` — 7张碎片卡
- Create: `props/nanjing/templates/brick-index-card.html` — 城砖索引卡
- Create: `props/nanjing/templates/bagu-scroll.html` — 八股残卷
- Create: `props/nanjing/templates/zhuangyuan-table.html` — 历代状元表
- Create: `props/nanjing/templates/viewfinder-card.html` — 取景框卡
- Create: `props/nanjing/templates/bell-decoder.html` — 梵钟译码表
- Create: `props/nanjing/templates/paper-ruler.html` — 纸尺
- Create: `props/nanjing/templates/photo-cards.html` — 拍照存档卡

**色调：**
- 主色：`#8b7355`（城砖土色）
- 辅色：`#8b1a1a`（深红）
- 纸底：`#f0e8d8`（旧纸色）
- 文字：`#2a1505`

**CSS 修改要点（从上海版 shared-styles.css 调整）：**

```css
/* 上海版关键色 */
--stamp-bg: #8b2020;  → 改为 #8b1a1a
--border-main: #8b6540; → 改为 #8b7355
--text-accent: #c9a96e; → 改为 #8b1a1a
```

**diary-pages.html 结构与上海完全一致：** 7个 `.page.diary-page`，每页含 `.diary-header`（站点/地点/日期）、`.diary-body`（正文从 `content/nanjing/diary-*.md` 提取）、`.diary-footer`（藏头字提示）。日期改为"洪武年间·南京"。

**特殊道具说明：**
- `brick-index-card.html`：仿明代公文格式，列出编号与指令的对照表，`__FIELD__` 留空
- `bagu-scroll.html`：仿旧试卷，八股文分8段排版，关键字位置预留
- `viewfinder-card.html`：A4纸裁剪线 + 4种形状窗格孔洞（圆/方/菱/扇）

- [ ] Step 1: 创建 `props/nanjing/templates/` 目录
- [ ] Step 2: 创建 `shared-styles.css`（南京色调）
- [ ] Step 3: 创建 `diary-pages.html`（7页札记）
- [ ] Step 4: 创建 `envelope-contents.html`（遗札+名单）
- [ ] Step 5: 创建 `cipher-cards.html`（碎片卡）
- [ ] Step 6: 创建其余6个专用道具模板
- [ ] Step 7: Commit

---

### Task 9: 杭州道具模板

**Files:**
- Create: `props/hangzhou/templates/shared-styles.css` — 水墨淡绿色调
- Create: `props/hangzhou/templates/diary-pages.html` — 7页手稿残页
- Create: `props/hangzhou/templates/envelope-contents.html` — 第七页手稿 + 标注卡
- Create: `props/hangzhou/templates/cipher-cards.html` — 碎片卡
- Create: `props/hangzhou/templates/radical-cards.html` — 偏旁部首碎片卡
- Create: `props/hangzhou/templates/seal-rubbing.html` — 残印拓片
- Create: `props/hangzhou/templates/tea-recipe.html` — 茶谱道具卡
- Create: `props/hangzhou/templates/couplet-rules.html` — 对联提取规则卡
- Create: `props/hangzhou/templates/bridge-record.html` — 六桥记录卡
- Create: `props/hangzhou/templates/jigong-riddle.html` — 济公禅机卡
- Create: `props/hangzhou/templates/photo-cards.html` — 拍照存档卡

**色调：**
- 主色：`#7a9e7e`（水墨淡绿）
- 辅色：`#4a6a4e`（深绿）
- 纸底：`#f5f0eb`（米白）
- 文字：`#2c3e2c`

**手稿残页特殊设计：**
- 7页手稿的字体风格渐变：第1页工整（宋体/仿宋）→ 中间渐草（楷体）→ 第7页空白只有墨渍SVG
- 第7页用CSS模拟墨渍和泪痕效果（`radial-gradient` 斑点）

- [ ] Step 1-7: 同Task 8结构，杭州色调和内容
- [ ] Step 8: Commit

---

### Task 10: 西安道具模板

**Files:**
- Create: `props/xian/templates/shared-styles.css` — 大唐金红色调
- Create: `props/xian/templates/diary-pages.html` — 7页康安旅记
- Create: `props/xian/templates/envelope-contents.html` — 最后旅记 + 菜单 + 请帖
- Create: `props/xian/templates/cipher-cards.html` — 碎片卡
- Create: `props/xian/templates/sanskrit-decoder.html` — 密码梵文对照表
- Create: `props/xian/templates/wall-cross-section.html` — 城墙断面图
- Create: `props/xian/templates/stele-map.html` — 碑面分区图
- Create: `props/xian/templates/calligraphy-cards.html` — 书法辨体卡
- Create: `props/xian/templates/season-drum.html` — 节气鼓记录卡
- Create: `props/xian/templates/silk-road-map.html` — 丝路食物地图
- Create: `props/xian/templates/kangan-menu.html` — 康安的菜单（含密码数字）
- Create: `props/xian/templates/photo-cards.html` — 拍照存档卡

**色调：**
- 主色：`#c41e1e`（大唐红）
- 辅色：`#d4a020`（赭金）
- 纸底：`#f5e8d0`（绢色）
- 文字：`#1e1210`

**请帖全文特殊设计：**
- 7种"文字"用装饰性符号表示（梵文风/突厥风/叙利亚风/汉字/日文风/阿拉伯风/波斯风）
- 可用 Unicode 装饰字符或简单 SVG 符号暗示不同文字体系
- 下方统一中文翻译

- [ ] Step 1-8: 同Task 8结构，西安色调和内容
- [ ] Step 9: Commit

---

### Task 11: 跨城彩蛋 — Archive页"暗线一瞥"区域

**功能：** 当玩家完成2个及以上城市后，在该城市的 Archive 页面底部显示"暗线一瞥"区域，展示跨城互文引用。

**Files:**
- Modify: `app/src/pages/Archive.vue` — 底部新增暗线区域
- Create: `app/src/data/cross-city-threads.js` — 跨城暗线数据

**跨城暗线数据结构：**

```javascript
// app/src/data/cross-city-threads.js
export const CROSS_CITY_THREADS = [
  {
    from: 'shanghai',
    to: 'nanjing',
    fromQuote: '南京的城墙比上海的高，但我更怕矮墙——矮墙后面才藏人。',
    fromSource: '鹤影日记·第六站·思南公馆',
    toQuote: '听说杭州西湖边也在修堤，不知那边的泥巴里有没有人偷偷刻字。',
    toSource: '陆鸣远札记·第四站·秦淮河'
  },
  {
    from: 'nanjing',
    to: 'hangzhou',
    fromQuote: '听说杭州西湖边也在修堤，不知那边的泥巴里有没有人偷偷刻字。',
    fromSource: '陆鸣远札记·第四站·秦淮河',
    toQuote: '长安有个胡商，听说也在这世间留了很久。但他是自愿的。',
    toSource: '白素贞手稿·第三站·龙井村'
  },
  {
    from: 'hangzhou',
    to: 'xian',
    fromQuote: '长安有个胡商，听说也在这世间留了很久。但他是自愿的。',
    fromSource: '白素贞手稿·第三站·龙井村',
    toQuote: '有人说东海尽头有个渔港，将来也许会变成大城。我到不了那么远。',
    toSource: '康安旅记·第七站·大雁塔'
  },
  {
    from: 'xian',
    to: 'shanghai',
    fromQuote: '有人说东海尽头有个渔港，将来也许会变成大城。我到不了那么远。',
    fromSource: '康安旅记·第七站·大雁塔',
    toQuote: '南京的城墙比上海的高，但我更怕矮墙——矮墙后面才藏人。',
    toSource: '鹤影日记·第六站·思南公馆'
  }
]

/**
 * Get threads relevant to a completed pair of cities
 * @param {string[]} completedCities - array of completed city IDs
 * @param {string} currentCity - the city whose Archive page is being viewed
 * @returns {Array} relevant thread objects
 */
export function getVisibleThreads(completedCities, currentCity) {
  return CROSS_CITY_THREADS.filter(t =>
    (t.from === currentCity || t.to === currentCity) &&
    completedCities.includes(t.from) &&
    completedCities.includes(t.to)
  )
}
```

**Archive.vue 修改：** 在现有 Archive 内容之后，添加条件渲染的暗线区域：

```vue
<!-- 暗线一瞥 — 跨城互文 -->
<section v-if="visibleThreads.length > 0" class="cross-city-threads">
  <div class="threads-divider">
    <span class="threads-label">暗线一瞥</span>
  </div>
  <div v-for="thread in visibleThreads" :key="thread.from + thread.to" class="thread-card">
    <blockquote class="thread-quote">
      "{{ thread.fromQuote }}"
      <cite>——{{ thread.fromSource }}</cite>
    </blockquote>
    <div class="thread-connector">↔</div>
    <blockquote class="thread-quote">
      "{{ thread.toQuote }}"
      <cite>——{{ thread.toSource }}</cite>
    </blockquote>
  </div>
  <p v-if="allCitiesCompleted" class="all-complete-hint">
    四座城市的主角，都在不经意间提到了另一座城。
    <router-link to="/cross-city-reveal">→ 查看完整暗线</router-link>
  </p>
</section>
```

- [ ] Step 1: 创建 `app/src/data/cross-city-threads.js`
- [ ] Step 2: 在 `Archive.vue` 中 import 数据和 platform store
- [ ] Step 3: 添加 computed: `visibleThreads` 和 `allCitiesCompleted`
- [ ] Step 4: 添加暗线区域的 template 和 CSS
- [ ] Step 5: 运行 `npm run build` 验证无错误
- [ ] Step 6: Commit

---

### Task 12: 跨城彩蛋 — 全通关揭示页

**功能：** 4城全部通关后解锁的最终页面，展示四个主角的跨城互文闭环。

**Files:**
- Create: `app/src/pages/CrossCityReveal.vue`
- Modify: `app/src/router.js` — 添加 `/cross-city-reveal` 路由

**CrossCityReveal.vue 设计：**

页面结构：
1. 标题："四座城，四个人，一条暗线"
2. 闭环展示：上海→南京→杭州→西安→上海，每段展示互文引用
3. 时间线注释：1943年（鹤影）→ 明朝（陆鸣远）→ 南宋（白素贞）→ 唐朝（康安）
4. 结语："他们相隔几百年，不可能认识彼此。但他们都在各自的城市里，偶然提到了另一座城。也许，认真活过的人，总会在某个拐角遇见另一个认真活过的人。"

**路由守卫：** 检查 `platformStore.allCitiesCompleted`，未全通关则重定向回首页。

```javascript
// router.js 新增路由
{
  path: '/cross-city-reveal',
  name: 'CrossCityReveal',
  component: () => import('./pages/CrossCityReveal.vue'),
  beforeEnter: (to, from, next) => {
    const platform = usePlatformStore()
    if (platform.allCitiesCompleted) next()
    else next('/')
  }
}
```

- [ ] Step 1: 创建 `CrossCityReveal.vue` 组件
- [ ] Step 2: 添加路由和守卫
- [ ] Step 3: 在 PlatformHome.vue 全通关时显示入口链接
- [ ] Step 4: 运行 `npm run build` 验证
- [ ] Step 5: Commit

---

### Task 13: PDF生成脚本扩展

**Files:**
- Modify: `props/generate-pdfs.js` — 支持子目录扫描

当前脚本只扫描 `props/templates/*.html`。需要扩展为也扫描 `props/{cityId}/templates/*.html`。

```javascript
// 修改 findTemplates() 函数
async function findTemplates() {
  const results = [];
  
  // 1. 原有 templates/ 目录（上海）
  const mainEntries = await readdir(TEMPLATES_DIR).catch(() => []);
  results.push(...mainEntries
    .filter(f => extname(f).toLowerCase() === '.html')
    .map(f => ({ path: resolve(TEMPLATES_DIR, f), city: 'shanghai' }))
  );
  
  // 2. 各城市子目录
  for (const city of ['nanjing', 'hangzhou', 'xian']) {
    const cityDir = resolve(__dirname, city, 'templates');
    const entries = await readdir(cityDir).catch(() => []);
    results.push(...entries
      .filter(f => extname(f).toLowerCase() === '.html')
      .map(f => ({ path: resolve(cityDir, f), city }))
    );
  }
  
  return results.sort((a, b) => a.city.localeCompare(b.city) || a.path.localeCompare(b.path));
}
```

输出目录也按城市分：`output/shanghai/`, `output/nanjing/`, etc.

- [ ] Step 1: 修改 `findTemplates()` 支持子目录
- [ ] Step 2: 修改 `generatePdf()` 输出路径包含城市名
- [ ] Step 3: 更新 `main()` 的日志输出
- [ ] Step 4: Commit

---

### Task 14: 上海内容文件目录重组

**问题：** 上海内容文件在根目录 `content/`，三城在子目录 `content/{cityId}/`，不一致。

**Files:**
- Move: `content/diary-*.md` → `content/shanghai/diary-*.md`
- Move: `content/envelope-*.md` → `content/shanghai/envelope-*.md`
- Move: `content/cipher-fragments.md` → `content/shanghai/cipher-fragments.md`
- Move: `content/riddles-and-clues.md` → `content/shanghai/riddles-and-clues.md`

注意：这些 content 文件不被代码 import，仅作为素材文件，移动不影响构建。

- [ ] Step 1: 创建 `content/shanghai/` 目录
- [ ] Step 2: 移动所有上海内容文件
- [ ] Step 3: 验证 `npm run build` 无影响
- [ ] Step 4: Commit

---

### Task 15: 最终构建验证

- [ ] Step 1: 运行 `cd app && npm run build`，确认0错误
- [ ] Step 2: 检查所有新建文件的一致性：
  - 南京7篇首字 = "城巷有声音尚在"
  - 杭州7篇首字 = "湖心有一人未走"
  - 西安7篇首字 = "此城容得下万邦"
  - 每篇 hidden_regret 存在
  - 跨城暗线4句分别在正确位置
- [ ] Step 3: 检查 cross-city-threads.js 中的4条暗线引用与实际diary内容完全一致
- [ ] Step 4: Commit all remaining changes

---

## 执行顺序建议

1. **Task 14** (上海目录重组) — 先做，避免后续冲突
2. **Task 0** (上海物料同步) — 修复已知问题
3. **Task 1→2** (南京内容) → **Task 3→4** (杭州内容) → **Task 5→6** (西安内容) — 内容创作核心
4. **Task 7** (踩点清单) — 可与内容创作并行
5. **Task 8→10** (道具模板) — 依赖内容完成
6. **Task 11→12** (彩蛋UI) — 独立于内容
7. **Task 13** (PDF脚本) — 依赖道具模板完成
8. **Task 15** (最终验证)

**并行化机会：** Task 1+3+5 可并行（三城diary创作互相独立），Task 7 可与任何内容task并行，Task 11-12 可与 Task 8-10 并行。
