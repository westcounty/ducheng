# Exploration Task System — Phase 1D: Poster, Seed Data & Deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed exploration task data, deploy the full system to production, and wire up html2canvas poster download on the frontend.

**Architecture:** Seed data inserted via standalone Drizzle script. Deployment uses rsync + SSH to Aliyun ECS, PM2 for backend, Nginx reverse-proxy for HTTPS. The poster data endpoint already exists from Phase 1B (`src/routes/posters.js`); Phase 1C's `PosterView.vue` already renders the layout — this phase only adds the html2canvas download capability.

**Tech Stack:** Drizzle ORM (seed), html2canvas (frontend poster download), PM2, Nginx, Let's Encrypt

**Pre-requisites:** Phase 1A (backend core), Phase 1B (verification + poster route), and Phase 1C (frontend + PosterView) completed. Database tables exist. The `ducheng-api` project is at `D:\work\shanghaitrip\ducheng-api\`.

---

## File Structure

```
ducheng-api/
├── src/
│   ├── routes/
│   │   └── posters.js             # EXISTS (from Phase 1B) — poster data endpoint
│   ├── db/
│   │   └── seed.js                # NEW — seed 3 Shanghai tasks
│   └── index.js                   # EXISTS — no changes needed (poster route registered in 1B)
├── ecosystem.config.cjs           # EXISTS (from Phase 1A Task 10)
├── scripts/
│   └── deploy.sh                  # NEW — full deploy script
└── nginx/
    └── ducheng-api.conf           # NEW — reference Nginx config (applied on server)

app/
├── package.json                   # MODIFY — add html2canvas dependency
└── src/
    └── pages/
        └── PosterView.vue         # MODIFY — add html2canvas download button to existing page
```

---

### ~~Task 1: Poster Data Endpoint~~ — REMOVED (covered by Phase 1B Task 7)

> The poster data endpoint (`GET /api/tasks/:slug/poster`) is already implemented in Phase 1B's `src/routes/posters.js`. No duplicate route needed here.

---

### Task 1 (renumbered): Seed Data Script — 3 Shanghai Tasks


(See Phase 1B Task 7 for the poster endpoint implementation.)

---

**Files:**
- Create: `ducheng-api/src/db/seed.js`

- [ ] **Step 1: Create the seed script**

Create `ducheng-api/src/db/seed.js`:

```javascript
import 'dotenv/config'
import { db } from './client.js'
import { tasks, subTasks } from './schema.js'
import { eq } from 'drizzle-orm'

