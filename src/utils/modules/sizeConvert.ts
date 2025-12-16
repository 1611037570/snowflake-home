// 定义尺寸配置类型，替换any提升类型安全
interface SizeConfig {
  offset: number
  min: number
}

// 尺寸配置表（精确类型）
const SIZES: Record<'base' | 'sm' | 'md' | 'lg', SizeConfig> = {
  base: { offset: 1.5, min: 1 },
  sm: { offset: 2, min: 2 },
  md: { offset: 2.5, min: 3 },
  lg: { offset: 0, min: 0 },
}

// 补充类型注解，明确参数/返回值类型
function calculatePercentage(total: number, percent: number): number {
  const result = total * (percent / 100)
  return Math.floor(result)
}

export function $s(size: string | number, type = 'text', options = { auto: true }): string {
  const { auto = true } = options
  // 转换基础尺寸值
  const baseValue = Number(size)

  // 语义化阈值常量，提升可读性
  const THRESHOLD_1 = 10 // 原变量a
  const THRESHOLD_2 = 15 // 原变量b

  // 封装核心尺寸计算逻辑
  const calculateSize = (key: keyof typeof SIZES): number => {
    const { offset, min } = SIZES[key]
    return Math.max(baseValue - offset, min)
  }

  // 提取重复的条件计算逻辑，减少冗余
  const getSizeValue = (
    key: 'base' | 'sm' | 'md',
    percentAboveThreshold2: number,
    percentBetweenThreshold1And2: number,
  ): number => {
    if (baseValue > THRESHOLD_2) {
      return calculatePercentage(baseValue, percentAboveThreshold2)
    }
    if (baseValue > THRESHOLD_1) {
      return calculatePercentage(baseValue, percentBetweenThreshold1And2)
    }
    return calculateSize(key)
  }

  // 计算各尺寸值（通过封装函数简化，逻辑更清晰）
  const lgSize = calculateSize('lg')
  if (!auto) {
    return `${type}-${lgSize}`
  }
  const baseSize = getSizeValue('base', 35, 45)
  const smSize = getSizeValue('sm', 55, 65)
  const mdSize = getSizeValue('md', 75, 85)

  // 清理多余空格/换行，保持返回字符串整洁
  return `${type}-${baseSize} sm:${type}-${smSize} md:${type}-${mdSize} lg:${type}-${lgSize}`
}
