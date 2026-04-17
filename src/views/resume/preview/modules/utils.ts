import { useResumeStore } from '@/stores'
import dayjs from 'dayjs'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const user = computed(() => currentData.value?.user || {})

// 计算工作年限（规则：不足1年按0年算，满5个月不满1年按1年算，以此类推）
export const workYears = computed(() => {
  const workTime = user.value?.workTime
  if (!workTime || !dayjs(workTime).isValid()) return 0
  const diffInMonths = dayjs().diff(dayjs(workTime), 'month')
  if (diffInMonths < 0) return 0
  const fullYears = Math.floor(diffInMonths / 12)
  return diffInMonths % 12 >= 5 ? fullYears + 1 : fullYears
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