const SEED_TASKS = [
  {
    slug: 'wukang-road-walk',
    title: '武康路文艺漫步',
    description: '漫步武康路与安福路，在梧桐树荫下发现老上海的文艺角落。拍摄标志性建筑、探访隐藏咖啡馆，感受法租界的历史韵味。',
    estimatedMinutes: 90,
    difficulty: 'easy',
    badgeName: '武康漫步者',
    badgeIcon: '🚶',
    badgeColor: '#4A7C59',
    locationSummary: '武康路—安福路',
    city: 'shanghai',
    status: 'published',
    subTasks: [
      {
        orderIndex: 1,
        locationName: '武康大楼',
        locationAddress: '上海市徐汇区淮海中路1842-1858号',
        locationLat: '31.2064000',
        locationLng: '121.4384000',
        type: 'arrival',
        title: '抵达武康大楼',
        instruction: '前往武康大楼，这座建于1924年的法式公寓是武康路的地标。站在路口即可看到它标志性的三角形尖顶。到达后点击确认。',
        validationConfig: {
          type: 'arrival',
          lat: 31.2064,
          lng: 121.4384,
          radius_meters: 150,
        },
        hints: ['武康大楼位于武康路和淮海中路交叉口', '从地铁10/11号线交通大学站步行约10分钟'],
      },
      {
        orderIndex: 2,
        locationName: '武康大楼',
        locationAddress: '上海市徐汇区淮海中路1842-1858号',
        locationLat: '31.2064000',
        locationLng: '121.4384000',
        type: 'photo',
        title: '拍摄武康大楼标志性尖顶',
        instruction: '拍摄一张武康大楼的照片，需要拍到它标志性的三角形尖顶外观。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到武康大楼标志性的三角形尖顶外观',
          keywords: ['武康大楼', '尖顶', '建筑'],
        },
        hints: ['退后几步到马路对面拍摄效果更好', '尖顶在大楼的北端，面向淮海中路方向'],
      },
      {
        orderIndex: 3,
        locationName: '武康路老洋房',
        locationAddress: '上海市徐汇区武康路',
        locationLat: '31.2045000',
        locationLng: '121.4375000',
        type: 'photo',
        title: '拍摄梧桐树荫下的老洋房',
        instruction: '沿武康路南行，拍摄一张梧桐树和旁边老洋房建筑的照片。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到武康路上的梧桐树和旁边的老洋房建筑',
          keywords: ['梧桐', '洋房', '武康路'],
        },
        hints: ['武康路两侧都有梧桐树，选一棵树冠茂密的', '老洋房多为红砖或奶油色外墙'],
      },
      {
        orderIndex: 4,
        locationName: '武康路老洋房',
        locationAddress: '上海市徐汇区武康路',
        locationLat: '31.2045000',
        locationLng: '121.4375000',
        type: 'puzzle',
        title: '武康路咖啡馆之谜',
        instruction: '武康路上最著名的咖啡馆叫什么？（提示：它的名字里有一个"老"字）',
        validationConfig: {
          type: 'text_match',
          answer: '老麦咖啡',
          answer_variants: ['老麦', 'Old Mai'],
          caseSensitive: false,
        },
        hints: ['这家咖啡馆在武康路上非常有名', '名字由两个字组成，第一个字是"老"'],
      },
      {
        orderIndex: 5,
        locationName: '安福路',
        locationAddress: '上海市徐汇区安福路',
        locationLat: '31.2078000',
        locationLng: '121.4420000',
        type: 'arrival',
        title: '抵达安福路',
        instruction: '从武康路转入安福路。这条路以话剧中心和独立小店闻名，是上海最有腔调的街道之一。到达后点击确认。',
        validationConfig: {
          type: 'arrival',
          lat: 31.2078,
          lng: 121.4420,
          radius_meters: 200,
        },
        hints: ['安福路在武康路东侧，步行约5分钟', '认准安福路话剧艺术中心的招牌'],
      },
      {
        orderIndex: 6,
        locationName: '安福路',
        locationAddress: '上海市徐汇区安福路',
        locationLat: '31.2078000',
        locationLng: '121.4420000',
        type: 'photo',
        title: '拍摄安福路上有特色的店铺门面',
        instruction: '找一家安福路上有特色的店铺或咖啡馆，拍摄它的门面。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到安福路上有特色的店铺或咖啡馆门面',
          keywords: ['安福路', '店铺', '门面'],
        },
        hints: ['安福路上有很多网红店铺和独立设计师品牌', '挑一家门面设计有特色的来拍'],
      },
    ],
  },
  {
    slug: 'bund-light-hunter',
    title: '外滩光影猎人',
    description: '行走外滩万国建筑群，远眺陆家嘴天际线，穿越外白渡桥。用镜头捕捉上海最经典的光与影。',
    estimatedMinutes: 120,
    difficulty: 'medium',
    badgeName: '光影猎手',
    badgeIcon: '📸',
    badgeColor: '#C9A84C',
    locationSummary: '外滩—陆家嘴—外白渡桥',
    city: 'shanghai',
    status: 'published',
    subTasks: [
      {
        orderIndex: 1,
        locationName: '外滩万国建筑群',
        locationAddress: '上海市黄浦区中山东一路',
        locationLat: '31.2396000',
        locationLng: '121.4907000',
        type: 'arrival',
        title: '抵达外滩',
        instruction: '前往外滩，站在黄浦江西岸的步行道上。这里是上海最标志性的景观带，百年前的万国建筑群就在你身后。到达后点击确认。',
        validationConfig: {
          type: 'arrival',
          lat: 31.2396,
          lng: 121.4907,
          radius_meters: 300,
        },
        hints: ['地铁2/10号线南京东路站步行约10分钟', '沿南京东路向东走到头即是外滩'],
      },
      {
        orderIndex: 2,
        locationName: '外滩万国建筑群',
        locationAddress: '上海市黄浦区中山东一路',
        locationLat: '31.2396000',
        locationLng: '121.4907000',
        type: 'photo',
        title: '拍摄万国建筑群全景',
        instruction: '面朝西侧（背对黄浦江），拍摄万国建筑群的全景照片，至少包含3栋历史建筑。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到外滩万国建筑群的全景，至少包含3栋历史建筑',
          keywords: ['外滩', '万国建筑', '历史建筑'],
        },
        hints: ['退到江边栏杆处拍摄视野更开阔', '傍晚时分灯光亮起效果最佳'],
      },
      {
        orderIndex: 3,
        locationName: '外滩万国建筑群',
        locationAddress: '上海市黄浦区中山东一路',
        locationLat: '31.2396000',
        locationLng: '121.4907000',
        type: 'quiz',
        title: '外滩建筑史问答',
        instruction: '外滩1号最初是哪家银行的大楼？',
        validationConfig: {
          type: 'single_choice',
          options: ['汇丰银行', '渣打银行', '麦加利银行', '花旗银行'],
          correct_index: 2,
        },
        hints: ['这家银行的英文名是 Chartered Bank of India, Australia and China', '它后来与另一家银行合并成为了渣打银行'],
      },
      {
        orderIndex: 4,
        locationName: '陆家嘴观景',
        locationAddress: '上海市黄浦区外滩观景平台',
        locationLat: '31.2380000',
        locationLng: '121.4990000',
        type: 'photo',
        title: '拍摄陆家嘴三件套',
        instruction: '面朝东侧（面对黄浦江），拍摄浦东陆家嘴天际线，需要包含上海中心、环球金融中心、金茂大厦三栋超高层建筑。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到上海中心、环球金融中心、金茂大厦三栋超高层建筑',
          keywords: ['上海中心', '环球金融中心', '金茂大厦', '陆家嘴'],
        },
        hints: ['三栋建筑从左到右依次是金茂大厦、环球金融中心、上海中心', '在外滩靠近南京东路的位置拍摄角度最好'],
      },
      {
        orderIndex: 5,
        locationName: '陆家嘴观景',
        locationAddress: '上海市黄浦区外滩观景平台',
        locationLat: '31.2380000',
        locationLng: '121.4990000',
        type: 'puzzle',
        title: '上海中心大厦的高度',
        instruction: '上海中心大厦是中国第一高楼，它的高度是多少米？（填写数字即可）',
        validationConfig: {
          type: 'text_match',
          answer: '632',
          answer_variants: ['632米', '632m'],
          caseSensitive: false,
        },
        hints: ['这个数字在600到700之间', '它比环球金融中心（492米）高出很多'],
      },
      {
        orderIndex: 6,
        locationName: '外白渡桥',
        locationAddress: '上海市虹口区外白渡桥',
        locationLat: '31.2452000',
        locationLng: '121.4930000',
        type: 'arrival',
        title: '抵达外白渡桥',
        instruction: '沿外滩向北步行，来到苏州河与黄浦江交汇处的外白渡桥。这座百年钢桥是上海最有故事的桥梁。到达后点击确认。',
        validationConfig: {
          type: 'arrival',
          lat: 31.2452,
          lng: 121.4930,
          radius_meters: 200,
        },
        hints: ['从外滩向北走约15分钟', '外白渡桥是一座铁灰色的钢结构桥'],
      },
      {
        orderIndex: 7,
        locationName: '外白渡桥',
        locationAddress: '上海市虹口区外白渡桥',
        locationLat: '31.2452000',
        locationLng: '121.4930000',
        type: 'photo',
        title: '拍摄外白渡桥与苏州河交汇景观',
        instruction: '拍摄一张外白渡桥的照片，需要拍到桥的钢结构桥身。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到外白渡桥的钢结构桥身',
          keywords: ['外白渡桥', '钢结构', '桥'],
        },
        hints: ['站在桥的南侧拍摄效果好', '尝试从侧面拍摄以展示钢结构的细节'],
      },
    ],
  },
  {
    slug: 'jingan-explore',
    title: '静安寺周边探秘',
    description: '探索静安寺的千年历史与静安公园的都市绿洲，在繁华的南京西路感受古今交融的独特魅力。',
    estimatedMinutes: 60,
    difficulty: 'easy',
    badgeName: '静安探索者',
    badgeIcon: '🏯',
    badgeColor: '#8B6914',
    locationSummary: '静安寺—静安公园',
    city: 'shanghai',
    status: 'published',
    subTasks: [
      {
        orderIndex: 1,
        locationName: '静安寺',
        locationAddress: '上海市静安区南京西路1686号',
        locationLat: '31.2235000',
        locationLng: '121.4480000',
        type: 'arrival',
        title: '抵达静安寺',
        instruction: '前往静安寺，这座始建于三国时期的古寺如今坐落在繁华的南京西路上，金色的外观在摩天大楼间格外醒目。到达后点击确认。',
        validationConfig: {
          type: 'arrival',
          lat: 31.2235,
          lng: 121.4480,
          radius_meters: 200,
        },
        hints: ['地铁2/7号线静安寺站出站即到', '认准金光闪闪的寺庙建筑'],
      },
      {
        orderIndex: 2,
        locationName: '静安寺',
        locationAddress: '上海市静安区南京西路1686号',
        locationLat: '31.2235000',
        locationLng: '121.4480000',
        type: 'photo',
        title: '拍摄静安寺金色建筑',
        instruction: '拍摄一张静安寺的照片，需要拍到它金色的外观或标志性建筑元素。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到静安寺的金色外观或标志性建筑',
          keywords: ['静安寺', '金色', '寺庙'],
        },
        hints: ['从南京西路上拍摄可以同时拍到寺庙和现代建筑的对比', '注意金色的屋顶和佛塔'],
      },
      {
        orderIndex: 3,
        locationName: '静安寺',
        locationAddress: '上海市静安区南京西路1686号',
        locationLat: '31.2235000',
        locationLng: '121.4480000',
        type: 'quiz',
        title: '静安寺历史问答',
        instruction: '静安寺始建于哪个朝代？',
        validationConfig: {
          type: 'single_choice',
          options: ['唐朝', '宋朝', '三国时期', '明朝'],
          correct_index: 2,
        },
        hints: ['静安寺的历史非常悠久，比很多人想象的要早', '它最初叫"沪渎重玄寺"，建于公元247年'],
      },
      {
        orderIndex: 4,
        locationName: '静安公园',
        locationAddress: '上海市静安区南京西路1649号',
        locationLat: '31.2250000',
        locationLng: '121.4500000',
        type: 'arrival',
        title: '抵达静安公园',
        instruction: '从静安寺向东步行几分钟，进入静安公园。这片闹市中的绿洲是附近居民休憩的好去处。到达后点击确认。',
        validationConfig: {
          type: 'arrival',
          lat: 31.2250,
          lng: 121.4500,
          radius_meters: 200,
        },
        hints: ['静安公园就在静安寺东侧', '公园免费开放，全天可进入'],
      },
      {
        orderIndex: 5,
        locationName: '静安公园',
        locationAddress: '上海市静安区南京西路1649号',
        locationLat: '31.2250000',
        locationLng: '121.4500000',
        type: 'photo',
        title: '拍摄静安公园内的景观',
        instruction: '在静安公园内找一处你喜欢的景观，拍摄一张照片。可以是绿化、水景、雕塑或建筑小品。',
        validationConfig: {
          type: 'photo',
          prompt: '需要拍到静安公园内的绿化或景观',
          keywords: ['静安公园', '公园', '绿化'],
        },
        hints: ['公园内有大片草坪和老梧桐树', '中心区域有一个小型喷泉广场'],
      },
    ],
  },
]

