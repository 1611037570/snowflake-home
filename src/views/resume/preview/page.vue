<script setup>
import { useResumeStore } from '@/stores'
import eventBus from '@/utils/modules/eventBus'
import { storeToRefs } from 'pinia'
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { resumeTitle } from '../utils'
import MeasureContent from './components/measureContent.vue'
import ModuleActions from './components/moduleActions.vue'
import ResumeModule from './modules/index.vue'
import { useRowInfo } from './useRowInfo'

defineOptions({ name: 'ResumePage' })

const resumeStore = useResumeStore()
const { currentData, currentConfig, currentUI, currentFixedConfig, selectedModuleKeys } =
  storeToRefs(resumeStore)

const paddingValue = inject('paddingValue')
const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')
// 测量容器引用
const measureRef = ref(null)

// 合并所有模块字段
const allModules = computed(() => {
  const fixedModules = currentFixedConfig.value.fields
  const configModules = currentConfig.value.fields
  return [...fixedModules, ...configModules]
})
const WIDTH = 794
const HEIGHT = 1123
const MODULE_GAP = 12
const o = computed(() => {
  return {
    paddingValue: paddingValue.value(),
    fontValue: fontValue.value(),
    lineHeightValue: lineHeightValue.value(),
  }
})
const { moduleList } = useRowInfo(measureRef, o, { selector: '.resume-module-wrapper' })

// 点击获取模块信息
const handleModuleClick = (slice) => {
  const key = slice.moduleKey
  // 存在则删除，不存在则添加 (实现 toggle)
  if (selectedModuleKeys.value.has(key)) {
    selectedModuleKeys.value.delete(key)
  } else {
    selectedModuleKeys.value.add(key)
  }
}

