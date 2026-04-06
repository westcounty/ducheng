export const CITIES = [
  {
    id: 'shanghai',
    name: '上海',
    scriptName: '第七封密电',
    tagline: '一个间谍的最后一条路',
    themeClass: 'theme-shanghai',
    available: true,
    totalStages: 7
  },
  {
    id: 'shanghai2',
    name: '上海·福州路',
    scriptName: '墨迹',
    tagline: '一个编辑在一条街上藏了一本书',
    themeClass: 'theme-shanghai2',
    available: true,
    totalStages: 7
  },
  {
    id: 'nanjing',
    name: '南京',
    scriptName: '金陵刻痕',
    tagline: '一个读了整座城的人',
    themeClass: 'theme-nanjing',
    available: true,
    totalStages: 7
  },
  {
    id: 'hangzhou',
    name: '杭州',
    scriptName: '断桥不断',
    tagline: '一条蛇写的人类观察笔记',
    themeClass: 'theme-hangzhou',
    available: true,
    totalStages: 7
  },
  {
    id: 'xian',
    name: '西安',
    scriptName: '长安译',
    tagline: '一场迟到一千三百年的晚宴',
    themeClass: 'theme-xian',
    available: true,
    totalStages: 7
  },
  {
    id: 'suzhou',
    name: '苏州',
    scriptName: '姑苏折子',
    tagline: '她演了一辈子别人的戏，只有苏州记得她自己的台词',
    themeClass: 'theme-suzhou',
    available: true,
    totalStages: 7
  }
]

export function getCity(cityId) {
  return CITIES.find((c) => c.id === cityId)
}

export const CITY_IDS = CITIES.map((c) => c.id)
