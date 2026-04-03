# 技术架构

## 系统架构

纯前端单页应用（SPA），无后端服务。所有游戏数据和逻辑在客户端完成，状态持久化到 localStorage。

```
┌────────────────────────────────────────┐
│  浏览器（微信内置 / 手机浏览器）          │
│  ┌──────────────────────────────────┐  │
│  │  Vue 3 SPA（Hash Router）        │  │
│  │  ┌───────┐ ┌───────┐ ┌────────┐ │  │
│  │  │ Pages │ │Stores │ │ Data   │ │  │
│  │  │ (7)   │ │(Pinia)│ │(5城x2) │ │  │
│  │  └───┬───┘ └───┬───┘ └───┬────┘ │  │
│  │      └─────────┼─────────┘      │  │
│  │          localStorage            │  │
│  │          IndexedDB (照片)         │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
          │
          ▼  纯静态托管
┌────────────────────┐
│  Nginx (HTTPS)     │
│  /var/www/ducheng   │
│  ducheng.nju.top    │
└────────────────────┘
```

## 前端架构

### 路由

Hash 模式路由（`createWebHashHistory`），支持微信内置浏览器。

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | PlatformHome | 城市选择首页 |
| `/city/:cityId` | Home | 单城剧本首页（介绍+开始） |
| `/city/:cityId/stage/:id` | Stage | 解谜关卡（1-7） |
| `/city/:cityId/transit/:from/:to` | Transit | 站间过渡（线索+导航） |
| `/city/:cityId/finale` | Finale | 终章（三阶段揭示） |
| `/city/:cityId/archive` | Archive | 档案室（回顾+暗线+分享） |
| `/cross-city-reveal` | CrossCityReveal | 全通关跨城揭示 |

路由守卫确保玩家只能按顺序访问（不能跳关）。

### 状态管理

Pinia 动态 store，按城市 ID 隔离：

- **`game-${cityId}`**：单城游戏状态（当前站、当前步骤、已收集碎片、拍照记录、提示使用、计时）
- **`platform`**：平台级状态（已通关城市列表、徽章）

所有状态自动序列化到 `localStorage`（key: `ducheng_${cityId}_state`）。照片存储在 IndexedDB。

### 数据架构

每个城市由两个数据模块组成，按需动态加载（`import()`）：

```
data/cities/${cityId}/
├── puzzles.js      # STAGES[1-7]：每站的位置、步骤、答案、提示、过渡线索
└── narrative.js    # INTRO_STORY, FINALE, PHOTO_DIARY_PAIRS, CHECKLIST, STAGE_LOCATIONS
```

`useCityData.js` composable 负责按需加载和缓存。

### 主题系统

CSS 变量驱动的主题换肤，6 套配色：

| 主题 | 色调 | 字体 |
|------|------|------|
| `theme-shanghai` | 暖棕/旧纸 | ZCOOL QingKe HuangYou |
| `theme-nanjing` | 暗红/砖墙 | Ma Shan Zheng |
| `theme-hangzhou` | 青绿/水墨 | LXGW WenKai |
| `theme-xian` | 金黄/丝绸 | Zhi Mang Xing |
| `theme-suzhou` | 靛蓝/园林 | Liu Jian Mao Cao |
| `theme-default` | 暗色/中性 | Noto Serif SC |

主题变量包括：背景色、文字色、强调色、边框色、纸质纹理（radial-gradient 模拟）、阴影。

### 组件结构

| 组件 | 职责 |
|------|------|
| NarrativeText | 逐字打字机效果显示叙事文本 |
| AnswerInput | 答案输入（文本/数字/确认三种模式） |
| HintSystem | 三级渐进提示系统 |
| PhotoCapture | 调用摄像头拍照并存入 IndexedDB |
| BadgeDisplay | 城市徽章展示（含全通关终极徽章） |
| ShareCard | Canvas 生成分享海报图 |

## 道具生成系统

`props/` 目录包含 5 城的 HTML 道具模板（密码转盘、日记页、密电卡片、信封、拓片等），通过 Puppeteer 批量渲染为 A4 PDF，供玩家自行打印。

```bash
node props/generate-pdfs.js          # 生成全部城市道具
node props/generate-pdfs.js shanghai # 生成单城市道具
```

## 部署架构

- **服务器**：阿里云 ECS `47.110.32.207`
- **域名**：`ducheng.nju.top`（HTTPS，Let's Encrypt 自动续期）
- **Web 服务器**：Nginx，SPA fallback（`try_files $uri $uri/ /index.html`）
- **静态资源**：Vite 构建的 hash 文件名，30 天强缓存
- **部署方式**：本地构建 → scp 上传 dist 目录

## 第三方服务与依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.0 | UI 框架 |
| Vue Router | ^4.5.0 | 路由（Hash 模式） |
| Pinia | ^2.3.0 | 状态管理 |
| Vite | ^6.1.0 | 构建工具 |
| Puppeteer | （props 目录） | 道具 PDF 生成 |

无后端依赖，无数据库，无第三方 API 调用。
