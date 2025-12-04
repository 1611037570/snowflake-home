const SIZES: any = {
  base: { offset: 3, min: 3 },
  sm: { offset: 2, min: 4 },
  md: { offset: 1, min: 5 },
  lg: { offset: 0, min: 0 },
}

export function $s(size: string | number, type = 'text') {
  // 转换并处理尺寸值（确保为数字）
  const baseValue = Number(size)
  // 语义化命名：偏移乘数（替代原无意义的b）
  const offsetMultiplier = baseValue > 10 ? 3 : 1

  // 封装尺寸计算逻辑（内聚核心计算规则）
  const calculateSize = (key: keyof typeof SIZES): number => {
    const { offset, min } = SIZES[key]
    return Math.max(baseValue - offset * offsetMultiplier, min)
  }

  // 计算不同尺寸值
  const baseSize = calculateSize('base')
  const smSize = calculateSize('sm')
  const mdSize = calculateSize('md')
  const lgSize = baseSize
  return `${type}-${baseSize} md:${type}-${mdSize} sm:${type}-${smSize} lg:${type}-${lgSize}
    `
}
