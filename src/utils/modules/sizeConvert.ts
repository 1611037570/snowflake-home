const SIZES: any = {
  base: { offset: 3, min: 1 },
  sm: { offset: 2, min: 2 },
  md: { offset: 1, min: 3 },
  lg: { offset: 0, min: 0 },
}

export function $s(size: string | number, type = 'text') {
  // 转换并处理尺寸值（确保为数字）
  const baseValue = Number(size)
  // 语义化命名：偏移乘数
  let offsetMultiplier = 1
  if (baseValue > 15) {
    offsetMultiplier = 3
  } else if (baseValue > 10) {
    offsetMultiplier = 2
  }

  // 封装尺寸计算逻辑（内聚核心计算规则）
  const calculateSize = (key: keyof typeof SIZES): number => {
    const { offset, min } = SIZES[key]
    return Math.max(baseValue - offset * offsetMultiplier, min)
  }

  // 计算不同尺寸值
  const baseSize = calculateSize('base')
  const smSize = calculateSize('sm')
  const mdSize = calculateSize('md')
  const lgSize = calculateSize('lg')
  return `${type}-${baseSize} sm:${type}-${smSize} md:${type}-${mdSize} lg:${type}-${lgSize} transition-${type} duration-300
    `
}
