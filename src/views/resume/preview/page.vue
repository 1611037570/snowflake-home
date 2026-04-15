<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, inject, ref } from 'vue'
import ResumeModule from './modules/index.vue'
import { useRowInfo } from './useRowInfo'

defineOptions({ name: 'ResumePage' })

const resumeStore = useResumeStore()
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore)

const paddingValue = inject('paddingValue')
const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')

// 测量容器引用
const measureRef = ref(null)

// 合并所有模块字段
const allModules = computed(() => [
  ...currentFixedConfig.value.fields,
  ...currentConfig.value.fields,
])
const WIDTH = 794
const HEIGHT = 1123
// 使用 useRowInfo 获取每个模块的高度
const { rowList } = useRowInfo(measureRef)

// 分页逻辑
const pages = computed(() => {
  const result = []
  let currentPage = []
  let currentHeight = 0

  const padding = currentUI.value.padding || 0
  const maxContentHeight = HEIGHT - padding * 2 - 32 // 减去内边距和页脚空间

  rowList.value.forEach((row) => {
    // 若当前行加入后超出单页高度，且当前页已有内容，则存入结果并重置
    if (currentHeight + row.height > maxContentHeight && currentPage.length > 0) {
      result.push(currentPage)
      currentPage = []
      currentHeight = 0
    }

    currentPage.push({
      html: row.html,
    })
    currentHeight += row.height
  })

  // 补录最后一页
  if (currentPage.length > 0 || result.length === 0) {
    result.push(currentPage)
  }

  return result
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 隐藏的测量容器：用于 useRowInfo 读取高度 -->
    <div
      class="pointer-events-none absolute -z-10 opacity-0"
      :style="[paddingValue(), { width: `${WIDTH}px` }]"
    >
      <div ref="measureRef" class="flex flex-col" :style="[fontValue(), lineHeightValue()]">
        <ResumeModule
          v-for="item in allModules"
          :key="item.key"
          :data="currentData"
          :name="item.key"
        />
      </div>
    </div>

    <!-- 实际渲染的分页内容 -->
    <template v-for="(pageRows, pageIndex) in pages" :key="pageIndex">
      <div
        class="resume-page-item flex flex-col rounded-lg bg-white text-black shadow-lg"
        :class="currentUI.fontFamily"
        :style="[
          paddingValue(),
          fontValue(),
          lineHeightValue(),
          { width: `${WIDTH}px`, height: `${HEIGHT}px` },
        ]"
      >
        <div class="flex flex-1 flex-col overflow-hidden">
          <div v-for="(row, idx) in pageRows" :key="idx" v-html="row.html"></div>
        </div>
        <div class="pt-3 text-center text-xs opacity-50">
          第 {{ pageIndex + 1 }} 页，共 {{ pages.length }} 页
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
