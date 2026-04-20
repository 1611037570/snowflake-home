<script setup>
import { useResumeStore } from '@/stores'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'
import { workYears } from '../../utils'
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
  <div :style="[lineHeightValue(), fontValue()]" class="resume-row" data-module="user">
    <!-- 头部基本信息 -->
    <div class="flex items-center" :style="[lineHeightValue(22)]">
      <h1 class="font-bold tracking-wide" :style="[fontValue(14)]">
        <Text v-model:value="user.name" v-model:newValue="user.newName" />
      </h1>
      <div class="ml-4 flex items-center gap-3" :style="[fontValue(2)]">
        <Text v-if="user.sex" v-model:value="user.sex" v-model:newValue="user.newSex" />
        <span v-if="user.sex && (age || workYears)" class="h-3 w-px bg-current opacity-50"></span>
        <Text v-if="age" :value="age + '岁'" v-model:newValue="user.newAge" />
        <span v-if="age && workYears" class="h-3 w-px bg-current opacity-50"></span>
        <Text v-if="workYears" :value="workYears" v-model:newValue="user.newWorkYears" />
      </div>
    </div>
    <!-- 联系方式 -->
    <div class="mt-1 flex flex-wrap gap-x-6" data-module="user" v-if="contactList.length">
      <div v-for="item in contactList" :key="item.label" class="flex items-center">
        <div class="pr-1">
          <Text v-model:value="item.label" v-model:newValue="item.newLabel" />：
        </div>
        <div class="font-medium">
          <Text v-model:value="item.value" v-model:newValue="item.newValue" />
        </div>
      </div>
    </div>
    <!-- 社交链接 -->
    <div
      v-for="(item, index) in user.link"
      :key="index"
      class="mt-1 flex items-center gap-2"
      data-module="user"
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
