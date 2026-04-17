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
const o = computed(() => {
  return {
    paddingValue: paddingValue.value(),
    fontValue: fontValue.value(),
    lineHeightValue: lineHeightValue.value(),
  }
})
const { moduleList } = useRowInfo(measureRef, o, { selector: '.resume-module-wrapper' })

// 分页逻辑
const pages = computed(() => {
  const result = []
  let currentPage = []
  let currentHeight = 0

  const padding = currentUI.value.padding || 0
  const maxContentHeight = HEIGHT - padding * 2 - 32 // 减去内边距和页脚空间

  moduleList.value.forEach((group) => {
    const groupHeight = group.rows.reduce((sum, row) => sum + row.height, 0)

    // 如果整个组（模块）能完全放入当前页，就整个放入
    if (currentHeight + groupHeight <= maxContentHeight) {
      currentPage.push({
        moduleKey: group.moduleKey,
        visibleRowIndexes: group.rows.map((r) => r.index),
      })
      currentHeight += groupHeight
    } else {
      // 模块放不下，需要把内部的行拆分
      const remainingRows = [...group.rows]

      while (remainingRows.length > 0) {
        let sliceHeight = 0
        const sliceRows = []

        // 在当前页尽可能多地塞入行
        while (
          remainingRows.length > 0 &&
          currentHeight + sliceHeight + remainingRows[0].height <= maxContentHeight
        ) {
          const row = remainingRows.shift()
          sliceRows.push(row)
          sliceHeight += row.height
        }

        // 如果一行都没塞进去，说明这一行的高度比剩余空间大
        if (sliceRows.length === 0) {
          if (currentHeight > 0) {
            // 当前页已经有其他内容，翻页后再试
            result.push(currentPage)
            currentPage = []
            currentHeight = 0
            continue
          } else {
            // 当前页是空的，这一行比整页都高，只能硬塞进去
            const row = remainingRows.shift()
            sliceRows.push(row)
            sliceHeight += row.height
          }
        }

        currentPage.push({
          moduleKey: group.moduleKey,
          visibleRowIndexes: sliceRows.map((r) => r.index),
        })
        currentHeight += sliceHeight

        // 如果还有剩余行，说明当前页满了，需要翻页
        if (remainingRows.length > 0) {
          result.push(currentPage)
          currentPage = []
          currentHeight = 0
        }
      }
    }
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
      class="pointer-events-none absolute -z-10 flex flex-col opacity-0"
      ref="measureRef"
      :style="[paddingValue(), { width: `${WIDTH}px` }]"
    >
      <div
        v-for="item in allModules"
        :key="item.key"
        :data-module="item.key"
        class="resume-module-wrapper"
      >
        <ResumeModule :data="currentData" :name="item.key" />
      </div>
    </div>

    <!-- 实际渲染的分页内容 -->
    <template v-for="(pageSlices, pageIndex) in pages" :key="pageIndex">
      <div
        class="resume-page-item flex flex-col rounded-lg bg-white text-black shadow-lg"
        :class="[currentUI.fontFamily, `page-${pageIndex}`]"
        :style="[
          paddingValue(),
          fontValue(),
          lineHeightValue(),
          { width: `${WIDTH}px`, height: `${HEIGHT}px` },
        ]"
      >
        <div class="flex flex-1 flex-col">
          <div
            v-for="slice in pageSlices"
            :key="slice.moduleKey"
            class="resume-module-wrapper"
            :data-module="slice.moduleKey"
          >
            <ResumeModule :data="currentData" :name="slice.moduleKey" />
          </div>
        </div>
        <div class="pt-3 text-center text-xs opacity-50">
          第 {{ pageIndex + 1 }} 页，共 {{ pages.length }} 页
        </div>
      </div>
    </template>

    <component :is="'style'">
      <template v-for="(pageSlices, pageIndex) in pages" :key="'style-page-' + pageIndex">
        <template v-for="slice in pageSlices" :key="'style-slice-' + slice.moduleKey">
          .page-{{ pageIndex }} .resume-module-wrapper[data-module="{{ slice.moduleKey }}"] > div >
          div:not(
          <template v-for="(idx, i) in slice.visibleRowIndexes" :key="idx">
            :nth-child({{ idx + 1 }}){{ i < slice.visibleRowIndexes.length - 1 ? ',' : '' }}
          </template>
          ) { display: none !important; }
        </template>
      </template>
    </component>
  </div>
</template>

<style scoped></style>
