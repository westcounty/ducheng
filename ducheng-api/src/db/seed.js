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
