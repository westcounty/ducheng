export const CROSS_CITY_THREADS = [
  {
    from: 'shanghai',
    to: 'nanjing',
    quote: '南京的城墙比上海的高，但我更怕矮墙——矮墙后面才藏人。',
    source: '鹤影日记·第六站·思南公馆',
    character: '鹤影'
  },
  {
    from: 'nanjing',
    to: 'hangzhou',
    quote: '听说杭州西湖边也在修堤，不知那边的泥巴里有没有人偷偷刻字。',
    source: '陆鸣远札记·第四站·秦淮河',
    character: '陆鸣远'
  },
  {
    from: 'hangzhou',
    to: 'xian',
    quote: '长安有个胡商，听说也在这世间留了很久。但他是自愿的。',
    source: '白素贞手稿·第三站·龙井村',
    character: '白素贞'
  },
  {
    from: 'xian',
    to: 'shanghai',
    quote: '有人说东海尽头有个渔港，将来也许会变成大城。我到不了那么远。',
    source: '康安旅记·第七站·大雁塔',
    character: '康安'
  }
]

export function getVisibleThreads(completedCities, currentCity) {
  return CROSS_CITY_THREADS.filter(t =>
    (t.from === currentCity || t.to === currentCity) &&
    completedCities.includes(t.from) &&
    completedCities.includes(t.to)
  )
}
