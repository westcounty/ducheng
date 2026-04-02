# 「读城」平台设计文档

> 版本：v1.0 | 日期：2026-04-02
> 状态：设计稿

---

## 1. 平台概述

「读城」是一个城市实景解谜游戏平台。玩家通过统一入口选择城市/剧本后，进入独立的游戏流程。每个城市是一条完整的实景解谜路线，拥有独立的叙事主线、谜题机制和视觉主题。

**已规划城市（4个）：**

| 城市 | 剧本名 | 一句话简介 | 状态 |
|------|--------|-----------|------|
| 上海 | 第七封密电 | 一个间谍的最后一条路 | 已完成 |
| 南京 | 金陵刻痕 | 一个读了整座城的人 | 待开发 |
| 杭州 | 断桥不断 | 一条蛇写的人类观察笔记 | 待开发 |
| 西安 | 长安译 | 一场迟到一千三百年的晚宴 | 待开发 |

**技术栈：** Vue 3 + Vite + Pinia，H5 网页，微信内打开。

**核心设计原则：**

- 共用框架，数据隔离——组件和页面结构共用，叙事和谜题数据按城市独立存放
- 每个城市的视觉体验完全不同，通过主题系统实现换肤
- 各城市进度独立，互不干扰
- 跨城彩蛋作为隐藏层，奖励探索多个城市的玩家

---

## 2. 首页设计

### 2.1 城市选择界面

首页是平台的统一入口，展示 4 张城市卡片，纵向排列，可滚动。

每张卡片包含以下元素：

```
┌─────────────────────────────────┐
│  [城市标志性建筑剪影]            │
│                                 │
│   上海                          │
│   第七封密电                     │
│   「一个间谍的最后一条路」        │
│                          [已通关] │
└─────────────────────────────────┘
```

- **城市名**：大字，使用该城市主题色
- **剧本名**：副标题
- **一句话简介**：带书名号，描述性文字
- **标志性视觉**：建筑剪影作为卡片背景或顶部装饰
  - 上海：外滩天际线（和平饭店+海关大楼轮廓）
  - 南京：明城墙+中华门轮廓
  - 杭州：断桥+雷峰塔轮廓
  - 西安：大雁塔+城楼轮廓
- **完成标记**：已通关城市右下角显示印章风格的完成标记

### 2.2 底部信息

```
读城 | 在一座城市里走一条路，解一个人留下的谜。
```

简短一句话介绍平台概念。下方可放版本号和反馈入口。

### 2.3 交互

- 点击卡片进入该城市的游戏首页
- 未开放城市卡片置灰，显示"即将开放"
- 已有进度的城市卡片显示"继续游戏"，无进度显示"开始探索"

---

## 3. 主题换肤系统

### 3.1 四城视觉主题

每个城市拥有独立的视觉主题，包括色调、背景纹理、字体风格：

| 城市 | 主色调 | 辅助色 | 背景纹理 | 视觉气质 |
|------|--------|--------|---------|---------|
| 上海 | 深灰 `#2c2c2c` | 铜金 `#c9a96e` | Art Deco 几何线条 | 现代感、谍战冷峻 |
| 南京 | 城砖土色 `#8b7355` | 深红 `#8b1a1a` | 砖纹质感 | 厚重古朴、沉郁 |
| 杭州 | 水墨淡绿 `#7a9e7e` | 白 `#f5f0eb` | 水波纹理 | 清雅文人气 |
| 西安 | 大唐金红 `#c41e1e` | 赭石 `#a0522d` | 回纹/团花纹理 | 盛世华贵、磅礴 |

### 3.2 实现方式

采用 **CSS 变量 + 主题 class 切换** 方案：

