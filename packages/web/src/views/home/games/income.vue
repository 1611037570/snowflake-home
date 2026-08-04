<template>
  <div
    class="relative flex h-20 w-20"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 背景扩宽元素 - 位于底层 -->
    <div
      class="absolute left-2 flex h-full flex-col justify-center overflow-hidden rounded-xl bg-amber-200 whitespace-nowrap transition-all duration-300 ease-out"
      :style="{ width: isHovered ? '320px' : '0px', zIndex: 10 }"
      :class="isHovered ? 'pl-20 shadow-xl' : 'pl-0'"
    >
      <!-- 假期 -->
      <div v-if="workStatus === 'weekend' || workStatus === 'holiday'">~</div>
      <!-- 距离工作时间 -->
      <div v-else-if="!workStartStatus.isReached">距离工作还有：{{ workStartStatus.time }}</div>
      <!-- 距离午休时间 -->
      <div v-else-if="!restStartStatus.isReached">距离午休还有：{{ restStartStatus.time }}</div>
      <!-- 距离下午工作时间 -->
      <div v-else-if="restStartStatus.isReached && !restEndStatus.isReached">
        距离下午工作还有：{{ restEndStatus.time }}
      </div>
      <!-- 距离下班时间 -->
      <div v-else-if="workEndStatus.isReached">下班啦！开铲~</div>
      <div v-else>距离下班还有：{{ workEndStatus.time }}</div>
      <!-- 距离爆金币时间 -->
      <div v-if="expireStatus.isReached">爆金币时间！！！</div>
      <div v-else>距离爆金币还有：{{ expireStatus.days }}天</div>
    </div>
    <div
      class="relative z-20 flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl bg-amber-300 text-sm whitespace-nowrap"
    >
      <div>
        今日<span class="font-bold">{{ currentWeekday }}</span>
      </div>
      <div v-if="workStatus === 'weekend'">~</div>
      <div v-else-if="workStatus === 'holiday'">{{ todayFestival }}</div>
      <template v-else-if="workStatus === 'work'">
        <div>已摸到</div>
        <div>
          <span class="font-bold text-red-500">{{ accumulatedIncome }}</span> 元
        </div>
      </template>
      <div v-else-if="workStatus === 'rest'">午休时间</div>
      <template v-else-if="workStatus === 'off'">下班时间</template>
    </div>
  </div>
</template>

<script setup>
import { useCountdown } from '@/hooks'
import ww from 'chinese-workday'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { computed, ref } from 'vue'
dayjs.extend(isBetween)
// 上下班时间
const workTime = ref({
  start: '08:30',
  end: '17:30',
})
// 休息时间
const restTime = ref({
  start: '11:30',
  end: '13:00',
})
const restStartStatus = useCountdown({
  hour: restTime.value.start.split(':')[0],
  minute: restTime.value.start.split(':')[1],
})
const restEndStatus = useCountdown({
  hour: restTime.value.end.split(':')[0],
  minute: restTime.value.end.split(':')[1],
})
const workStartStatus = useCountdown({
  hour: workTime.value.start.split(':')[0],
  minute: workTime.value.start.split(':')[1],
})
// 下班倒计时
const workEndStatus = useCountdown({
  hour: workTime.value.end.split(':')[0],
  minute: workTime.value.end.split(':')[1],
})
// 爆金币倒计时
const expireStatus = useCountdown({
  day: 18,
})

const isHovered = ref(false)

// 月收入
const monthIncome = ref(5500)
// 月工作天数
const workDays = ref(24)

// 解析上班/休息时间为 dayjs 对象（当天的时分）
const workStart = dayjs(workTime.value.start, 'HH:mm')
const workEnd = dayjs(workTime.value.end, 'HH:mm')
const restStart = dayjs(restTime.value.start, 'HH:mm')
const restEnd = dayjs(restTime.value.end, 'HH:mm')

const currentTime = computed(() => {
  const time = dayjs()
  return time
})

// 当前周几（周一到周日）
const currentWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[currentTime.value.day()]
})

const isWeekend = (date) => {
  const day = dayjs(date).get('day')
  return day === 0 || day === 6
}
// 今天节日
const todayFestival = computed(() => {
  const currentDate = currentTime.value.format('YYYY-MM-DD')
  return ww.getFestival(currentDate)
})
const workStatus = computed(() => {
  const currentDate = currentTime.value.format('YYYY-MM-DD')
  // 是否为节假日
  if (ww.isHoliday(currentDate)) {
    return 'holiday'
  }
  // 是否在周六周日并不是额外工作日
  if (isWeekend(currentDate) && !ww.isAddtionalWorkday(currentDate)) {
    return 'weekend'
  }
  // 是否在工作时间
  if (currentTime.value.isBetween(workStart, workEnd)) {
    return 'work'
  }
  // 是否在休息时间
  if (currentTime.value.isBetween(restStart, restEnd)) {
    return 'rest'
  }
  return 'off'
})

