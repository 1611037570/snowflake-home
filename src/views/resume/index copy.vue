<template>
  <div class="flex h-full w-full">
    <div class="h-full w-1/2 bg-amber-100"></div>
    <div class="h-full w-1/2 bg-amber-400">
      <el-button
        type="primary"
        @click="printFormToPDF"
        :loading="isLoading"
        icon="el-icon-download"
      >
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
const printFormToPDF = async () => {
  if (!previewContainer.value) {
    console.error('表单容器未找到')
    return
  }

  isLoading.value = true

  try {
    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // 提取页面中的超链接及其位置信息
    const hyperlinks = []
    const linkElements = previewContainer.value?.querySelectorAll('a[data-pdf-link]')
    if (linkElements && linkElements.length) {
      linkElements.forEach((link) => {
        const href = link.getAttribute('data-pdf-link')
        const text = link.textContent.trim()
        if (href && text) {
          // 获取元素在页面中的位置信息
          const rect = link.getBoundingClientRect()
          const formRect = previewContainer.value.getBoundingClientRect()

          // 计算相对位置（相对于表单容器）
          const relativeX = rect.left - formRect.left
          const relativeY = rect.top - formRect.top
          const width = rect.width
          const height = rect.height

          hyperlinks.push({
            text,
            href,
            x: relativeX,
            y: relativeY,
            width,
            height,
          })
        }
      })
    }

    // 创建一个新的canvas，捕获表单内容
    const canvas = await html2canvas(previewContainer.value, {
      scale: 2, // 提高清晰度
      useCORS: true, // 允许跨域图片
      logging: false, // 禁用日志
      backgroundColor: '#ffffff', // 设置背景色
    })

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

    // 添加超链接到PDF
    // 根据实际位置和缩放比例计算PDF中的坐标
    hyperlinks.forEach((link) => {
      // 计算在PDF中的位置（考虑缩放比例）
      const pdfX = (link.x * imgWidth) / previewContainer.value.offsetWidth
      const pdfY = (link.y * imgHeight) / previewContainer.value.offsetHeight
      const pdfWidth = (link.width * imgWidth) / previewContainer.value.offsetWidth
      const pdfHeight = (link.height * imgHeight) / previewContainer.value.offsetHeight

      // 添加链接注释 - 参数顺序：x, y, width, height
      pdf.link(pdfX, pdfY, pdfWidth, pdfHeight, {
        url: link.href,
      })
    })

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

    console.log('PDF生成成功，超链接已添加')
  } catch (error) {
    console.error('生成PDF失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped></style>