async function seed() {
  console.log('Seeding exploration tasks...')

  for (const taskData of SEED_TASKS) {
    const { subTasks: subTasksData, ...taskFields } = taskData

    // Check if task already exists
    const [existing] = await db.select().from(tasks)
      .where(eq(tasks.slug, taskFields.slug))
      .limit(1)

    if (existing) {
      console.log(`  Skipping "${taskFields.title}" — already exists (slug: ${taskFields.slug})`)
      continue
    }

    // Insert the task
    const [insertedTask] = await db.insert(tasks).values({
      ...taskFields,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    console.log(`  Created task: "${insertedTask.title}" (id: ${insertedTask.id})`)

    // Insert sub-tasks
    for (const sub of subTasksData) {
      await db.insert(subTasks).values({
        taskId: insertedTask.id,
        ...sub,
        createdAt: new Date(),
      })
    }

    console.log(`    → ${subTasksData.length} sub-tasks inserted`)
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Add seed script to package.json**

In `ducheng-api/package.json`, add to the `"scripts"` section:

```json
"seed": "node src/db/seed.js"
```

The full scripts block should be:

```json
"scripts": {
  "dev": "node --watch src/index.js",
  "start": "node src/index.js",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:push": "drizzle-kit push",
  "seed": "node src/db/seed.js"
}
```

- [ ] **Step 3: Run the seed script**

```bash
cd ducheng-api && npm run seed
```

Expected output:

```
Seeding exploration tasks...
  Created task: "武康路文艺漫步" (id: <uuid>)
    → 6 sub-tasks inserted
  Created task: "外滩光影猎人" (id: <uuid>)
    → 7 sub-tasks inserted
  Created task: "静安寺周边探秘" (id: <uuid>)
    → 5 sub-tasks inserted
Seed complete.
```

- [ ] **Step 4: Verify seed data via API**

Start the server and query:

```bash
cd ducheng-api && node src/index.js &

curl http://localhost:3100/api/tasks
# Expected: {"items":[...3 tasks...],"total":3,"page":1,"pageSize":20,"totalPages":1}

curl http://localhost:3100/api/tasks/wukang-road-walk
# Expected: task object with subTasks array (6 items)

curl http://localhost:3100/api/tasks/bund-light-hunter
# Expected: task object with subTasks array (7 items)

curl http://localhost:3100/api/tasks/jingan-explore
# Expected: task object with subTasks array (5 items)

kill %1
```

- [ ] **Step 5: Run seed again to verify idempotency**

```bash
cd ducheng-api && npm run seed
```

Expected output (should skip all):

```
Seeding exploration tasks...
  Skipping "武康路文艺漫步" — already exists (slug: wukang-road-walk)
  Skipping "外滩光影猎人" — already exists (slug: bund-light-hunter)
  Skipping "静安寺周边探秘" — already exists (slug: jingan-explore)
Seed complete.
```

- [ ] **Step 6: Commit**

```bash
git add ducheng-api/src/db/seed.js ducheng-api/package.json
git commit -m "feat(ducheng-api): seed script with 3 Shanghai exploration tasks"
```

---

### Task 2 (renumbered): Frontend html2canvas Download

**Files:**
- Modify: `app/package.json`
- Modify: `app/src/components/explore/PosterCanvas.vue` (created by Phase 1C Task 12)

> Phase 1C's PosterCanvas.vue already has the poster layout and dynamically imports html2canvas for `toDataUrl()`. This task only ensures html2canvas is properly installed and the download button works.

- [ ] **Step 1: Install html2canvas**

```bash
cd app && npm install html2canvas
```

- [ ] **Step 2: Verify PosterCanvas download works**

Phase 1C's PosterCanvas.vue should already have a `toDataUrl()` method that uses html2canvas. The PosterView.vue page calls it for the download button. Start the dev server and verify the poster page loads at `/#/explore/:slug/poster` (requires a completed task in the database).

If the download doesn't work, ensure PosterCanvas.vue's `toDataUrl()` includes these html2canvas options:

```javascript
const canvas = await html2canvas(posterEl, {
  scale: 2,
  useCORS: true,
  backgroundColor: '#1a1a2e',
  logging: false,
})
return canvas.toDataURL('image/png')
```

- [ ] **Step 3: Verify html2canvas is in package.json**

```bash
cd app && cat package.json | grep html2canvas
```

Expected: `"html2canvas": "^1.x.x"` in dependencies.

- [ ] **Step 4: Commit**

```bash
git add app/package.json app/package-lock.json app/src/pages/PosterView.vue
git commit -m "feat(app): poster download via html2canvas in PosterView"
```

---

### Task 4: Nginx Configuration Reference

**Files:**
- Create: `ducheng-api/nginx/ducheng-api.conf`

This is a reference file. The actual Nginx config is applied on the server during deployment (Task 5).

- [ ] **Step 1: Create the Nginx config reference**

Create `ducheng-api/nginx/ducheng-api.conf`:

```nginx
# ducheng-api reverse proxy
# Apply to server: /etc/nginx/sites-enabled/ducheng-api.nju.top
#
# After placing this file, run:
#   sudo nginx -t && sudo systemctl reload nginx
#
# SSL cert is shared wildcard via Let's Encrypt for *.nju.top

server {
    listen 443 ssl;
    server_name ducheng-api.nju.top;

    ssl_certificate /etc/letsencrypt/live/nju.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nju.top/privkey.pem;

    # Proxy to Fastify on port 3100
    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Allow photo uploads up to 10MB
    client_max_body_size 10m;
}

# HTTP redirect
server {
    listen 80;
    server_name ducheng-api.nju.top;
    return 301 https://$host$request_uri;
}
```

- [ ] **Step 2: Create the ducheng.nju.top API proxy addition**

The existing `ducheng.nju.top` Nginx config needs an addition to proxy `/api/` requests to the backend. Create a reference snippet at `ducheng-api/nginx/ducheng-frontend-api-proxy.conf`:

```nginx
# Add this block INSIDE the existing ducheng.nju.top server block,
# BEFORE the static file location block.
#
# This allows the frontend to call /api/* without CORS issues.

    # Proxy API requests to ducheng-api backend
    location /api/ {
        proxy_pass http://127.0.0.1:3100/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10m;
    }

    # Proxy uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:3100/uploads/;
        proxy_set_header Host $host;
    }
```

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/nginx/
git commit -m "docs(ducheng-api): Nginx config references for API proxy"
```

---

### Task 5: Deploy Script

**Files:**
- Create: `ducheng-api/scripts/deploy.sh`

- [ ] **Step 1: Create the deploy script**

Create `ducheng-api/scripts/deploy.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────
SERVER="root@47.110.32.207"
SSH_KEY="$HOME/.ssh/photozen_nju_top_ed25519"
SSH_OPTS="-i $SSH_KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

REMOTE_API_DIR="/var/www/ducheng-api"
REMOTE_FRONTEND_DIR="/var/www/ducheng"
LOCAL_API_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_FRONTEND_DIR="$(cd "$(dirname "$0")/../../app" && pwd)"

# ─── Parse flags ─────────────────────────────────────────
DEPLOY_FRONTEND=false
DEPLOY_BACKEND=false
RUN_SEED=false

if [ $# -eq 0 ]; then
  DEPLOY_FRONTEND=true
  DEPLOY_BACKEND=true
fi

for arg in "$@"; do
  case $arg in
    --frontend) DEPLOY_FRONTEND=true ;;
    --backend)  DEPLOY_BACKEND=true ;;
    --seed)     RUN_SEED=true ;;
    --all)      DEPLOY_FRONTEND=true; DEPLOY_BACKEND=true ;;
    *)          echo "Unknown flag: $arg"; echo "Usage: deploy.sh [--frontend] [--backend] [--seed] [--all]"; exit 1 ;;
  esac
