import { useResumeStore } from '@/stores'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const user = computed(() => currentData.value?.user || {})

// 计算工作年限（规则：满5个月按1年算，以此类推）
export const workYears = computed(() => {
  const workTime = user.value?.workTime
  if (!workTime) return ''

  const startDate = dayjs(workTime)
  if (!startDate.isValid()) return ''

  const diffInMonths = dayjs().diff(startDate, 'month')
  // 偏移7个月以实现：5-16个月=1年，17-28个月=2年...
  const years = Math.floor((diffInMonths + 7) / 12)

  return years > 0 ? `${years}年经验` : ''
})
/**
 * 格式化时间范围
 * @param time 时间数组 [开始时间, 结束时间] 或 [时间]
 * @returns 格式化后的时间字符串
 */
export const getTime = (time: any) => {
  if (!time || !Array.isArray(time) || time.length === 0) return ''
  if (time.length === 1) return time[0]
  return `${time[0]} - ${time[1]}`
}

/**
 * 生成简历标题
 * @returns 简历标题字符串
 */
export const resumeTitle = computed(() => {
  const defaultName = '未命名简历'
  const data = currentData.value
  if (!data) return defaultName
  const { user, education } = data
  const name = user?.name || ''
  const edu = education?.[0]?.education || ''
  const position = user?.position || ''
  return [name, edu, position, workYears.value].filter(Boolean).join('-') || defaultName
})

// 计算单个对象得分
export function calculateScore(obj: any) {
  if (!obj) return 0
  const keys = Object.keys(obj)
  const totalFields = keys.length
  if (totalFields === 0) return 0
  const singleScore = 10 / totalFields
  let totalScore = 0

  for (const key of keys) {
    const value = obj[key]
    const hasContent = value != null && String(value).trim() !== ''
    if (hasContent) totalScore += singleScore
  }
  return Math.round(totalScore)
}

// 数组评分函数（完美复用）
export function calculateListScore(list: any[]) {
  if (!Array.isArray(list) || list.length === 0) return 0
  let totalScore = 0
  for (const item of list) {
    totalScore += calculateScore(item)
  }
  const finalScore = totalScore / list.length
  return Math.round(finalScore)
}

// 用户信息得分
export const userScore = computed(() => calculateScore(currentData.value?.user || {}))
// 教育经历得分
export const educationScore = computed(() => calculateListScore(currentData.value?.education || []))
// 技能得分
export const skillScore = computed(() => (currentData.value?.skill?.trim() ? 10 : 0))
// 工作经历得分
export const workScore = computed(() => calculateListScore(currentData.value?.work || []))
// 项目经历得分
export const projectScore = computed(() => calculateListScore(currentData.value?.project || []))
