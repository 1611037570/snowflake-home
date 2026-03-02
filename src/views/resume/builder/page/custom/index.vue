<script setup>
import { useResumeStore } from '@/stores'
import {
  fontList,
  lineHeightList,
  paddingList,
  themeColors,
} from '@/stores/modules/resume/uiConfig'
import { storeToRefs } from 'pinia'
import ConfigItem from './configItem.vue'

const resumeStore = useResumeStore()
const { currentUI } = storeToRefs(resumeStore)
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div
      class="mb-4 flex h-[60px] items-center border-b-[0.1px] border-sf-border px-6 text-lg font-bold text-sf-base"
    >
      页面配置
    </div>

    <div class="flex flex-col gap-6 px-6">
      <ConfigItem
        label="页边距"
        leftLabel="窄"
        rightLabel="宽"
        :max="paddingList.length - 1"
        v-model="currentUI.paddingIndex"
      />
      <ConfigItem
        label="字体大小"
        leftLabel="小"
        rightLabel="大"
        :max="fontList.length - 1"
        v-model="currentUI.fontIndex"
      />
      <ConfigItem
        label="行间距"
        leftLabel="密"
        rightLabel="疏"
        :max="lineHeightList.length - 1"
        v-model="currentUI.lineHeightIndex"
      />
      <!-- 主题色 -->
      <div>
        <div class="mb-4 text-base font-bold text-sf-text">主题色</div>
        <div class="flex flex-wrap gap-4">
          <div
            v-for="(color, index) in themeColors"
            :key="color.value"
            class="h-8 w-8 cursor-pointer rounded-full transition-all duration-200 hover:scale-110"
            :class="{
              'border-2 border-sf-base': currentUI.colorIndex == index,
            }"
            :style="{
              backgroundColor: color.value,
            }"
            @click="currentUI.colorIndex = index"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
