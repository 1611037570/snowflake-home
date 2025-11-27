import dayjs from 'dayjs'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export const useCurrentTime = () => {
  // 基础时间信息
  const time = ref('00:00:00')
  const date = ref('0000/00/00')
  const weekday = ref<string | undefined>('')

  // 详细时间组件
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const milliseconds = ref(0)

  // 日期组件
  const year = ref(0)
  const month = ref(0)
  const day = ref(0)

  // 原始日期对象
  const raw = ref<Date | null>(null)

  // 主更新逻辑：同步所有时间数据
  const update = () => {
    const dayjsNow = dayjs()
    const now = dayjsNow.toDate()

    time.value = dayjsNow.format('HH:mm:ss')
    date.value = dayjsNow.format('YYYY/MM/DD')
    weekday.value = dayjsNow.format('dddd')

    hours.value = dayjsNow.hour()
    minutes.value = dayjsNow.minute()
    seconds.value = dayjsNow.second()
    milliseconds.value = dayjsNow.millisecond()
    year.value = dayjsNow.year()
    month.value = dayjsNow.month() + 1
    day.value = dayjsNow.date()
    raw.value = now
  }

  // 动画帧回调：基于时间戳差值控制每秒更新
  let rafId: number | null = null
  let lastUpdateTime = 0 // 记录上一次更新的时间戳

  const tick = (timestamp: number) => {
    // 首次触发时初始化基准时间戳
    if (!lastUpdateTime) {
      lastUpdateTime = timestamp
    }

    // 当时间差≥1000ms时更新（确保每秒一次）
    if (timestamp - lastUpdateTime >= 1000) {
      update()
      lastUpdateTime = timestamp // 重置基准时间戳
    }

    // 持续请求下一帧
    rafId = requestAnimationFrame(tick)
  }

  // 启动计时器
  const startTimer = () => {
    stopTimer() // 清除可能的旧任务
    lastUpdateTime = 0 // 重置基准时间戳
    rafId = requestAnimationFrame(tick)
  }

  // 停止计时器
  const stopTimer = () => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  // 生命周期管理
  onMounted(() => {
    update() // 初始化数据
    startTimer()
  })

  onBeforeUnmount(stopTimer)

  return {
    time,
    date,
    weekday,
    hours,
    minutes,
    seconds,
    milliseconds,
    year,
    month,
    day,
    raw,
  }
}
