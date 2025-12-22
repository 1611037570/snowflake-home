import { getRandomItem } from '@/utils'
export const colors = [
  '#ffe0e0', // 柔绯红（红系）
  '#ffe6c7', // 柔暖橙（橙系）
  '#fff5d6', // 柔嫩黄（黄系）
  '#cdf5e5', // 柔草绿（绿系）
  '#d8eef3', // 柔青（青系）
  '#cfe8ff', // 浅晶蓝（蓝系）
  '#f0e6ff', // 淡柔紫（紫系）
]
export const getRandomColor = () => {
  const color = getRandomItem(colors)
  return color
}
