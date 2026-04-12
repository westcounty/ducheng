# 读城·探索任务系统 — 设计文档

> 日期: 2026-04-12
> 状态: 设计确认
> 范围: MVP (A+B) + 完整 Roadmap (C+D)

## 1. 概述

在现有读城解谜平台基础上，新增「探索任务」系统，与现有剧本解谜双轨并行。用户通过完成一系列实地任务（拍照、抵达打卡、解谜等）获得 AI 验证，完成整个任务后自动生成纪念海报并获得专属徽章。

### 1.1 核心概念

| 概念 | 说明 |
|------|------|
| **任务 (Task)** | 浏览和选择的基本单位，如「武康路文艺漫步」 |
| **地点 (Location)** | 任务包含的一个或多个实地地点 |
| **子任务 (SubTask)** | 每个地点下的具体行动，类型包括拍照、抵达、解谜、问答 |
| **任务链** | 子任务按顺序串联，前一个完成才解锁下一个，未解锁的不显示内容 |
| **奖励** | 完成整个任务后获得：自动海报 + 专属徽章 |

### 1.2 设计决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 与现有系统关系 | 双轨并行 | 不影响现有解谜剧本，新增独立入口 |
| 照片验证 | AI 自动判断 | 无需人工干预，可扩展 |
| 海报生成 | 自动生成 | 简单高效，降低用户操作成本 |
| 后端方案 | 自有后端（阿里云 ECS） | 与现有基础设施一致 |
| 用户体系 | 复用 PhotoZen tuchan-api JWT | 不造轮子，参考 Nannaricher 集成方式 |
| LLM 服务 | GLM/智谱 | 已在使用，支持多模态 |
| 任务列表 UI | 卡片流 | 视觉冲击力强，适合移动端浏览 |

## 2. 用户流程

```
首页（双轨入口）
├── 📜 剧本解谜（现有，不动）
└── 🧭 探索任务（新）
    ├── 任务列表（卡片流）
    │   ├── 武康路文艺漫步 · 3地点 · 8子任务 · ⏱2h
    │   ├── 豫园寻宝记 · 2地点 · 5子任务 · ⏱1.5h
    │   └── ...
    ├── 任务详情（介绍 + 地点 + 子任务概览）
    │   └── 点击「开始探索」
    ├── 任务执行（逐个子任务串联）
    │   ├── 顶部：任务名 + 进度条
    │   ├── 中间：当前子任务卡片
    │   │   ├── 📸 拍照 → 提交 → AI 验证 → 通过/重拍
    │   │   ├── 🎯 抵达 → GPS 定位 → 在范围内即通过
    │   │   ├── 🧩 解谜 → 输入答案 → 正确即通过
    │   │   └── ❓ 问答 → 输入答案 → 正确即通过
    │   └── 底部：任务链（✓完成 / ▸进行中 / 🔒锁头不显示内容）
    └── 完成奖励
        ├── 🖼️ 自动海报（照片网格 + 标题 + 用时 + 排名 + 徽章）
        └── 🏅 专属徽章（解锁，入收集页）
```

### 2.1 任务链规则

- 已完成：显示具体类型（打卡/拍照/解谜）+ ✓
- 当前：显示「进行中」高亮
- 未解锁：只显示 🔒 锁头，不透露类型和内容

### 2.2 徽章规则

- 每个任务对应一个专属徽章
- 完成即解锁，不可重复获得
- 已解锁：显示图案 + 名称 + 任务名
- 未解锁：显示锁头 + 对应任务名 +「完成任务即可解锁」

### 2.3 海报规则

- 自动从任务的拍照子任务中选取照片
- 拼成 2×2 或 2×3 网格布局
- 叠加：任务标题、用时、完成排名、徽章图标、品牌水印
- 用户可保存到相册或分享

## 3. 数据模型

