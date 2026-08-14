/**
 * 通用字节单位格式化函数（抽离复用）
 * @param bytes 原始字节数
 * @returns 易读的体积字符串，如 "12 B"、"2.34 KB"、"1.56 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * 计算数据的UTF-8体积（JSON序列化方式）
 * @param data 要计算体积的数据（支持可JSON序列化的所有类型）
 * @returns { bytes: 原始字节数, size: 格式化体积字符串 } 体积信息
 */
export function calculateDataSize(data: any) {
  try {
    // 1. 将数据转为JSON字符串（模拟实际传输的JSON格式）
    const jsonStr = JSON.stringify(data)
    // 2. 计算UTF-8字节数（Blob会自动按UTF-8编码计算，支持多字节字符如中文/表情）
    const bytes = new Blob([jsonStr]).size
    // 3. 复用格式化函数生成易读字符串
    const size = formatBytes(bytes)
    return { bytes, size } // 返回字节数+格式化字符串
  } catch (e) {
    // 处理不可JSON序列化的情况（如函数、Symbol、循环引用）
    console.warn('数据不可JSON序列化，体积按0计算：', e)
    return { bytes: 0, size: '0 B' } // 统一返回格式
  }
}

/**
 * 计算缓存项淘汰评分
 * @param item 缓存项
 * @param currentTime 当前时间戳
 * @returns 评分（越低越该淘汰）
 */
export function calculateEvictionScore(item: any, currentTime: number): number {
  // 计算「最后使用时间到现在的间隔」（毫秒）
  const timeSinceLastUse = currentTime - item.lastTime
  // 核心评分公式：
  // - 分子（item.count）：使用次数越多，评分越高（越不该被淘汰）
  // - 分母（timeSinceLastUse + 1）：闲置越久，分母越大，评分越低（越该被淘汰）
  // +1 是为了避免分母为 0（当lastTime等于now时）
  const score = item.count / (timeSinceLastUse + 1)

  return score
}
