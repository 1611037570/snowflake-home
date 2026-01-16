/**
 *  获取指定范围的随机数
 * @param min 最小值
 * @param max 最大值
 */
export const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 生成随机颜色
 */
export const getRandomColor = () => {
  const r = getRandom(0, 255)
  const g = getRandom(0, 255)
  const b = getRandom(0, 255)
  return `rgb(${r},${g},${b})`
}
/**
 * 从数组中随机获取一个元素
 * @param list 数组
 */
export const getRandomItem = (list: any[]) => {
  const randomIndex = Math.floor(Math.random() * list.length)
  const item = list[randomIndex]
  return item
}