### 3.1 任务 (tasks)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| slug | VARCHAR(64) | URL 友好标识，如 `wukang-road-walk` |
| title | VARCHAR(128) | 任务名称 |
| description | TEXT | 任务介绍 |
| cover_image | VARCHAR(256) | 封面图 URL |
| estimated_minutes | INT | 预估时长（分钟） |
| difficulty | ENUM | easy / medium / hard |
| badge_name | VARCHAR(64) | 徽章名称，如「武康漫步者」 |
| badge_icon | VARCHAR(16) | 徽章 emoji |
| badge_color | VARCHAR(7) | 徽章主色 #hex |
| location_summary | VARCHAR(256) | 地点概要，如「武康大楼 · 老洋房 · 梧桐路」 |
| city | VARCHAR(32) | 所属城市 |
| status | ENUM | draft / published / archived |
| completion_count | INT | 完成人数（缓存） |
| created_by | UUID | 创建者（MVP 阶段为系统管理员） |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### 3.2 子任务 (sub_tasks)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| task_id | UUID | 所属任务 FK |
| order_index | INT | 顺序，从 1 开始 |
| location_name | VARCHAR(128) | 地点名称 |
| location_address | VARCHAR(256) | 地点地址 |
| location_lat | DECIMAL(10,7) | 纬度 |
| location_lng | DECIMAL(10,7) | 经度 |
| type | ENUM | photo / arrival / puzzle / quiz |
| title | VARCHAR(128) | 子任务标题 |
| instruction | TEXT | 任务说明（给用户看的） |
| validation_config | JSONB | 验证配置（见下方） |
| hints | JSONB | 提示信息数组 [nudge, half, full] |
| created_at | TIMESTAMPTZ | |

**validation_config 按类型：**

```javascript
// photo 类型
{
  type: "photo",
  prompt: "需要拍到武康大楼的尖顶和梧桐树",  // 给 AI 的判定指令
  keywords: ["武康大楼", "梧桐", "尖顶"],       // AI 参考关键词
  accept_threshold: 0.7                         // AI 置信度阈值
}

// arrival 类型
{
  type: "arrival",
  radius_meters: 50,        // 允许的定位偏差（米）
  lat: 31.2064,
  lng: 121.4384
}

// puzzle 类型
{
  type: "puzzle",
  answer: "武康路2100号",    // 精确匹配（不区分大小写）
  answer_variants: ["2100号", "武康路2100"],  // 可接受的变体
  answer_type: "text"       // text / number
}

// quiz 类型
{
  type: "quiz",
  options: ["选项A", "选项B", "选项C", "选项D"],
  correct_index: 2
}
```

### 3.3 任务提交 (task_submissions)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 FK |
| task_id | UUID | 任务 FK |
| sub_task_id | UUID | 子任务 FK |
| status | ENUM | pending / approved / rejected |
| photo_url | VARCHAR(256) | 照片 URL（photo 类型） |
| answer_text | VARCHAR(256) | 用户答案（puzzle/quiz 类型） |
| gps_lat | DECIMAL(10,7) | 提交时 GPS 纬度（arrival 类型） |
| gps_lng | DECIMAL(10,7) | 提交时 GPS 经度 |
| ai_result | JSONB | AI 判定结果 |
| ai_confidence | DECIMAL(3,2) | AI 置信度 |
| submitted_at | TIMESTAMPTZ | |
| verified_at | TIMESTAMPTZ | |

### 3.4 任务进度 (task_progress)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 FK |
| task_id | UUID | 任务 FK |
| current_sub_task_index | INT | 当前子任务序号（0=未开始） |
| status | ENUM | not_started / in_progress / completed |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| completion_rank | INT | 完成排名（第几个完成的） |

### 3.5 徽章 (user_badges)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 FK |
| task_id | UUID | 任务 FK |
| unlocked_at | TIMESTAMPTZ | 解锁时间 |

### 3.6 海报 (user_posters)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 FK |
| task_id | UUID | 任务 FK |
| image_url | VARCHAR(256) | 生成的海报图片 URL |
| photos | JSONB | 使用的照片 URL 数组 |
| created_at | TIMESTAMPTZ | |

## 4. API 设计

### 4.1 基础

- 基础 URL: `https://ducheng-api.nju.top/api`
- 认证: Bearer Token（PhotoZen JWT，与 Nannaricher 集成方式一致）
- 格式: JSON

### 4.2 端点

#### 任务浏览

```
GET    /tasks                    # 任务列表（分页，支持城市筛选）
GET    /tasks/:slug              # 任务详情（含子任务概览，不含未解锁内容）
```

