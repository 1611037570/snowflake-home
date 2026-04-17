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
