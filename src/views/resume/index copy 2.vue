<template>
  <div class="flex h-full w-full">
    <div class="h-full w-1/2 bg-amber-100"></div>
    <div class="h-full w-1/2 bg-amber-400">
      <el-button type="primary" @click="printPDF" :loading="isLoading" icon="el-icon-download">
        打印表单PDF </el-button
      >1
      <preview ref="previewContainer" />
    </div>
    <!-- <div class="bg-white p-4 rounded-lg shadow-md">
      <div ref="formContainer">
        <div class="hyperlink-wrapper">
          <a href="https://www.baidu.com" target="_blank" data-pdf-link="https://www.baidu.com"
            >我是超级链接</a
          >
        </div>
        <dynamic-form />
      </div>
    </div> -->
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ref } from 'vue'
import preview from './preview.vue'

// 表单容器引用
const previewContainer = ref(null)
// 加载状态
const isLoading = ref(false)

/**
 * 将表单打印为PDF文件
 */
const printPDF = async () => {
  isLoading.value = true

  try {
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // 检查预览容器是否存在
    if (!previewContainer.value) {
      console.error('表单容器未找到')
      throw new Error('表单容器未找到')
    }

    // 检查元素是否已附加到文档中
    const isAttached = document.body.contains(previewContainer.value)

    // 创建一个用于渲染的元素
    let renderElement = previewContainer.value
    let cleanupFn = null

    if (!isAttached) {
      // 如果元素未附加到文档，创建一个克隆并添加到文档中
      renderElement = document.createElement('div')
      renderElement.style.position = 'absolute'
      renderElement.style.left = '-9999px'
      renderElement.style.top = '-9999px'
      renderElement.style.width = '100%'
      renderElement.style.height = 'auto'

      // 尝试克隆内容
      try {
        // 克隆原始元素的内容
        if (previewContainer.value.innerHTML) {
          renderElement.innerHTML = previewContainer.value.innerHTML
          // 复制样式类名
          renderElement.className = previewContainer.value.className
        }
      } catch (e) {
        console.warn('无法克隆预览内容，使用默认样式', e)
      }

      // 添加到文档中
      document.body.appendChild(renderElement)

      // 设置清理函数
      cleanupFn = () => {
        if (document.body.contains(renderElement)) {
          document.body.removeChild(renderElement)
        }
      }
    }

    // 使用setTimeout确保DOM更新完成
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 创建canvas，捕获表单内容
    const canvas = await html2canvas(renderElement, {
      scale: 2, // 提高清晰度
      useCORS: true, // 允许跨域图片
      logging: false, // 禁用日志
      backgroundColor: '#ffffff', // 设置背景色
      allowTaint: true, // 允许可能导致污染的图像
      removeContainer: false, // 不自动移除克隆的DOM元素
      ignoreElements: (element) => {
        // 忽略可能导致问题的元素
        return element.style.display === 'none' || element.hidden
      },
    })

    // 清理临时元素
    if (cleanupFn) {
      cleanupFn()
    }

    // 获取canvas的宽度和高度
    const imgWidth = 210 // A4宽度(mm)
    const pageHeight = 297 // A4高度(mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    // 生成图片数据URL
    const imgData = canvas.toDataURL('image/png')

    // 添加图片到PDF
    let position = 0
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // 如果内容超过一页，添加更多页面
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // 保存PDF文件
    const fileName = `表单-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    console.log('PDF生成成功')
  } catch (error) {
    console.error('生成PDF失败:', error)
    // 这里可以添加用户友好的错误提示，例如使用Element Plus的message组件
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped></style>