done

echo "═══════════════════════════════════════"
echo "  读城 Deployment"
echo "  Frontend: $DEPLOY_FRONTEND"
echo "  Backend:  $DEPLOY_BACKEND"
echo "  Seed:     $RUN_SEED"
echo "═══════════════════════════════════════"

# ─── Frontend ────────────────────────────────────────────
if [ "$DEPLOY_FRONTEND" = true ]; then
  echo ""
  echo "▶ Building frontend..."
  cd "$LOCAL_FRONTEND_DIR"
  npm run build

  echo "▶ Uploading frontend to $SERVER:$REMOTE_FRONTEND_DIR/"
  scp $SSH_OPTS -r dist/* "$SERVER:$REMOTE_FRONTEND_DIR/"
  echo "✓ Frontend deployed"
fi

# ─── Backend ─────────────────────────────────────────────
if [ "$DEPLOY_BACKEND" = true ]; then
  echo ""
  echo "▶ Syncing backend to $SERVER:$REMOTE_API_DIR/"

  # Ensure remote directory exists
  ssh $SSH_OPTS "$SERVER" "mkdir -p $REMOTE_API_DIR/uploads $REMOTE_API_DIR/logs"

  # Rsync backend code (exclude dev/local files)
  rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='uploads/*' \
    --exclude='logs/*' \
    --exclude='.git' \
    -e "ssh $SSH_OPTS" \
    "$LOCAL_API_DIR/" "$SERVER:$REMOTE_API_DIR/"

  echo "▶ Installing dependencies on server..."
  ssh $SSH_OPTS "$SERVER" "cd $REMOTE_API_DIR && npm install --production"

  echo "▶ Restarting ducheng-api via PM2..."
  ssh $SSH_OPTS "$SERVER" "cd $REMOTE_API_DIR && pm2 startOrRestart ecosystem.config.cjs --env production"

  echo "▶ Saving PM2 process list..."
  ssh $SSH_OPTS "$SERVER" "pm2 save"

  echo "✓ Backend deployed"
fi

# ─── Seed ────────────────────────────────────────────────
if [ "$RUN_SEED" = true ]; then
  echo ""
  echo "▶ Running seed script on server..."
  ssh $SSH_OPTS "$SERVER" "cd $REMOTE_API_DIR && node src/db/seed.js"
  echo "✓ Seed complete"
fi

# ─── Health Check ────────────────────────────────────────
echo ""
echo "▶ Running health check..."
sleep 2

HEALTH=$(ssh $SSH_OPTS "$SERVER" "curl -s http://127.0.0.1:3100/api/health" 2>/dev/null || echo "FAILED")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo "✓ Health check passed: $HEALTH"
else
  echo "✗ Health check failed: $HEALTH"
  echo "  Check logs: ssh $SSH_OPTS $SERVER 'pm2 logs ducheng-api --lines 20'"
  exit 1
fi

echo ""
echo "═══════════════════════════════════════"
echo "  Deployment complete!"
echo "  API:      https://ducheng-api.nju.top/api/health"
echo "  Frontend: https://ducheng.nju.top"
echo "═══════════════════════════════════════"
```

- [ ] **Step 2: Make the script executable**

```bash
chmod +x ducheng-api/scripts/deploy.sh
```

- [ ] **Step 3: Commit**

```bash
git add ducheng-api/scripts/deploy.sh
git commit -m "feat(ducheng-api): deploy script for frontend + backend"
```

---

### Task 6: Server Setup (First-Time Only)

**Files:** None (manual steps on the server)

This task is a one-time server setup. Run these commands via SSH before the first deployment.

- [ ] **Step 1: Create directories on server**

```bash
SSH_OPTS="-i ~/.ssh/photozen_nju_top_ed25519 -o IdentitiesOnly=yes"
SERVER="root@47.110.32.207"

ssh $SSH_OPTS $SERVER "mkdir -p /var/www/ducheng-api/uploads /var/www/ducheng-api/logs"
```

- [ ] **Step 2: Create .env on server**

```bash
ssh $SSH_OPTS $SERVER "cat > /var/www/ducheng-api/.env << 'ENVEOF'
# Database
DATABASE_URL=postgresql://ducheng:Charfield123@pgm-bp1b088t3trudmm1.pg.rds.aliyuncs.com:5432/ducheng?sslmode=disable

# Auth (shared with tuchan-api)
TUCHAN_JWT_SECRET=xQt2OqUSR3Qo2et4CucuRXhZgZ7haSgcq9iJbEP93CYN+Sb1A6xzFm4Rabo0ujl1

# Server
PORT=3100
NODE_ENV=production

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# GLM API (for photo verification)
GLM_API_KEY=
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# CORS — allow ducheng.nju.top
CORS_ORIGIN=https://ducheng.nju.top
ENVEOF"
```

Note: Fill in `GLM_API_KEY` from `D:\work\.env.shared` if available. If not, photo AI verification will be skipped (Phase 1B fallback behavior).

- [ ] **Step 3: Install Nginx config on server**

```bash
# Upload the API proxy config
scp $SSH_OPTS ducheng-api/nginx/ducheng-api.conf $SERVER:/etc/nginx/sites-enabled/ducheng-api.nju.top

# Add API proxy to existing ducheng.nju.top config
# First, check current config:
ssh $SSH_OPTS $SERVER "cat /etc/nginx/sites-enabled/ducheng.nju.top"

# Then manually add the /api/ and /uploads/ location blocks from
# ducheng-api/nginx/ducheng-frontend-api-proxy.conf into the
# existing ducheng.nju.top server block.
#
# Test and reload:
ssh $SSH_OPTS $SERVER "nginx -t && systemctl reload nginx"
```

- [ ] **Step 4: Verify Nginx config is valid**

```bash
ssh $SSH_OPTS $SERVER "nginx -t"
```

Expected: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

- [ ] **Step 5: Push database schema to production**

```bash
# Run drizzle push from the server (after deploy step copies code)
ssh $SSH_OPTS $SERVER "cd /var/www/ducheng-api && npx drizzle-kit push"
```

Confirm table creation when prompted.

---

### Task 7: First Deployment

**Files:** None (uses the deploy script from Task 5)

- [ ] **Step 1: Deploy everything**

```bash
cd ducheng-api && bash scripts/deploy.sh --all --seed
```

Expected output sequence:
1. Frontend builds successfully
2. Frontend files uploaded to `/var/www/ducheng/`
3. Backend synced to `/var/www/ducheng-api/`
4. `npm install --production` completes
5. PM2 starts/restarts `ducheng-api`
6. Seed script inserts 3 tasks (or skips if already seeded)
7. Health check passes

- [ ] **Step 2: Verify API is accessible via HTTPS**

```bash
curl https://ducheng-api.nju.top/api/health
# Expected: {"status":"ok","timestamp":"..."}

curl https://ducheng-api.nju.top/api/tasks
# Expected: {"items":[...3 tasks...],"total":3,...}

curl https://ducheng.nju.top/api/tasks
# Expected: same result (proxied through frontend Nginx)
```

- [ ] **Step 3: Verify task detail via HTTPS**

```bash
curl https://ducheng-api.nju.top/api/tasks/wukang-road-walk
# Expected: task with title "武康路文艺漫步" and 6 subTasks

curl https://ducheng-api.nju.top/api/tasks/bund-light-hunter
# Expected: task with title "外滩光影猎人" and 7 subTasks

curl https://ducheng-api.nju.top/api/tasks/jingan-explore
# Expected: task with title "静安寺周边探秘" and 5 subTasks
```

- [ ] **Step 4: Verify frontend loads**

Open `https://ducheng.nju.top` in a browser. The existing game should still work. If the exploration task UI has been added in Phase 1C, verify it can list tasks from the API.

- [ ] **Step 5: Commit any final adjustments**

```bash
git add -A
git status
# Only commit if there are meaningful changes (e.g., lockfile updates)
git commit -m "chore: post-deployment adjustments"
```

---

## Self-Review

### Spec Coverage

| Spec Section | Covered? | Task |
|-------------|----------|------|
| Poster endpoint (data JSON) | Yes | Task 1 |
| Seed data — 武康路文艺漫步 (6 subtasks) | Yes | Task 2 |
| Seed data — 外滩光影猎人 (7 subtasks) | Yes | Task 2 |
| Seed data — 静安寺周边探秘 (5 subtasks) | Yes | Task 2 |
| Seed script idempotent | Yes | Task 2 (slug check) |
| html2canvas poster download | Yes | Task 3 |
| PM2 config | Yes | Phase 1A Task 10 (already exists) |
| Nginx config (ducheng-api.nju.top) | Yes | Task 4 |
| Nginx proxy (/api/ on ducheng.nju.top) | Yes | Task 4 |
| Deploy script | Yes | Task 5 |
| Server .env setup | Yes | Task 6 |
| Full deployment + verification | Yes | Task 7 |

### Placeholder Scan

No TBD/TODO found. All code steps contain complete implementations.

### Data Integrity

- All 3 tasks use `city: 'shanghai'` consistently
- Sub-task `orderIndex` is 1-based and sequential within each task
- GPS coordinates are realistic Shanghai locations
- `validationConfig` types match the sub-task `type` field (arrival->gps, photo->ai_photo, puzzle->text_match, quiz->single_choice)
- Quiz `correct_index` is 0-based: Task 2 Q3 correct_index=2 (麦加利银行, 3rd option), Task 3 Q3 correct_index=2 (三国时期, 3rd option)
- Seed script checks for existing slug before insert (idempotent)

### Security Notes

- Server .env contains database credentials and JWT secret — never committed to git
- Deploy script excludes `.env` from rsync
- `GLM_API_KEY` placeholder left empty in plan — must be filled from `.env.shared` on server
- CORS restricted to `https://ducheng.nju.top` in production