```css
/* 基础变量定义（以上海为例，即现有方案） */
:root,
.theme-shanghai {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2c2c2c;
  --text-primary: #e8e0d4;
  --text-accent: #c9a96e;
  --border-color: #3a3a3a;
  --paper-texture: url('/textures/shanghai-deco.png');
  --font-heading: 'Noto Serif SC', serif;
  --font-body: 'Noto Sans SC', sans-serif;
}

.theme-nanjing {
  --bg-primary: #2a2218;
  --bg-secondary: #3d3226;
  --text-primary: #e8dcc8;
  --text-accent: #8b1a1a;
  --border-color: #5a4a3a;
  --paper-texture: url('/textures/nanjing-brick.png');
  --font-heading: 'Noto Serif SC', serif;
  --font-body: 'Noto Sans SC', sans-serif;
}

.theme-hangzhou {
  --bg-primary: #f5f0eb;
  --bg-secondary: #e8e2d8;
  --text-primary: #2c3e2c;
  --text-accent: #7a9e7e;
  --border-color: #c8c0b4;
  --paper-texture: url('/textures/hangzhou-water.png');
  --font-heading: 'ZCOOL XiaoWei', serif;
  --font-body: 'Noto Sans SC', sans-serif;
}

.theme-xian {
  --bg-primary: #1e1210;
  --bg-secondary: #2e1e18;
  --text-primary: #f0e0c8;
  --text-accent: #d4a020;
  --border-color: #5a3a2a;
  --paper-texture: url('/textures/xian-huiwen.png');
  --font-heading: 'Noto Serif SC', serif;
  --font-body: 'Noto Sans SC', sans-serif;
}
```

### 3.3 切换机制

- 首页使用平台默认主题（深色中性底 + 各卡片局部使用对应城市色）
- 进入某城市后，在 `App.vue` 的 `.app-container` 上动态添加 `theme-{cityId}` class
- 通过 `router.beforeEach` 或 `watch(route)` 自动切换
- 主题 class 影响全局 CSS 变量，所有组件无需修改即可响应主题变化

```js
// App.vue 中的主题切换逻辑
const route = useRoute()
const themeClass = computed(() => {
  const cityId = route.params.cityId
  return cityId ? `theme-${cityId}` : 'theme-default'
})
```

---

## 4. 数据架构

### 4.1 现有架构（上海单城市）

当前上海项目的文件结构：

```
app/src/
├── router.js                    # 路由：/, /stage/:id, /transit/:from/:to, /finale, /archive
├── stores/game.js               # Pinia store，单城市状态，key: seventh-cipher-game-state
├── data/
│   ├── puzzles.js               # STAGES[1-7]，每站包含 steps/hints/transition
│   └── narrative.js             # INTRO_STORY, FINALE, PHOTO_DIARY_PAIRS 等
├── pages/
│   ├── Home.vue                 # 游戏首页（开始/继续）
│   ├── Stage.vue                # 关卡页面
│   ├── Transit.vue              # 站间过渡
│   ├── Finale.vue               # 终章
│   └── Archive.vue              # 档案馆
└── components/
    ├── NarrativeText.vue        # 打字机效果叙事文字
    ├── AnswerInput.vue          # 答案输入（text/number/confirm）
    ├── HintSystem.vue           # 三级提示系统
    └── PhotoCapture.vue         # 拍照存档
```

**关键观察：**

- `router.js` 路由全部是扁平结构（`/stage/:id`），无城市前缀
- `game.js` store 使用硬编码的 `STORAGE_KEY = 'seventh-cipher-game-state'`
- `puzzles.js` 导出 `STAGES` 数组和 `TOTAL_STAGES` 常量
- `narrative.js` 导出 `INTRO_STORY`、`FINALE`、`PHOTO_DIARY_PAIRS` 等
- `Stage.vue` 通过 `getStage(id)` 直接引用 puzzles 数据
- `App.vue` 结构简洁，仅包含 `router-view` 和过渡动画

### 4.2 平台化后的架构

