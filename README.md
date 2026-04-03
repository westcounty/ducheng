# 读城

> 五城实景解谜游戏平台 — 在一座城市里走一条路，解一个人留下的谜。

**线上地址：** https://ducheng.nju.top

## 五个城市剧本

| 城市 | 剧本 | 主角 | 一句话 |
|------|------|------|--------|
| 上海 | 第七封密电 | 间谍·鹤影 | 一个间谍的最后一条路 |
| 南京 | 金陵刻痕 | 验砖吏·陆鸣远 | 一个读了整座城的人 |
| 杭州 | 断桥不断 | 白素贞 | 一条蛇写的人类观察笔记 |
| 西安 | 长安译 | 粟特商人·康安 | 一场迟到一千三百年的晚宴 |
| 苏州 | 姑苏折子 | 旦角·沈云筝 | 她演了一辈子别人的戏，只有苏州记得她自己的台词 |

## 功能特性

- 每城 7 站实景解谜路线，谜题基于真实建筑细节和历史知识
- 每站拍照存档，终章照片与日记对照揭示隐藏信息
- 藏头诗机制 — 7 篇日记首字连读揭示终极密语
- 密电/碎片拼合 — 打乱顺序收集，最终排列读出完整句子
- 实体道具配合 — 密码转盘、拓片、色卡、镜像卡等纸质道具
- 五城主题换肤 — 每个城市独立配色、字体、纸质纹理
- 跨城暗线 — 五个主角在日记中不经意提到彼此的城市，通关全部后解锁
- 分享卡片生成、徽章系统、游戏计时

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.5 + Vite 6 |
| 路由 | Vue Router 4.5（Hash 模式） |
| 状态管理 | Pinia 2.3 + localStorage 持久化 |
| 样式 | 原生 CSS 变量主题系统 |
| 道具生成 | Puppeteer（HTML → PDF） |
| 部署 | 纯静态 H5，Nginx + Let's Encrypt |

## 环境要求

- Node.js 18+
- 道具 PDF 生成需要 Puppeteer（可选）

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev
# 浏览器打开 http://localhost:3000

# 构建生产版本
npm run build
# 产物在 app/dist/

# 生成道具 PDF（可选）
npm run props
```

## 项目结构概览

```
shanghaitrip/
├── app/                    # H5 前端应用
│   ├── src/
│   │   ├── pages/          # 6 个页面（首页/关卡/过渡/终章/档案/跨城揭示）
│   │   ├── components/     # 答案输入、提示系统、叙事文字、拍照、分享卡片等
│   │   ├── data/
│   │   │   └── cities/     # 5 城谜题数据 + 叙事数据（puzzles.js / narrative.js）
│   │   ├── stores/         # Pinia 状态（按城市隔离的游戏进度 + 平台状态）
│   │   ├── styles/         # CSS 主题系统（5 城 + 默认配色）
│   │   └── utils/          # 密码工具、照片存储、数据迁移
│   └── dist/               # 构建产物
├── content/                # 日记原文、信封内容、密电碎片（按城市分目录）
├── props/                  # 道具 HTML 模板 + PDF 生成脚本
├── fieldwork/              # 踩点清单和数据模板
└── docs/                   # 设计文档、评审报告
```

## 部署

部署到阿里云 ECS，域名 `ducheng.nju.top`：

```bash
# 构建
cd app && npx vite build

# 上传（需 SSH 密钥，见 INFRA.md）
scp -i ~/.ssh/photozen_nju_top_ed25519 -o IdentitiesOnly=yes \
  -r dist/* root@47.110.32.207:/var/www/ducheng/
```

服务器配置：Nginx 反向代理 + SPA fallback + Gzip + Let's Encrypt HTTPS。

## 许可证

私有项目，仅供朋友聚会使用。
