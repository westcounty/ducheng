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
    to: 'suzhou',
    quote: '东边有个地方叫姑苏，听说那里的人把戏唱进了园子里，连石头假山都会听戏。',
    source: '康安旅记·第七站·大雁塔',
    character: '康安'
  },
  {
    from: 'suzhou',
    to: 'shanghai',
    quote: '听说松江那边在修港口，洋人带来了一种会动的皮影。不知道还需不需要唱戏的人。',
    source: '沈云筝账册·第五站·平江路',
    character: '沈云筝'
  }
]

export function getVisibleThreads(completedCities, currentCity) {
  return CROSS_CITY_THREADS.filter(t =>
    (t.from === currentCity || t.to === currentCity) &&
    completedCities.includes(t.from) &&
    completedCities.includes(t.to)
  )
}
