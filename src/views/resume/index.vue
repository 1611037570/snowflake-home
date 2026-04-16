<template>
  <div class="flex h-full w-full flex-col">
    <Header />
    <div class="w-full flex-1 overflow-hidden">
      <SfSplitter v-if="currentIndex >= 0">
        <SfSplitterPanel max="600" min="400">
          <Builder />
        </SfSplitterPanel>
        <SfSplitterPanel>
          <div class="bg-sf-bg-soft flex h-full flex-1 flex-col items-center overflow-hidden">
            <!-- 表单容器 -->
            <div ref="formContainer" class="scrollbar-hide w-full flex-1 overflow-y-auto">
              <Preview />
            </div>
          </div>
        </SfSplitterPanel>
        <SfSplitterPanel max="400" min="400">
          <Assistant />
        </SfSplitterPanel>
      </SfSplitter>
    </div>
  </div>
</template>

<script setup>
import { useResumeStore } from '@/stores'
import eventBus from '@/utils/modules/eventBus'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref } from 'vue'
import Assistant from './assistant/index.vue'
import Builder from './builder/index.vue'
import Header from './components/header.vue'
import Preview from './preview/index.vue'

const resumeStore = useResumeStore()
const { list, currentIndex } = storeToRefs(resumeStore)

function init() {
  if (!list.value.length) {
    resumeStore.addResume()
  }
  currentIndex.value = 0
}

onMounted(() => {
  init()
  eventBus.on('resume-print-pdf', printPDF)
})

onUnmounted(() => {
  eventBus.off('resume-print-pdf', printPDF)
})

// 表单容器引用
const formContainer = ref(null)
// 加载状态
const isLoading = ref(false)

/**
 * 将简历预览导出为PDF文件
 * 利用 ResumePage 已生成的分页结构直接导出
 */
const printPDF = async () => {
  if (!formContainer.value) {
    console.error('表单容器未找到')
    return
  }

  isLoading.value = true

  try {
    // 动态导入PDF相关库
    const { snapdom } = await import('@zumer/snapdom')
    const { default: jsPDF } = await import('jspdf')

    // 查找所有已分页的页面元素
    const pages = formContainer.value.querySelectorAll('.resume-page-item')
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
    }

    // 清理临时容器
    document.body.removeChild(tempContainer)

    // 保存PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    pdf.save(`简历导出-${timestamp}.pdf`)

    console.log(`成功导出 ${pages.length} 页 PDF`)
  } catch (error) {
    console.error('生成PDF失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped></style>

<style></style>