```
app/src/
├── router.js                           # 平台化路由（见4.3）
├── stores/
│   ├── platform.js                     # 新增：平台级状态（已完成城市、彩蛋解锁）
│   └── game.js                         # 改造：支持多城市，接受 cityId 参数
├── data/
│   ├── cities.js                       # 新增：城市元数据（名称、简介、主题配置）
│   └── cities/
│       ├── shanghai/
│       │   ├── puzzles.js              # 原 data/puzzles.js 迁入
│       │   └── narrative.js            # 原 data/narrative.js 迁入
│       ├── nanjing/
│       │   ├── puzzles.js
│       │   └── narrative.js
│       ├── hangzhou/
│       │   ├── puzzles.js
│       │   └── narrative.js
│       └── xian/
│           ├── puzzles.js
│           └── narrative.js
├── pages/
│   ├── PlatformHome.vue                # 新增：平台首页（城市选择）
│   ├── CityHome.vue                    # 新增：城市首页（原 Home.vue 改造）
│   ├── Stage.vue                       # 改造：通过 cityId 动态加载数据
│   ├── Transit.vue                     # 改造：同上
│   ├── Finale.vue                      # 改造：同上
│   ├── Archive.vue                     # 改造：同上，底部增加跨城彩蛋区域
│   └── CrossCityEaster.vue             # 新增：全城通关彩蛋页面
├── components/
│   ├── NarrativeText.vue               # 不变
│   ├── AnswerInput.vue                 # 不变
│   ├── HintSystem.vue                  # 不变
│   ├── PhotoCapture.vue                # 不变
│   └── CityCard.vue                    # 新增：首页城市卡片组件
├── composables/
│   └── useCityData.js                  # 新增：按 cityId 动态加载城市数据
└── styles/
    ├── themes/
    │   ├── shanghai.css                # 上海主题变量
    │   ├── nanjing.css                 # 南京主题变量
    │   ├── hangzhou.css                # 杭州主题变量
    │   └── xian.css                    # 西安主题变量
    └── base.css                        # 公共基础样式
```

### 4.3 路由结构

```js
const routes = [
  // 平台首页
  { path: '/', name: 'PlatformHome', component: PlatformHome },

  // 城市首页
  { path: '/city/:cityId', name: 'CityHome', component: CityHome },

  // 关卡
  { path: '/city/:cityId/stage/:id', name: 'Stage', component: Stage },

  // 站间过渡
  { path: '/city/:cityId/transit/:from/:to', name: 'Transit', component: Transit },

  // 终章
  { path: '/city/:cityId/finale', name: 'Finale', component: Finale },

  // 档案馆
  { path: '/city/:cityId/archive', name: 'Archive', component: Archive },

  // 跨城彩蛋（全城通关后解锁）
  { path: '/crosscity', name: 'CrossCityEaster', component: CrossCityEaster }
]
```

路由守卫逻辑改造：

```js
router.beforeEach((to) => {
  if (to.path === '/') return true

  const cityId = to.params.cityId
  if (!cityId) return true

  // 按城市获取对应 game store 实例
  const game = useGameStore(cityId)

  // 原有的 stage/finale/archive 守卫逻辑不变，
  // 仅从 game store 切换为按 cityId 实例化
  // ...
})
```

### 4.4 城市数据动态加载

使用 composable 封装按需加载逻辑：

```js
// composables/useCityData.js
const cityDataCache = {}

export async function useCityData(cityId) {
  if (cityDataCache[cityId]) return cityDataCache[cityId]

  const [puzzles, narrative] = await Promise.all([
    import(`../data/cities/${cityId}/puzzles.js`),
    import(`../data/cities/${cityId}/narrative.js`)
  ])

  cityDataCache[cityId] = {
    stages: puzzles.STAGES,
    totalStages: puzzles.TOTAL_STAGES,
    getStage: puzzles.getStage,
    introStory: narrative.INTRO_STORY,
    finale: narrative.FINALE,
    photoDiaryPairs: narrative.PHOTO_DIARY_PAIRS,
    // ...其他导出
  }

  return cityDataCache[cityId]
}
```

每个城市的 `puzzles.js` 和 `narrative.js` 保持与现有上海数据相同的导出接口，确保组件无需关心具体城市：