#### 任务执行

```
POST   /tasks/:slug/start        # 开始任务（创建 task_progress）
GET    /tasks/:slug/progress     # 获取当前进度（仅返回当前子任务详情）
POST   /tasks/:slug/submit       # 提交子任务（照片/答案/GPS）
```

#### 奖励

```
GET    /tasks/:slug/poster       # 获取/生成任务海报
GET    /badges                   # 用户所有徽章状态
```

#### 用户

```
GET    /me                       # 当前用户信息（JWT 验证，复用 tuchan-api）
GET    /me/stats                 # 用户统计（完成任务数、照片数等）
GET    /me/history               # 历史任务记录
```

#### 照片上传

```
POST   /upload/photo             # 上传照片 → 返回 URL（存阿里云 OSS 或本地）
```

### 4.3 AI 验证接口（内部）

```
POST   /internal/verify-photo    # GLM 调用，判定照片是否符合要求
```

## 5. 后端架构

### 5.1 技术栈

| 层 | 选择 | 理由 |
|----|------|------|
| 运行时 | Node.js | 与 Nannaricher 一致，前端团队可维护 |
| 框架 | Fastify | 比 Express 快，TypeScript 支持好 |
| 数据库 | PostgreSQL | 复用现有 RDS 实例，新建 `ducheng` schema |
| ORM | Drizzle ORM | 轻量，TypeScript-first |
| 存储 | 本地文件系统（ECS）或阿里云 OSS | MVP 先本地，后续迁移 OSS |
| LLM | 智谱 GLM-4V API | 多模态照片理解 |
| 部署 | PM2 | 与现有项目一致 |

### 5.2 服务结构

```
ducheng-api/                    # 新后端项目
├── src/
│   ├── routes/                 # API 路由
│   │   ├── tasks.js
│   │   ├── submissions.js
│   │   ├── badges.js
│   │   ├── posters.js
│   │   └── me.js
│   ├── services/               # 业务逻辑
│   │   ├── task-service.js
│   │   ├── verification/
│   │   │   ├── photo-verifier.js    # GLM 照片验证
│   │   │   ├── arrival-verifier.js  # GPS 距离计算
│   │   │   └── puzzle-verifier.js   # 答案匹配
│   │   ├── poster-generator.js      # 海报生成
│   │   └── badge-service.js
│   ├── db/                     # 数据库
│   │   ├── schema.js           # Drizzle schema
│   │   └── migrations/
│   ├── middleware/
│   │   └── auth.js             # JWT 验证（共享 tuchan-api secret）
│   └── config.js
├── ecosystem.config.cjs        # PM2 配置
├── package.json
└── .env
```

### 5.3 数据库部署

在现有 PostgreSQL RDS 上新建 schema：

```sql
CREATE SCHEMA ducheng;
-- 所有读城任务系统的表放在 ducheng schema 下
-- 复用 tuchan_prod 数据库的 app.users 表做用户关联
```

### 5.4 JWT 认证集成

与 Nannaricher 模式一致：

```javascript
// auth middleware
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.TUCHAN_JWT_SECRET; // 共享密钥

function authMiddleware(request, reply) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) return reply.code(401).send({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, Buffer.from(JWT_SECRET, 'base64'));
    request.userId = payload.sub; // userId from tuchan-api
  } catch {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
```

## 6. AI 照片验证

### 6.1 流程

```
用户拍照 → 上传到服务器 → 调用 GLM-4V API → 返回判定结果
                                    ↓
                         Prompt: "判断这张照片是否符合以下要求：
                                  {sub_task.validation_config.prompt}
                                  关键元素：{keywords}
                                  返回 JSON: { pass: boolean, confidence: number, reason: string }"
```

### 6.2 判定逻辑

```javascript
async function verifyPhoto(imageUrl, validationConfig) {
  const response = await glm4v.chat({
    model: "glm-4v-plus",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: buildPrompt(validationConfig) },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);
  return {
    passed: result.pass && result.confidence >= validationConfig.accept_threshold,
    confidence: result.confidence,
    reason: result.reason
  };
}
```

### 6.3 容错策略

