<script setup>
import { useResumeStore } from '@/stores'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'
import Text from './text.vue'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')

const user = computed(() => currentData.value?.user || {})

// 计算年龄
const age = computed(() => {
  const birthday = user.value?.birthday
  if (!birthday || !dayjs(birthday).isValid()) return 0
  const ageDiff = dayjs().diff(dayjs(birthday), 'year')
  return Math.max(0, ageDiff)
})

// 计算工作年限（规则：不足1年按0年算，满5个月不满1年按1年算，以此类推）
const workYears = computed(() => {
  const workTime = user.value?.workTime
  if (!workTime || !dayjs(workTime).isValid()) return 0
  const diffInMonths = dayjs().diff(dayjs(workTime), 'month')
  if (diffInMonths < 0) return 0
  const fullYears = Math.floor(diffInMonths / 12)
  return diffInMonths % 12 >= 5 ? fullYears + 1 : fullYears
})

// 联系方式列表 (电话、邮箱)
const contactList = computed(() => {
  const list = []
  if (user.value.phone) list.push({ label: '电话', value: user.value.phone })
  if (user.value.email) list.push({ label: '邮箱', value: user.value.email })
  return list
})

setTimeout(() => {
  user.value.newName = '123'
}, 1000)
</script>

<template>
  <div :style="[lineHeightValue()]" class="resume-row">
    <!-- 头部基本信息 -->
    <div class="flex items-center" data-module="user" :style="[lineHeightValue(22)]">
      <h1 class="font-bold tracking-wide" :style="[fontValue(14)]">
        <Text v-model:value="user.name" v-model:newValue="user.newName" />
      </h1>
      <div class="ml-4 flex items-center gap-3" :style="[fontValue(2)]">
        <Text v-if="user.sex" v-model:value="user.sex" v-model:newValue="user.newSex" />
        <span v-if="user.sex && (age || workYears)" class="h-3 w-px bg-current opacity-50"></span>
        <Text v-if="age" :value="age + '岁'" v-model:newValue="user.newAge" />
        <span v-if="age && workYears" class="h-3 w-px bg-current opacity-50"></span>
        <Text v-if="workYears" :value="workYears + '年经验'" v-model:newValue="user.newWorkYears" />
      </div>
    </div>
    <!-- 联系方式 -->
    <div
      class="resume-row mt-1 flex flex-wrap gap-x-6"
      data-module="user"
      :style="[lineHeightValue(), fontValue()]"
      v-if="contactList.length"
    >
      <div v-for="item in contactList" :key="item.label" class="flex items-center">
        <div class="pr-1">{{ item.label }}：</div>
        <div class="font-medium">{{ item.value }}</div>
      </div>
    </div>
    <!-- 社交链接 -->
    <div
      v-for="(item, index) in user.link"
      :key="index"
      class="resume-row mt-1 flex items-center gap-2"
      data-module="user"
      :style="[lineHeightValue(), fontValue()]"
    >
      <Text v-model:value="item.name" v-model:newValue="item.newName" />
      <span v-if="item.name && item.url" class="pr-1">：</span>
      <a :href="item.url" target="_blank" class="font-medium hover:underline">
        <Text v-model:value="item.url" v-model:newValue="item.newUrl" />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
