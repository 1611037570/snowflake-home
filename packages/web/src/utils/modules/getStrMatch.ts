/**
 * 字符串顺序模糊匹配（双向遍历极致优化版）
 * 核心规则：查询串所有字符需按顺序出现在主串中（不要求连续），不匹配空查询串
 * 优化亮点：等长快速对比、首尾字符缓存、剩余长度预判、双向指针收缩，性能接近 JS 层面天花板
 * @param mainStr 完整主字符串（固定小写，无需额外处理）
 * @param queryStr 待匹配查询字符串（自动转为小写匹配）
 * @returns 符合顺序匹配规则返回 true，否则返回 false
 */
export function getStrMatch(mainStr: string, queryStr: string) {
  // 边界处理：空查询串或空主串，不可能匹配
  if (!queryStr || !mainStr) return false
  console.log('mainStr', mainStr)
  console.log('queryStr', queryStr)
  const mainLen = mainStr.length
  const queryLen = queryStr.length

  // 边界处理：查询串长度超过主串，不可能匹配
  if (queryLen > mainLen) return false

  // 统一查询串为小写，兼容任意大小写输入
  const query = queryStr.toLowerCase()

  // 快速路径：主串与查询串等长 → 直接全等对比（无需遍历，O(1) 开销）
  if (mainLen === queryLen) return mainStr === query

  // 初始化查询串双指针（首尾向中间匹配）
  let qLeft = 0,
    qRight = queryLen - 1
  // 缓存查询串当前首尾字符 → 减少循环内索引访问开销
  let queryLeftChar = query[qLeft]
  let queryRightChar = query[qRight]

  // 初始化主串双指针（首尾向中间收缩）
  let left = 0,
    right = mainLen - 1

  // 循环条件：主串指针不交叉 + 仍有查询字符未匹配
  while (left <= right) {
    // 提前预判：主串剩余字符数 < 查询串剩余字符数 → 直接不匹配
    if (right - left + 1 < qRight - qLeft + 1) return false

    // 左匹配：主串左指针匹配查询串左字符 → 双左指针同步推进
    if (mainStr[left] === queryLeftChar) {
      qLeft++
      // 所有查询字符匹配完成 → 提前返回成功
      if (qLeft > qRight) return true
      // 更新下一个待匹配的左字符
      queryLeftChar = query[qLeft]
      left++
      continue
    }

    // 右匹配：主串右指针匹配查询串右字符 → 双右指针同步推进
    if (mainStr[right] === queryRightChar) {
      qRight--
      // 所有查询字符匹配完成 → 提前返回成功
      if (qLeft > qRight) return true
      // 更新下一个待匹配的右字符
      queryRightChar = query[qRight]
      right--
      continue
    }

    // 首尾均不匹配 → 主串双指针同时收缩（加速缩小有效范围）
    left++
    right--
  }

  // 循环结束：判断查询串是否全部匹配完成
  return qLeft > qRight
}