- AI 判定置信度 >= 阈值 → 通过
- AI 判定置信度 < 阈值但 > 0.5 → 提示「不确定，建议重拍」但允许通过（避免误杀）
- AI 服务不可用 → 允许通过（降级策略，不阻塞用户）
- 用户连续 3 次未通过 → 提供「跳过」选项（降低挫败感）

## 7. 海报生成

### 7.1 技术方案

使用服务端 HTML-to-Image 方案（Puppeteer 或 @vercel/og）：

1. 从 task_submissions 中收集所有 photo 类型的已通过照片
2. 选取前 4-6 张（按子任务顺序）
3. 渲染 HTML 模板（照片网格 + 任务信息 + 徽章 + 品牌）
4. 截图保存为 PNG

### 7.2 模板设计

```
┌─────────────────────────┐
│    读 城 · 探 索         │
├───────┬───────┬─────────┤
│ 照片1 │ 照片2 │         │
├───────┼───────┤  徽章   │
│ 照片3 │ 照片4 │         │
├───────┴───────┴─────────┤
│   任务标题               │
│   3个地点 · 8个子任务     │
│   用时 2h | 排名 #42     │
│   ducheng.nju.top        │
└─────────────────────────┘
```

## 8. 前端架构

### 8.1 新增页面

| 页面 | 路由 | 说明 |
|------|------|------|
| TaskList.vue | /#/explore | 任务列表（卡片流） |
| TaskDetail.vue | /#/explore/:slug | 任务详情 |
| TaskPlay.vue | /#/explore/:slug/play | 任务执行（子任务串联） |
| BadgeCollection.vue | /#/badges | 徽章收集页 |
| PosterView.vue | /#/explore/:slug/poster | 海报展示页 |

### 8.2 新增组件

| 组件 | 说明 |
|------|------|
| TaskCard.vue | 任务卡片（列表用） |
| SubTaskProgress.vue | 子任务链进度条 |
| PhotoSubmit.vue | 拍照上传 + AI 验证反馈 |
| ArrivalCheck.vue | GPS 抵达验证 |
| PuzzleInput.vue | 解谜/问答输入 |
| BadgeCard.vue | 徽章卡片（已解锁/锁定） |
| PosterPreview.vue | 海报预览 |

### 8.3 与现有系统集成

- PlatformHome.vue 新增「探索任务」入口（与「剧本解谜」并列）
- 新增 Pinia store: `stores/explore.js`（任务系统状态）
- 新增 API 服务: `services/explore-api.js`（与后端通信）
- 复用现有主题系统和 CSS 变量
- 复用 PhotoCapture 组件的拍照逻辑（改造为支持上传）

### 8.4 用户认证流程

```
用户点击「探索任务」入口
  → 检查是否有有效 JWT（localStorage）
  → 有 → 直接进入任务列表
  → 无 → 跳转登录页（调用 tuchan-api 的登录接口）
  → 登录成功 → 保存 JWT → 进入任务列表
```

登录页复用简洁设计，支持：
- 手机号 + 验证码（复用 tuchan-api）
- 用户名 + 密码（复用 tuchan-api）

## 9. MVP 范围（Phase 1: A+B）

### 9.1 必做

- [ ] 后端服务搭建（Fastify + PostgreSQL + PM2）
- [ ] 任务数据模型 + API
- [ ] JWT 认证集成
- [ ] 任务列表页（卡片流）
- [ ] 任务详情页
- [ ] 任务执行页（子任务串联）
- [ ] 拍照子任务 + GLM AI 验证
- [ ] 抵达子任务 + GPS 验证
- [ ] 解谜/问答子任务 + 答案验证
- [ ] 完成奖励：自动海报生成
- [ ] 完成奖励：徽章解锁
- [ ] 徽章收集页
- [ ] PlatformHome 双轨入口

### 9.2 初始内容

MVP 上线时包含 3-5 个预设任务（上海地区），由系统管理员创建：
1. 武康路文艺漫步
2. 豫园寻宝记
3. 外滩光影猎人
4. 静安寺周边探秘
5. 法租界咖啡路线

## 10. Roadmap

### Phase 1: A+B — 任务系统 + 奖励（MVP，本次实施）

