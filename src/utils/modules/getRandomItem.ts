export const getRandomItem = (list: any[]) => {
  const randomIndex = Math.floor(Math.random() * list.length)
  const item = list[randomIndex]
  return item
}
