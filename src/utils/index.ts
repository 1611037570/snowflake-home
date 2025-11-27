export * from './modules/getRandomQuote'
export * from './modules/getStrMatch'
export * from './modules/getUUID'
export * from './modules/imageUtils'
export * from './modules/loadElLocal'
export * from './modules/loadTheme'
export * from './modules/url'

export const getRandomItem = (list: any[]) => {
  const randomIndex = Math.floor(Math.random() * list.length)
  const item = list[randomIndex]
  return item
}
