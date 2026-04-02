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
    id: 'nanjing',
    name: '南京',
    scriptName: '金陵刻痕',
    tagline: '一个读了整座城的人',
    themeClass: 'theme-nanjing',
    available: false,
    totalStages: null
  },
  {
    id: 'hangzhou',
    name: '杭州',
    scriptName: '断桥不断',
    tagline: '一条蛇写的人类观察笔记',
    themeClass: 'theme-hangzhou',
    available: false,
    totalStages: null
  },
  {
    id: 'xian',
    name: '西安',
    scriptName: '长安译',
    tagline: '一场迟到一千三百年的晚宴',
    themeClass: 'theme-xian',
    available: false,
    totalStages: null
  }
]

export function getCity(cityId) {
  return CITIES.find((c) => c.id === cityId)
}

export const CITY_IDS = CITIES.map((c) => c.id)
