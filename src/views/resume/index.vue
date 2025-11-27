<template>
  <SfViewContainer title="在线简历制作">
    <div class="flex h-full w-full">
      <div class="h-full w-1/2 bg-amber-100">
        <Builder />
      </div>
      <div class="h-full w-1/2 bg-amber-400">
        <ElButton type="primary" @click="printPDF" :loading="isLoading" icon="el-icon-download">
          打印表单PDF
        </ElButton>
        <!-- 表单容器 -->
        <div ref="formContainer">
          <Preview />
        </div>
      </div>
    </div>
  </SfViewContainer>
</template>

<script setup>
import { defineAsyncComponent, ref } from 'vue'

// 懒加载组件
const Builder = defineAsyncComponent(() => import('./builder.vue'))
const Preview = defineAsyncComponent(() => import('./preview.vue'))

// 表单容器引用
const formContainer = ref(null)
// 加载状态
const isLoading = ref(false)

/**
 * 将表单打印为PDF文件 - 延迟加载PDF相关库以优化初始加载性能
 */
const printPDF = async () => {
  if (!formContainer.value) {
    console.error('表单容器未找到')
    return
  }

  isLoading.value = true

  try {
    // 动态导入PDF相关库
    const { default: html2canvas } = await import('html2canvas')
    const { default: jsPDF } = await import('jspdf')

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // 计算A4尺寸（mm）
    const pageWidth = 210
    const pageHeight = 297
    const margin = 5 // 减小边距，使其更接近原始页面

    // 获取所有子元素
    const elements = Array.from(formContainer.value.children)
    const originalStyles = [] // 保存原始样式

    // 临时创建一个容器用于测量和渲染
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = `${pageWidth}mm`
    tempContainer.style.padding = '0mm'
    tempContainer.style.backgroundColor = '#ffffff'
    tempContainer.style.pageBreakInside = 'avoid'
    document.body.appendChild(tempContainer)

    // 为每个元素设置分页保护样式
    elements.forEach((element) => {
      originalStyles.push({
        element,
        pageBreakInside: element.style.pageBreakInside,
        pageBreakAfter: element.style.pageBreakAfter,
      })
      element.style.pageBreakInside = 'avoid'
      element.style.pageBreakAfter = 'auto'
    })

    // 处理单页内容的函数
    const processPage = async (pageElements) => {
      // 清空并填充临时容器
      tempContainer.innerHTML = ''
      pageElements.forEach((el) => {
        tempContainer.appendChild(el.cloneNode(true))
      })

      // 渲染到canvas，优化样式和清晰度
      const canvas = await html2canvas(tempContainer, {
        scale: 2.5, // 提高清晰度，使PDF输出更细腻
        useCORS: true, // 允许跨域图片
        logging: false, // 禁用日志
        backgroundColor: '#ffffff', // 设置背景色
        letterRendering: true, // 优化文字渲染
        allowTaint: true, // 允许渲染所有内容
        imageTimeout: 15000, // 增加图片加载超时时间
        removeContainer: false, // 手动管理容器移除
      })

      // 添加到PDF
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth // 使用完整页面宽度
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight) // 从页面左上角开始
    }

    // 逐元素测量并智能分页
    let currentPageElements = []
    let currentPageHeight = 0
    const safetyMargin = 2 // 额外的安全边界

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]

      // 创建元素克隆并测量其高度
      const clone = element.cloneNode(true)
      tempContainer.innerHTML = ''
      tempContainer.appendChild(clone)

      // 转换px到mm（假设96dpi）
      const elementHeight = (clone.offsetHeight / 96) * 25.4

      // 预测下一个元素的高度（如果有的话）
      let nextElementHeight = 0
      if (i + 1 < elements.length) {
        const nextClone = elements[i + 1].cloneNode(true)
        tempContainer.innerHTML = ''
        tempContainer.appendChild(nextClone)
        nextElementHeight = (nextClone.offsetHeight / 96) * 25.4
      }

      // 检查添加当前元素后是否会导致下一个元素放不下
      if (
        currentPageHeight + elementHeight + nextElementHeight + safetyMargin >
          pageHeight - margin &&
        i + 1 < elements.length
      ) {
        // 将当前元素放到新页面，确保下一个元素不会被分割
        if (currentPageElements.length > 0) {
          await processPage(currentPageElements)
          pdf.addPage()
          currentPageElements = []
          currentPageHeight = 0
        }
      }

      // 如果元素本身太大，需要单独一页
      if (elementHeight > pageHeight - margin * 2) {
        if (currentPageElements.length > 0) {
          await processPage(currentPageElements)
          pdf.addPage()
          currentPageElements = []
          currentPageHeight = 0
        }
      }

      // 添加元素到当前页
      currentPageElements.push(element)
      currentPageHeight += elementHeight

      // 如果当前页已满，处理并创建新页
      if (currentPageHeight > pageHeight - margin) {
        await processPage(currentPageElements)
        pdf.addPage()
        currentPageElements = []
        currentPageHeight = 0
      }
    }

    // 处理最后一页
    if (currentPageElements.length > 0) {
      await processPage(currentPageElements)
    }

    // 清理
    document.body.removeChild(tempContainer)

    // 恢复原始样式
    originalStyles.forEach((styleInfo) => {
      styleInfo.element.style.pageBreakInside = styleInfo.pageBreakInside
      styleInfo.element.style.pageBreakAfter = styleInfo.pageBreakAfter
    })

    // 保存PDF文件
    const fileName = `表单-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    console.log('PDF生成成功，实现了逐行分页，确保文字不会被分割在两页之间')
  } catch (error) {
    console.error('生成PDF失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped></style>