```js
// 每个城市的 puzzles.js 必须导出：
export const STAGES = [...]
export const TOTAL_STAGES = N
export function getStage(id) { ... }

// 每个城市的 narrative.js 必须导出：
export const INTRO_STORY = '...'
export const FINALE = { ... }
export const PHOTO_DIARY_PAIRS = [...]
```

### 4.5 城市元数据

```js
// data/cities.js
export const CITIES = [
  {
    id: 'shanghai',
    name: '上海',
    scriptName: '第七封密电',
    tagline: '一个间谍的最后一条路',
    theme: 'shanghai',
    silhouette: '/images/silhouette-shanghai.svg',
    available: true,
    totalStages: 7
  },
  {
    id: 'nanjing',
    name: '南京',
    scriptName: '金陵刻痕',
    tagline: '一个读了整座城的人',
    theme: 'nanjing',
    silhouette: '/images/silhouette-nanjing.svg',
    available: false,
    totalStages: null  // 待定
  },
  {
    id: 'hangzhou',
    name: '杭州',
    scriptName: '断桥不断',
    tagline: '一条蛇写的人类观察笔记',
    theme: 'hangzhou',
    silhouette: '/images/silhouette-hangzhou.svg',
    available: false,
    totalStages: null
  },
  {
    id: 'xian',
    name: '西安',
    scriptName: '长安译',
    tagline: '一场迟到一千三百年的晚宴',
    theme: 'xian',
    silhouette: '/images/silhouette-xian.svg',
    available: false,
    totalStages: null
  }
]
```

---

## 5. 状态管理

### 5.1 game store 改造

现有 `game.js` 使用硬编码 key `seventh-cipher-game-state`。平台化后需支持多城市独立实例。

**方案：工厂函数 + 动态 store id**

```js
// stores/game.js
import { defineStore } from 'pinia'

/**
 * 按城市创建独立的 game store
 * @param {string} cityId - 城市标识符
 */
export function useGameStore(cityId) {
  const storeName = `game-${cityId}`
  const STORAGE_KEY = `ducheng_${cityId}_state`

  return defineStore(storeName, () => {
    // ... 与现有 game.js 完全相同的 state/computed/actions，
    //     仅 STORAGE_KEY 替换为按城市隔离的 key
  })()
}
```

**localStorage key 命名规则：**

| 数据 | Key 格式 | 示例 |
|------|---------|------|
| 游戏进度 | `ducheng_{cityId}_state` | `ducheng_shanghai_state` |
| 照片数据 | `ducheng_{cityId}_photos` | `ducheng_nanjing_photos` |
| 平台数据 | `ducheng_platform` | `ducheng_platform` |

### 5.2 platform store（新增）

```js
// stores/platform.js
import { defineStore } from 'pinia'

const STORAGE_KEY = 'ducheng_platform'

export const usePlatformStore = defineStore('platform', () => {
  // 已完成城市列表
  const completedCities = ref([])      // e.g. ['shanghai', 'nanjing']

  // 跨城彩蛋解锁状态
  const crossCityUnlocks = reactive({}) // e.g. { 'shanghai+nanjing': true }

  // 全城通关标记
  const allCitiesCompleted = computed(() =>
    completedCities.value.length >= 4
  )

  // 当某城市通关时调用
  function markCityCompleted(cityId) {
    if (!completedCities.value.includes(cityId)) {
      completedCities.value.push(cityId)
      checkCrossCityUnlocks()
      persist()
    }
  }

  // 检查跨城彩蛋解锁条件
  function checkCrossCityUnlocks() {
    const pairs = [
      ['shanghai', 'nanjing'],
      ['shanghai', 'hangzhou'],
      ['nanjing', 'xian'],
      ['hangzhou', 'xian']
    ]
    for (const [a, b] of pairs) {
      if (completedCities.value.includes(a) && completedCities.value.includes(b)) {
        crossCityUnlocks[`${a}+${b}`] = true
      }
    }
  }

  function persist() { /* ... */ }

  return { completedCities, crossCityUnlocks, allCitiesCompleted, markCityCompleted }
})
```

### 5.3 IndexedDB 照片存储

