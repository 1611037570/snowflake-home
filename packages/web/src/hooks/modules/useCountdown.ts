import dayjs from 'dayjs'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// 目标时间参数类型定义
interface TargetTimeOptions {
  year?: number | null // 年份（如2024），null则取当前年
  month?: number | null // 月份（1-12），null则取当前月
  day?: number | null // 日期（1-31），null则取当前日
  hour?: number // 小时（0-23，默认17）
  minute?: number // 分钟（0-59，默认30）
  second?: number // 秒（0-59，默认0）
}

export function useCountdown(options: TargetTimeOptions) {
  // 核心：剩余总秒数（响应式基准值）
  const totalSeconds = ref(0)

  // 动画帧控制变量
  let lastTime = 0
  let rafId: number | null = null

  /**
   * 计算目标时间（处理过期顺延逻辑）
   * 规则：仅当当前时间已过目标日期的"当天"，才顺延至下一个周期
   */
  const getTargetTime = () => {
    const now = dayjs()
    // 处理参数默认值（null则取当前时间对应值）
    const year = options.year ?? now.year()
    const month = (options.month ?? now.month() + 1) - 1 // 转换为0-11月
    const day = options.day ?? now.date()
    const hour = options.hour ?? 0
    const minute = options.minute ?? 0
    const second = options.second ?? 0

    // 构建基础目标时间
    let target = dayjs()
      .year(year)
      .month(month)
      .date(day)
      .hour(hour)
      .minute(minute)
      .second(second)
      .millisecond(0)

    const targetDate = target.format('YYYY-MM-DD')
    const nowDate = now.format('YYYY-MM-DD')
    const isAfterSameDay = nowDate > targetDate // 只比较日期，不比较时间

    // 已过当天则按优先级顺延
    if (isAfterSameDay) {
      console.log('已过目标日期的"当天"，按优先级顺延')
      if (options.year !== null) target = target.add(1, 'year')
      else if (options.month !== null) target = target.add(1, 'year')
      else if (options.day !== null) target = target.add(1, 'month')
      else target = target.add(1, 'day')
    }

    return target
  }

  /** 更新剩余秒数（核心计算逻辑） */
  const updateCountdown = () => {
    const now = dayjs()
    const target = getTargetTime()
    totalSeconds.value = Math.max(0, target.diff(now, 'second'))
  }

  /** 动画帧回调（控制每秒更新一次，避免高频计算） */
  const rafCallback = (timestamp: number) => {
    if (!lastTime) lastTime = timestamp // 初始化时间戳
    const elapsed = timestamp - lastTime
    if (elapsed >= 1000) {
      // 间隔1秒以上才更新
      updateCountdown()
      lastTime = timestamp
    }
    rafId = requestAnimationFrame(rafCallback) // 持续循环
  }

  // 组件挂载时初始化并启动动画帧
  onMounted(() => {
    updateCountdown()
    rafId = requestAnimationFrame(rafCallback)
  })

  // 组件卸载前清理动画帧（避免内存泄漏）
  onBeforeUnmount(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  // 统一计算拆分的时间部分（年月日时分秒）
  const timeParts = computed(() => {
    let remaining = totalSeconds.value

    const seconds = remaining % 60
    remaining = Math.floor(remaining / 60)

    const minutes = remaining % 60
    remaining = Math.floor(remaining / 60)

    const hours = remaining % 24
    remaining = Math.floor(remaining / 24)

    const days = remaining % 30
    remaining = Math.floor(remaining / 30)

    const months = remaining % 12
    const years = Math.floor(remaining / 12)

    return { years, months, days, hours, minutes, seconds }
  })

  // 所有返回字段均为响应式（computed或ref）
  const isReached = computed(() => totalSeconds.value === 0)
  const totalMinutes = computed(() => Math.floor(totalSeconds.value / 60))
  const totalHours = computed(() => Math.floor(totalSeconds.value / 3600))
  const totalDays = computed(() => Math.floor(totalSeconds.value / 86400))
  const years = computed(() => timeParts.value.years)
  const months = computed(() => timeParts.value.months)
  const days = computed(() => timeParts.value.days)
  const hours = computed(() => timeParts.value.hours)
  const minutes = computed(() => timeParts.value.minutes)
  const seconds = computed(() => timeParts.value.seconds)
  const date = computed(() => `${years.value}年${months.value}月${days.value}日`)
  const time = computed(() => `${hours.value}时${minutes.value}分${seconds.value}秒`)

  return ref({
    // 总时间单位
    totalSeconds,
    totalMinutes,
    totalHours,
    totalDays,
    // 状态标识
    isReached,
    // 独立时间字段
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    // 合体格式
    date,
    time,
  })
}