// 每秒收入
// 辅助函数：将时间字符串（HH:MM）转换为小时数（如 08:30 → 8.5）
const parseTimeToHours = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}

// 每秒收入
const secondIncome = computed(() => {
  // 1. 计算每天上班总时长（小时）
  const workStartHours = parseTimeToHours(workTime.value.start)
  const workEndHours = parseTimeToHours(workTime.value.end)
  const dailyWorkTotalHours = workEndHours - workStartHours

  // 2. 计算每天休息时长（小时）
  const restStartHours = parseTimeToHours(restTime.value.start)
  const restEndHours = parseTimeToHours(restTime.value.end)
  const dailyRestHours = restEndHours - restStartHours

  // 3. 每天有效工作时长（小时）= 上班总时长 - 休息时长
  const dailyEffectiveHours = dailyWorkTotalHours - dailyRestHours

  // 4. 转换为有效工作秒数（1小时=3600秒）
  const dailyEffectiveSeconds = dailyEffectiveHours * 3600

  // 5. 避免除以0（边界处理）
  if (workDays.value === 0 || dailyEffectiveSeconds <= 0) {
    return 0
  }

  // 6. 最终公式：秒薪 = 月收入 / 月工作天数 / 每天有效工作秒数
  return monthIncome.value / workDays.value / dailyEffectiveSeconds
})

// 计算从今天上班时间到当前的累计收入
const calculateIncomeFromToday = () => {
  const now = dayjs()
  const today = dayjs().startOf('day')
  const todayWorkStart = dayjs(
    `${today.format('YYYY-MM-DD')} ${workTime.value.start}`,
    'YYYY-MM-DD HH:mm',
  )
  const todayRestStart = dayjs(
    `${today.format('YYYY-MM-DD')} ${restTime.value.start}`,
    'YYYY-MM-DD HH:mm',
  )
  const todayRestEnd = dayjs(
    `${today.format('YYYY-MM-DD')} ${restTime.value.end}`,
    'YYYY-MM-DD HH:mm',
  )
  // const todayWorkEnd = dayjs(
  //   `${today.format('YYYY-MM-DD')} ${workTime.value.end}`,
  //   'YYYY-MM-DD HH:mm',
  // )

  let totalEffectiveSeconds = 0

  // 如果当前时间在上班时间内
  if (workStatus.value === 'work') {
    // 计算从上班开始到现在的总时间（秒）
    const fromWorkStartToNow = now.diff(todayWorkStart, 'second')

    // 计算休息时间占用的秒数
    let restSeconds = 0
    if (now.isAfter(todayRestEnd)) {
      // 如果当前时间在休息结束后，休息时间全算
      restSeconds = todayRestEnd.diff(todayRestStart, 'second')
    } else if (now.isAfter(todayRestStart)) {
      // 如果当前时间在休息时间内，计算到现在的休息时间
      restSeconds = now.diff(todayRestStart, 'second')
    }

    // 有效工作时间 = 总时间 - 休息时间
    totalEffectiveSeconds = fromWorkStartToNow - restSeconds
  }

  // 有效工作时间不能为负数
  totalEffectiveSeconds = Math.max(0, totalEffectiveSeconds)

  // 计算累计收入
  return Number((totalEffectiveSeconds * secondIncome.value).toFixed(2))
}

// 新变量：累积收入（从今天到现在）
const accumulatedIncome = ref(calculateIncomeFromToday())
// 记录上次更新时间（用于计算时间差）
let lastUpdateTime = null
// 存储requestAnimationFrame的ID，用于停止动画
let animationId = null

// 每秒更新累积收入的函数
const updateIncome = (timestamp) => {
  // 第一次执行时初始化上次时间
  if (!lastUpdateTime) {
    lastUpdateTime = timestamp
  }

  // 计算与上次更新的时间差（毫秒）
  const timeDiff = timestamp - lastUpdateTime

  // 当时间差 >= 1秒时，更新累积收入
  if (timeDiff >= 1000) {
    // 计算实际过去的秒数（支持非整数秒，提高精度）
    const secondsPassed = timeDiff / 1000

    // 当处于工作状态时累加收入
    if (workStatus.value === 'work') {
      accumulatedIncome.value += secondIncome.value * secondsPassed
    }

    // 保留小数后4位（避免精度溢出）
    accumulatedIncome.value = Number(accumulatedIncome.value.toFixed(2))
    // 更新上次时间（减去多余的毫秒，确保下次计算准确）
    lastUpdateTime = timestamp - (timeDiff % 1000)
  }

  // 继续请求下一帧
  animationId = requestAnimationFrame(updateIncome)
}

// 组件挂载时启动更新
onMounted(() => {
  animationId = requestAnimationFrame(updateIncome)
})

// 组件卸载时停止更新（避免内存泄漏）
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style lang="scss" scoped></style>