现有 `photo-store.js` 按城市分隔 IndexedDB object store：

```
ducheng-photos (IndexedDB 数据库)
  ├── shanghai (object store)
  ├── nanjing  (object store)
  ├── hangzhou (object store)
  └── xian     (object store)
```

每个 object store 内部结构不变（stageId 为 key，Blob 为 value）。

---

## 6. 跨城彩蛋系统

### 6.1 设计理念

四个城市的主角之间存在隐藏的互文关系。每个城市的日记/手稿中散落着指向其他城市的暗线句子。玩家完成多个城市后，这些暗线浮出水面，揭示一个跨越四城的共同主题——

**"在一座城市里留下痕迹，然后消失的人"。**

### 6.2 暗线句子分布

每个城市的叙事数据中预埋跨城暗线（在各城市的 `narrative.js` 中定义）：

| 来源城市 | 暗线句子 | 指向城市 |
|---------|---------|---------|
| 上海（鹤影日记） | "南京的城墙上，有个人刻了一行字，后来城墙修缮，字被抹掉了。但墙记得。" | 南京 |
| 南京（陆鸣远手稿） | "听说杭州断桥边，有人每年冬天来等一个不会再出现的人。" | 杭州 |
| 杭州（白素贞笔记） | "长安城有一场宴席，主人等了一千三百年，客人始终没有来。" | 西安 |
| 西安（宴席名录） | "上海外滩有个人，把一封信拆成七段藏在路上。这种事，只有走过才知道。" | 上海 |

### 6.3 解锁逻辑

**两城互文（局部解锁）：**

- 完成任意两个相邻城市后，在各自的 Archive 页面底部出现"暗线一瞥"区域
- 显示两个城市之间的互文句子对
- 视觉处理：半透明墨迹效果，像是从纸张深处浮现的字迹

**全城互文（完全解锁）：**

- 完成全部 4 个城市后，Archive 页面的"暗线一瞥"区域出现"查看完整暗线"入口
- 点击进入 `CrossCityEaster` 页面

### 6.4 全城通关彩蛋页面

`CrossCityEaster.vue` 的内容结构：

```
1. 四城主角头像/剪影依次出现（上海→南京→杭州→西安）
2. 每位主角的跨城暗线句子逐条展示
3. 四条暗线形成闭环：上海→南京→杭州→西安→上海
4. 最终揭示语：

   "四座城，四个人。
    他们在不同的年代走过不同的路，
    留下的痕迹被时间抹去，
    但城市记得。
    
    你也走过了。
    现在，你也是其中之一。"

5. 展示一张由四城地标组成的拼合图
```

### 6.5 数据结构

```js
// data/crossCityEaster.js
export const CROSS_CITY_THREADS = [
  {
    from: 'shanghai',
    to: 'nanjing',
    character: '鹤影',
    quote: '南京的城墙上，有个人刻了一行字，后来城墙修缮，字被抹掉了。但墙记得。'
  },
  {
    from: 'nanjing',
    to: 'hangzhou',
    character: '陆鸣远',
    quote: '听说杭州断桥边，有人每年冬天来等一个不会再出现的人。'
  },
  {
    from: 'hangzhou',
    to: 'xian',
    character: '白素贞',
    quote: '长安城有一场宴席，主人等了一千三百年，客人始终没有来。'
  },
  {
    from: 'xian',
    to: 'shanghai',
    character: '裴行俭',
    quote: '上海外滩有个人，把一封信拆成七段藏在路上。这种事，只有走过才知道。'
  }
]

export const FINAL_REVEAL = {
  message: '四座城，四个人。\n他们在不同的年代走过不同的路，\n留下的痕迹被时间抹去，\n但城市记得。\n\n你也走过了。\n现在，你也是其中之一。',
  theme: '在一座城市里留下痕迹，然后消失的人'
}
```

---

## 7. 迁移计划

### Phase 1：路由与数据层重构（1周）

**目标：** 现有上海代码在新路由结构下正常运行。

