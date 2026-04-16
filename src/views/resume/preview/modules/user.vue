<script setup>
import { useResumeStore } from '@/stores'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')
// 计算年龄
const age = computed(() => {
  // 获取用户生日，无则直接返回0（避免返回undefined导致渲染异常）
  const birthday = currentData.value?.user?.birthday
  if (!birthday) return 0

  // 解析生日日期并校验有效性（避免格式错误的日期导致计算异常）
  const birthdayDate = dayjs(birthday)
  if (!birthdayDate.isValid()) return 0

  // 统一时间基准，避免重复调用dayjs()
  const currentDate = dayjs()

  // 计算周岁差（dayjs.diff('year')默认向下取整，符合“不四舍五入”要求）
  const ageDiff = currentDate.diff(birthdayDate, 'year')

  // 处理未来生日的异常场景（如填错成未到的日期，返回0）
  return ageDiff < 0 ? 0 : ageDiff
})
const user = computed(() => {
  return currentData.value?.user
})
// 计算工作年限（规则：不足1年按0年算，满5个月不满1年按1年算，以此类推）
const workYears = computed(() => {
  // 2. 解构并校验核心数据：获取用户入职时间，无则返回0（避免返回undefined导致后续渲染问题）
  const workTime = user.value?.workTime
  if (!workTime) return 0

  // 3. 校验日期有效性：避免无效日期（如格式错误、空字符串）导致dayjs计算异常
  const startDate = dayjs(workTime)
  if (!startDate.isValid()) return 0

  // 4. 获取当前日期（统一时间基准，避免重复调用dayjs()）
  const currentDate = dayjs()

  // 5. 计算入职时间与当前时间的月份差（处理未来日期：若入职时间在未来，月份差为负，返回0）
  const diffInMonths = currentDate.diff(startDate, 'month')
  if (diffInMonths < 0) return 0

  // 6. 计算完整年数和剩余月份
  const fullYears = Math.floor(diffInMonths / 12) // 完整的年数（向下取整）
  const remainingMonths = diffInMonths % 12 // 剩余不足1年的月份

  // 7. 业务规则：剩余月份≥5个月则进1年，否则取完整年数
  return remainingMonths >= 5 ? fullYears + 1 : fullYears
})
// 电话
const phone = computed(() => {
  return user.value?.phone || ''
})

// 邮箱
const email = computed(() => {
  return user.value?.email || ''
})
</script>

<template>
  <!-- 头部基本信息 -->
  <div class="flex items-center" :style="[lineHeightValue(22)]">
    <h1 class="font-bold tracking-wide" :style="[fontValue(14)]">{{ user.name }}</h1>
    <div class="ml-4 flex items-center gap-3 opacity-80" :style="[fontValue(2)]">
      <span v-if="user.sex">{{ user.sex }}</span>
      <span v-if="user.sex && age" class="h-3 w-px bg-current opacity-50"></span>
      <span v-if="age">{{ age }}岁</span>
      <span v-if="age && workYears" class="h-3 w-px bg-current opacity-50"></span>
      <span v-if="workYears">{{ workYears }}年经验</span>
    </div>
  </div>
  <!-- 联系方式 -->
  <div
    class="mt-1 flex flex-wrap gap-x-6"
    :style="(lineHeightValue(14), fontValue())"
    v-if="phone || email"
  >
    <div class="flex items-center" v-if="phone">
      <div class="pr-1">电话：</div>
      <div class="font-medium">{{ phone }}</div>
    </div>
    <div class="flex items-center" v-if="email">
      <div class="pr-1">邮箱：</div>
      <div class="font-medium">{{ email }}</div>
    </div>
  </div>

  <!-- 社交链接 -->

  <div
    v-for="(item, index) in user.link"
    :key="index"
    class="mt-1 flex items-center gap-2"
    :style="(lineHeightValue(), fontValue())"
  >
    <div class="pr-1">{{ item.name }}：</div>
    <a :href="item.url" target="_blank" class="font-medium hover:underline">{{ item.url }}</a>
  </div>
</template>

<style lang="scss" scoped></style>