**目标**: 用户可以浏览任务、实地完成子任务（AI 验证）、获得海报和徽章。

**核心交付**:
- 后端 API 服务
- 前端探索任务模块（双轨入口）
- AI 照片验证（GLM）
- 海报自动生成
- 徽章系统
- 3-5 个上海预设任务

### Phase 2: C — UGC 共创（后续）

**目标**: 让用户可以创建和发布自己的任务路线，解锁每个地方的小众玩法。

**新增功能**:
- 任务创建器（Web 表单/向导）
  - 设置任务标题、封面、描述
  - 添加地点（地图选点 + 名称）
  - 添加子任务（拍照提示词 / GPS 坐标 / 谜题答案）
  - 设置徽章（名称 + emoji + 颜色）
- 任务审核流程（AI 预审 + 管理员终审）
- 任务搜索和筛选（按城市、难度、标签）
- 创建者仪表盘（任务数据、完成人数、反馈）
- 创建者之间可以互相借鉴任务设计

**新增数据模型**:
- task_reviews（审核记录）
- task_tags（标签分类）
- task_comments（用户评论/反馈）
- creator_profiles（创建者资料）

**新增页面**:
- TaskCreator.vue（任务创建向导）
- TaskReview.vue（管理员审核）
- CreatorDashboard.vue（创建者仪表盘）

### Phase 3: D — 社交激励（后续）

**目标**: 创建人提供实体/虚拟奖励，连接人与人、人与场景。

**新增功能**:
- 奖励池系统
  - 创建人设置奖励：实体明信片、小礼物、折扣券、虚拟称号
  - 用户完成任务后自动获得奖励
  - 实体奖励需要收集邮寄地址
- 奖励领取中心
  - 查看所有获得的奖励
  - 实体奖励的物流跟踪
  - 虚拟奖励的展示和应用
- 社交元素
  - 任务排行榜（最快完成、最少重拍）
  - 用户动态（完成的任务、获得的徽章）
  - 任务评论和评分
  - 好友系统（查看朋友在做的任务）
- 货币/积分系统（可选）
  - 完成任务获得积分
  - 积分兑换创建人提供的奖励
  - 创建人通过积分激励获取流量

**新增数据模型**:
- rewards（奖励定义）
- reward_claims（奖励领取记录）
- leaderboard_entries（排行榜）
- user_activities（用户动态）
- user_follows（好友关系）
- points_ledger（积分流水）

### Phase 4: 平台扩展（远期）

- 多城市扩展（南京、杭州、西安、苏州的探索任务）
- 与现有解谜剧本联动（完成解谜剧本可解锁特殊探索任务）
- 企业/品牌合作（品牌赞助任务、定制路线）
- 离线模式（缓存任务数据，弱网环境可用）
- AR 元素（通过摄像头叠加虚拟线索）
- 数据分析（热门地点、任务完成率热力图）

## 11. 部署计划

### 11.1 域名与路由

| 服务 | URL | 说明 |
|------|-----|------|
| 前端 H5 | ducheng.nju.top | Nginx 静态文件 |
| 后端 API | ducheng-api.nju.top | Nginx 反向代理到 Fastify |
| 认证 | api.nju.top/v1/auth/* | 复用 tuchan-api |

### 11.2 Nginx 配置

```nginx
# ducheng-api.nju.top
server {
    listen 443 ssl;
    server_name ducheng-api.nju.top;

    location / {
        proxy_pass http://127.0.0.1:3100;  # Fastify port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 照片上传大小限制
    client_max_body_size 10m;
}

# ducheng.nju.top - 新增 API 代理
server {
    listen 443 ssl;
    server_name ducheng.nju.top;

    # 现有静态文件
    location / {
        root /var/www/ducheng;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3100;
    }
}
```

### 11.3 PM2 配置

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'ducheng-api',
    script: 'src/index.js',
    cwd: '/var/www/ducheng-api',
    env: {
      NODE_ENV: 'production',
      PORT: 3100,
      DATABASE_URL: 'postgresql://...',
      TUCHAN_JWT_SECRET: '...',
      GLM_API_KEY: '...'
    }
  }]
}
```
