# 读城 — AI 协作上下文

## 项目概述

「读城」是五城实景解谜游戏平台（上海/南京/杭州/西安/苏州），Vue 3 H5 应用 + 可打印纸质道具。玩家在真实城市地点观察建筑细节、解密谜题，最终拼合完整密电并揭示藏头诗。

**线上地址：** https://ducheng.nju.top

## 关键命令

```bash
# 安装依赖
npm install

# 本地开发（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 生成道具 PDF
npm run props

# 部署到服务器
scp -i ~/.ssh/photozen_nju_top_ed25519 -o IdentitiesOnly=yes \
  -r app/dist/* root@47.110.32.207:/var/www/ducheng/
```

## 代码规范与约定

- **数据结构**：每个城市有 `puzzles.js`（序章 + 7 站谜题数据）和 `narrative.js`（叙事、藏头诗、终章）
- **PROLOGUE**：可选的序章谜题（在家完成），上海已有，其他城市可选。export 自 `puzzles.js`
- **STAGES 数组**：1-indexed，`STAGES[0] = null`，`STAGES[1]`–`STAGES[7]` 为 7 站数据
- **答案占位符**：`__FIELD__` 标记需要实地踩点后填入的答案
- **状态隔离**：每个城市有独立的 Pinia store（`game-${cityId}`）和 localStorage key（`ducheng_${cityId}_state`）
- **主题系统**：CSS 变量换肤，每个城市有独立的 `.theme-${cityId}` 类
- **路由格式**：`/#/city/:cityId/stage/:id`，序章为 `/#/city/:cityId/prologue`
- **藏头诗机制**：每城 `PHOTO_DIARY_PAIRS` 的 `diaryExcerpt` 字段首字连读组成隐藏信息
- **碎片拼合**：通过 `cardBackNumber` 排序，非获取顺序
- **谜题设计原则（V3）**：不直接告诉玩家观察什么，用隐喻引导推理；日记残页是谜题组件而非装饰

## 目录结构要点

```
app/src/
├── data/cities/
│   ├── index.js          # 城市注册表（6 城元数据）
│   ├── useCityData.js    # 按需加载城市数据的 composable
│   ├── cross-city-threads.js  # 跨城暗线数据
│   ├── shanghai/         # puzzles.js + narrative.js (第七封密电·外滩)
│   ├── shanghai2/        # puzzles.js + narrative.js (墨迹·福州路)
│   ├── nanjing/
│   ├── hangzhou/
│   ├── xian/
│   └── suzhou/
├── pages/
│   ├── PlatformHome.vue  # 城市选择首页
│   ├── Home.vue          # 单城剧本首页
│   ├── Prologue.vue      # 序章解谜页（在家完成，可选）
│   ├── Stage.vue         # 解谜关卡页
│   ├── Transit.vue       # 站间过渡页
│   ├── Finale.vue        # 终章（藏头诗→信封→心愿清单+照片）
│   ├── Archive.vue       # 档案室（7 站回顾+跨城暗线）
│   └── CrossCityReveal.vue  # 全通关跨城揭示页
├── stores/
│   ├── game.js           # 单城游戏状态（动态注册，按 cityId 隔离）
│   └── platform.js       # 平台级状态（已通关城市、徽章）
└── styles/theme.css      # 7 套主题变量（6 城 + 默认暗色）
```

## 当前状态与注意事项

- **上海第一剧本「第七封密电」V3 redesign 已完成**：新增序章（Stage 0）、7站指令全部重写为推理型设计
- **上海第二剧本「墨迹」骨架已完成**：福州路文艺主题，cityId=`shanghai2`，7站+序章数据就位，大量 `__FIELD__` 答案待踩线填入。设计文档：`docs/superpowers/specs/2026-04-06-shanghai-script2-fuzhou-road-design.md`
- **其他四城内容骨架已完成**，`puzzles.js` 和 `narrative.js` 数据就位（未做 V3 改造）
- **`__FIELD__` 答案**：大量谜题答案需要实地踩点后填入，目前标记为占位符
- **道具 PDF**：HTML 模板已就绪，需安装 Puppeteer 后运行 `npm run props` 生成
- **事实核查已完成两轮**：14 处错误已修正（地址、历史事实、藏头诗一致性等）
- **收费景点**：杭州（岳王庙/净慈寺/雷峰塔 ~75 元）和西安（碑林 85 元）需提前告知玩家
- **微信浏览器兼容性**：尚未测试
- **部分谜题设计依赖不确定的实地元素**（如上海梧桐编号牌、南京秦淮河石栏文字），踩点后可能需要调整
- **设计文档**：`docs/puzzle-redesign-v3.md`（设计原则+对比）、`docs/shanghai-fieldwork-playbook.md`（踩线剧本）

## 探索任务系统（开发中）

### 概览

在现有解谜平台基础上新增「探索任务」模块：用户实地完成拍照/抵达/解谜子任务，AI 验证后获得海报+徽章。

- **设计文档**: `docs/superpowers/specs/2026-04-12-exploration-task-system-design.md`
- **后端项目**: `ducheng-api/`（Fastify + Drizzle + PostgreSQL，端口 3100）
- **认证**: 复用 tuchan-api JWT（`https://admin.nju.top/v1/auth/*`），同 nannaricher 模式

### 实施计划（按顺序执行）

| # | 计划文件 | 内容 | 任务数 |
|---|---------|------|--------|
| 1A | `docs/superpowers/plans/2026-04-13-exploration-task-phase1a-backend-core.md` | 后端骨架：Fastify + DB schema + auth + CRUD 路由 | 10 |
| 1B | `docs/superpowers/plans/2026-04-13-exploration-task-phase1b-verification-submission.md` | 验证服务 + 提交处理 + 徽章/海报/用户路由 | 10 |
| 1C | `docs/superpowers/plans/2026-04-13-exploration-task-phase1c-frontend.md` | 前端 5 页面 + 8 组件 + Store + API | 21 |
| 1C-Auth | `docs/superpowers/plans/2026-04-13-exploration-task-phase1c-auth-supplement.md` | 登录页 + Auth Store + Token 刷新 | 7 |
| 1D | `docs/superpowers/plans/2026-04-13-exploration-task-phase1d-poster-seed-deploy.md` | 种子数据 + 海报下载 + 部署 | 5 |

### 执行协议

1. **严格按顺序**: 1A → 1B → 1C → 1C-Auth → 1D
2. **每个 plan 完成后必须 review**: 检查所有文件是否按 plan 创建、代码能否运行、curl 验证是否通过
3. **review 通过后再进入下一个 plan**: 不要跳过
4. **全部完成后整体 review**: 对照 spec 文档检查功能完整性
5. **每个 task 完成后 commit**: 遵循 plan 中的 commit message

### 关键约定

- 后端用 **ESM**（`"type": "module"`），不用 TypeScript
- 前端用 **Vue 3 Composition API**（`<script setup>`），不用 TypeScript
- API 调用用原生 **`fetch`**，不装 axios
- 数据库字段用 **snake_case**（`validation_config`, `radius_meters`, `correct_index`, `answer_variants`）
- 前端提交到后端的字段名: `gpsLat`, `gpsLng`, `answerText`, `selectedIndex`, `photoUrl`
- JWT token 存储 key: `ducheng_access_token`（由 auth store 管理）
- Auth API base: 开发用 Vite proxy `/auth-api`，生产直连 `https://admin.nju.top`
- 照片上传: `POST /api/upload/photo`（multipart），本地存储到 `uploads/`
