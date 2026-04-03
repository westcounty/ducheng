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

- **数据结构**：每个城市有 `puzzles.js`（7 站谜题数据）和 `narrative.js`（叙事、藏头诗、终章）
- **STAGES 数组**：1-indexed，`STAGES[0] = null`，`STAGES[1]`–`STAGES[7]` 为 7 站数据
- **答案占位符**：`__FIELD__` 标记需要实地踩点后填入的答案
- **状态隔离**：每个城市有独立的 Pinia store（`game-${cityId}`）和 localStorage key（`ducheng_${cityId}_state`）
- **主题系统**：CSS 变量换肤，每个城市有独立的 `.theme-${cityId}` 类
- **路由格式**：`/#/city/:cityId/stage/:id`
- **藏头诗机制**：每城 `PHOTO_DIARY_PAIRS` 的 `diaryExcerpt` 字段首字连读组成隐藏信息
- **碎片拼合**：通过 `cardBackNumber` 排序，非获取顺序

## 目录结构要点

```
app/src/
├── data/cities/
│   ├── index.js          # 城市注册表（5 城元数据）
│   ├── useCityData.js    # 按需加载城市数据的 composable
│   ├── cross-city-threads.js  # 跨城暗线数据
│   ├── shanghai/         # puzzles.js + narrative.js
│   ├── nanjing/
│   ├── hangzhou/
│   ├── xian/
│   └── suzhou/
├── pages/
│   ├── PlatformHome.vue  # 城市选择首页
│   ├── Home.vue          # 单城剧本首页
│   ├── Stage.vue         # 解谜关卡页
│   ├── Transit.vue       # 站间过渡页
│   ├── Finale.vue        # 终章（藏头诗→信封→心愿清单+照片）
│   ├── Archive.vue       # 档案室（7 站回顾+跨城暗线）
│   └── CrossCityReveal.vue  # 全通关跨城揭示页
├── stores/
│   ├── game.js           # 单城游戏状态（动态注册，按 cityId 隔离）
│   └── platform.js       # 平台级状态（已通关城市、徽章）
└── styles/theme.css      # 6 套主题变量（5 城 + 默认暗色）
```

## 当前状态与注意事项

- **五城内容骨架已完成**，所有 `puzzles.js` 和 `narrative.js` 数据就位
- **`__FIELD__` 答案**：大量谜题答案需要实地踩点后填入，目前标记为占位符
- **道具 PDF**：HTML 模板已就绪，需安装 Puppeteer 后运行 `npm run props` 生成
- **事实核查已完成两轮**：14 处错误已修正（地址、历史事实、藏头诗一致性等）
- **收费景点**：杭州（岳王庙/净慈寺/雷峰塔 ~75 元）和西安（碑林 85 元）需提前告知玩家
- **微信浏览器兼容性**：尚未测试
- **部分谜题设计依赖不确定的实地元素**（如上海梧桐编号牌、南京秦淮河石栏文字），踩点后可能需要调整
