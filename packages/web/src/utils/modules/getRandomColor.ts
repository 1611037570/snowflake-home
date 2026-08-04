import { getRandomItem } from '@/utils'
import { lightThemeColors } from '@/constants'
export const getRandomColor = () => {
  const color = getRandomItem(lightThemeColors).value
  return color
}
