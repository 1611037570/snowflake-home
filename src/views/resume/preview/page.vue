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

// 使用 useRowInfo 获取每个模块的高度
const { rowList } = useRowInfo(measureRef)

// 分页逻辑
const pages = computed(() => {
  const result = []
  let currentPage = []
  let currentHeight = 0

  // A4 总高度 1123px
  // 减去内边距 (上下) 和 页码区域高度
  const padding = currentUI.value.padding || 0
  const footerHeight = 45 // 进一步增加预留给页码的高度，更安全
  const maxContentHeight = 1123 - padding * 2 - footerHeight - 10 // 额外减少 10px 缓冲

  rowList.value.forEach((row) => {
    // 如果加上当前模块高度超过一页，且当前页已有内容，则开启新的一页
    if (currentHeight + row.height > maxContentHeight && currentPage.length > 0) {
      result.push(currentPage)
      currentPage = []
      currentHeight = 0
    }

    // 存储 HTML 字符串以便渲染
    currentPage.push({
      html: row.element.outerHTML,
    })
    currentHeight += row.height
  })

  if (currentPage.length > 0) {
    result.push(currentPage)
  }

  // 如果没有任何模块，默认显示一页
  if (result.length === 0) {
    result.push([])
  }

  return result
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 隐藏的测量容器：用于 useRowInfo 读取高度 -->
    <div
      class="pointer-events-none absolute -z-10 opacity-0"
      :style="[paddingValue(), { width: '794px' }]"
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
        class="resume-page-item flex h-[1123px] w-[794px] flex-col rounded-lg bg-white text-black shadow-lg"
        :class="currentUI.fontFamily"
        :style="[paddingValue(), fontValue(), lineHeightValue()]"
      >
        <div v-for="(row, idx) in pageRows" :key="idx" v-html="row.html"></div>
        <div class="mt-auto text-center text-xs opacity-50">
          第 {{ pageIndex + 1 }} 页，共 {{ pages.length }} 页
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