// 分页逻辑
const pages = computed(() => {
  const result = []
  let currentPage = []
  let currentHeight = 0

  const padding = currentUI.value.padding || 0
  const maxContentHeight = HEIGHT - padding * 2 - 32 // 减去内边距和页脚空间

  moduleList.value.forEach((group) => {
    const groupHeight =
      group.rows.reduce((sum, row) => sum + row.height, 0) +
      (currentPage.length > 0 ? MODULE_GAP : 0)

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
        const sliceGapHeight = currentPage.length > 0 ? MODULE_GAP : 0

        // 在当前页尽可能多地塞入行
        while (
          remainingRows.length > 0 &&
          currentHeight + sliceGapHeight + sliceHeight + remainingRows[0].height <= maxContentHeight
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
        currentHeight += sliceGapHeight + sliceHeight

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

const getPageStyle = (pageSlices, pageIndex) => {
  return pageSlices
    .map((slice) => {
      const visibleSelectors = slice.visibleRowIndexes
        .map((idx) => `:nth-child(${idx + 1})`)
        .join(',')
      return `.page-${pageIndex} .resume-module-wrapper[data-module="${slice.moduleKey}"] > .resume-row > :not(${visibleSelectors}) { display: none !important; }`
    })
    .join('\n')
}

/**
 * 将简历预览导出为PDF文件
 * 利用 ResumePage 已生成的分页结构直接导出
 */
const printPDF = async () => {
  try {
    // 确保DOM已渲染完成
    await nextTick()
    await document.fonts?.ready
    // 动态导入PDF相关库
    const { snapdom } = await import('@zumer/snapdom')
    const { default: jsPDF } = await import('jspdf')

    // 查找所有已分页的页面元素
    const pages = document.querySelectorAll('.resume-page-item')
    if (pages.length === 0) {
      console.error('未找到可打印的简历页面')
      return
    }

    // 创建PDF文档 (A4尺寸)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = 210
    const pageHeight = 297

    // 创建隐藏的临时容器用于渲染 (防止缩放干扰)
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.top = '-9999px'
    tempContainer.style.left = '-9999px'
    tempContainer.style.width = '794px' // A4 96dpi 宽度
    document.body.appendChild(tempContainer)

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i]

      // 克隆页面并清除可能干扰渲染的样式 (如阴影、圆角)
      const clone = pageEl.cloneNode(true)
      clone.style.boxShadow = 'none'
      clone.style.borderRadius = '0'
      clone.style.margin = '0'
      clone.style.transform = 'none'
      clone.style.zoom = '1'

      tempContainer.innerHTML = ''
      tempContainer.appendChild(clone)

      // 渲染页面为 Canvas
      const canvas = await snapdom.toCanvas(clone, {
        scale: 2, // 提高清晰度
        backgroundColor: '#ffffff',
        embedFonts: true,
        width: 794,
        height: 1123,
      })

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.error(`第 ${i + 1} 页渲染失败`)
        continue
      }

      const imgData = canvas.toDataURL('image/png')

      // 如果不是第一页，添加新页面
      if (i > 0) {
        pdf.addPage()
      }

      // 将图片填满整个PDF页面
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')

      // 提取并添加超链接
      const cloneRect = clone.getBoundingClientRect()
      const links = clone.querySelectorAll('a')
      const scaleFactor = pageWidth / 794

      links.forEach((link) => {
        const linkRect = link.getBoundingClientRect()
        const href = link.getAttribute('href')
        if (href) {
          pdf.link(
            (linkRect.left - cloneRect.left) * scaleFactor,
            (linkRect.top - cloneRect.top) * scaleFactor,
            linkRect.width * scaleFactor,
            linkRect.height * scaleFactor,
            { url: href },
          )
        }
      })
    }

    // 清理临时容器
    document.body.removeChild(tempContainer)

    // 保存PDF
    pdf.save(`${resumeTitle.value}.pdf`)

    console.log(`成功导出 ${pages.length} 页 PDF`)
  } catch (error) {
    console.error('生成PDF失败:', error)
  }
}

onMounted(() => {
  eventBus.on('resume-print-pdf', printPDF)
})

onUnmounted(() => {
  eventBus.off('resume-print-pdf', printPDF)
})
</script>

<template>
  <div class="mb-3 flex flex-col">
    <!-- 隐藏的测量容器：用于 useRowInfo 读取高度 -->
    <MeasureContent
      class="absolute -z-10 opacity-0"
      ref="measureRef"
      :style="[paddingValue(), { width: `${WIDTH}px` }]"
      :current-data="currentData"
      :all-modules="allModules"
    />

    <!-- 实际渲染的分页内容 -->
    <div
      v-for="(pageSlices, pageIndex) in pages"
      :key="pageIndex"
      class="resume-page-item mx-3 mt-3 flex flex-col rounded-xl bg-white text-black shadow-lg"
      :class="[currentUI.fontFamily, `page-${pageIndex}`]"
      :style="[
        paddingValue(),
        fontValue(),
        lineHeightValue(),
        { width: `${WIDTH}px`, height: `${HEIGHT}px` },
      ]"
    >
      <div class="flex flex-1 flex-col gap-3">
        <div
          v-for="slice in pageSlices"
          :key="slice.moduleKey"
          class="resume-module-wrapper group relative rounded-xl hover:outline-2 hover:outline-gray-300 hover:outline-dashed"
          :class="{
            'rounded-xl bg-sf-theme-hover/10 outline-2 outline-sf-theme-hover outline-dashed hover:outline-sf-theme-hover':
              selectedModuleKeys.has(slice.moduleKey),
          }"
          :data-module="slice.moduleKey"
        >
          <!-- 操作按钮 -->
          <ModuleActions
            :selected="selectedModuleKeys.has(slice.moduleKey)"
            @select="handleModuleClick(slice)"
          />
          <ResumeModule :data="currentData" :name="slice.moduleKey" />
        </div>
      </div>
      <div class="pt-3 text-center text-xs opacity-50">
        第 {{ pageIndex + 1 }} 页，共 {{ pages.length }} 页
      </div>

      <component :is="'style'">{{ getPageStyle(pageSlices, pageIndex) }}</component>
    </div>
  </div>
</template>

<style scoped></style>