| 任务 | 说明 |
|------|------|
| 1.1 迁移数据文件 | `data/puzzles.js` → `data/cities/shanghai/puzzles.js`，`data/narrative.js` → `data/cities/shanghai/narrative.js`，保持导出接口不变 |
| 1.2 创建城市元数据 | 新增 `data/cities.js`，定义四城基本信息，仅上海标记为 `available: true` |
| 1.3 改造路由 | 所有路由加上 `/city/:cityId` 前缀，旧路由 `/#/stage/3` 重定向到 `/#/city/shanghai/stage/3` |
| 1.4 改造 game store | 工厂函数化，localStorage key 按城市隔离，旧 key 数据自动迁移到新 key |
| 1.5 创建 useCityData | composable 封装动态 import，Stage/Transit/Finale/Archive 页面通过它获取数据 |
| 1.6 回归测试 | 确保上海全流程（首页→7站→终章→档案馆）在新架构下完整可用 |

### Phase 2：首页与主题系统（1周）

| 任务 | 说明 |
|------|------|
| 2.1 新增 PlatformHome | 城市选择页面，CityCard 组件 |
| 2.2 新增 CityHome | 原 Home.vue 改造，接收 cityId 参数 |
| 2.3 主题 CSS 拆分 | 上海主题变量提取到 `themes/shanghai.css`，App.vue 实现动态主题 class 切换 |
| 2.4 准备其他城市主题 | 南京/杭州/西安的 CSS 变量和纹理素材 |
| 2.5 IndexedDB 分城市 | photo-store 改造为按城市隔离的 object store |

### Phase 3：接入新城市数据（每城市约2周）

每个新城市的接入流程：

1. 编写 `data/cities/{cityId}/puzzles.js`（站点、步骤、答案、提示）
2. 编写 `data/cities/{cityId}/narrative.js`（叙事、终章、日记照片对）
3. 准备主题纹理素材和城市剪影 SVG
4. 城市元数据中标记 `available: true`
5. 实地测试全流程
6. 制作配套实体道具 PDF

**计划顺序：** 南京 → 杭州 → 西安

### Phase 4：跨城彩蛋系统（1周）

| 任务 | 说明 |
|------|------|
| 4.1 platform store | 实现已完成城市追踪和跨城解锁检查 |
| 4.2 Archive 暗线区域 | 在各城市 Archive 页面底部增加"暗线一瞥"条件渲染区域 |
| 4.3 CrossCityEaster 页面 | 全城通关彩蛋页面开发 |
| 4.4 各城市预埋暗线 | 在各城市 narrative.js 中添加 `crossCityThread` 字段 |

---

## 附录 A：组件接口约定

平台化后，以下共用组件的 props 接口保持不变：

| 组件 | 关键 Props | 说明 |
|------|-----------|------|
| `NarrativeText` | `text`, `speed` | 打字机效果叙事文字 |
| `AnswerInput` | `answer`, `type` | 答案输入与校验（text/number/confirm） |
| `HintSystem` | `hints`, `stageId`, `stepId` | 三级渐进提示 |
| `PhotoCapture` | `stageId`, `prompt` | 拍照存档（需传入 cityId 用于存储隔离） |

`PhotoCapture` 需要增加 `cityId` prop，用于将照片存入对应城市的 IndexedDB object store。

---

## 附录 B：向后兼容

- 已有玩家的上海游戏进度（localStorage key `seventh-cipher-game-state`）需在首次加载时自动迁移到 `ducheng_shanghai_state`
- 旧版 URL `/#/stage/3` 等需通过路由重定向指向 `/#/city/shanghai/stage/3`
- 迁移完成后旧 key 保留 30 天后自动清除

---

## 附录 C：未来扩展

- **城市包下载**：当城市数量增多时，可将非当前城市的数据做 code splitting，按需加载
- **UGC 城市**：远期可开放城市编辑器，让用户创建自己城市的解谜路线
- **多语言**：为海外城市或国际玩家提供英文界面
- **社交分享**：通关后生成包含游戏数据的分享卡片
