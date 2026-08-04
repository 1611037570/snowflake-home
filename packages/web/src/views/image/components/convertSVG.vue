<template>
  <div class="container" v-if="0">
    <div class="main-content">
      <!-- 控制面板 -->
      <div class="control-panel">
        <h2 class="panel-title"><i class="fas fa-sliders-h"></i> 转换设置</h2>

        <!-- 文件上传区域 -->
        <div class="file-upload-area" @click="triggerFileInput">
          <p>点击或拖放 SVG 文件到这里</p>
          <!-- 绑定 ref 替代 id -->
          <input
            type="file"
            ref="fileInputRef"
            class="file-input"
            accept=".svg"
            @change="handleFileSelect"
          />
          <div class="file-info">{{ fileName }}</div>
        </div>

        <!-- 格式信息（固定为PNG） -->
        <div class="format-info">
          <div class="format-icon">
            <i class="fas fa-image"></i>
          </div>
          <div class="format-name">PNG 格式</div>
          <div class="format-desc">无损格式，支持透明背景，质量固定为100%</div>
        </div>

        <!-- 尺寸控制 -->
        <div class="size-control">
          <div>
            <label for="widthInput">宽度 (px)</label>
            <input
              type="number"
              id="widthInput"
              class="size-input"
              v-model.number="width"
              min="10"
              max="5000"
            />
          </div>
          <div>
            <label for="heightInput">高度 (px)</label>
            <input
              type="number"
              id="heightInput"
              class="size-input"
              v-model.number="height"
              min="10"
              max="5000"
            />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn btn-primary" @click="convertSVG" :disabled="!svgContent">
            <i class="fas fa-sync-alt btn-icon"></i> 转换为 PNG
          </button>
          <button class="btn btn-secondary" @click="resetConverter">
            <i class="fas fa-redo btn-icon"></i> 重置
          </button>
        </div>
      </div>

      <!-- 预览面板 -->
      <div class="preview-panel">
        <h2 class="panel-title"><i class="fas fa-eye"></i> 预览</h2>

        <div class="preview-container">
          <!-- 预览区域 -->
          <div class="preview-area">
            <div id="svgPreviewContainer">
              <!-- SVG 预览（上传后显示） -->
              <svg
                ref="svgPreviewRef"
                class="svg-preview"
                v-html="svgPreviewContent"
                v-show="!showCanvasPreview && svgContent"
              ></svg>

              <!-- Canvas 预览（转换后显示） -->
              <canvas
                ref="canvasPreviewRef"
                class="canvas-preview"
                v-show="showCanvasPreview"
              ></canvas>
            </div>
          </div>

          <!-- 下载信息（转换成功后显示） -->
          <div class="download-info" v-if="showDownloadInfo">
            <h3>转换完成！</h3>
            <p>文件大小: {{ fileSize }}</p>
            <a class="download-link" :href="downloadUrl" :download="downloadFileName">
              <i class="fas fa-download"></i> 下载 PNG 文件
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// ========== 响应式数据 ==========
// SVG 文件内容
const svgContent = ref('')

// 输出尺寸
const width = ref(800)
const height = ref(600)

// 文件名信息
const fileName = ref('')

// SVG 预览内容
const svgPreviewContent = ref('')

// 是否显示 Canvas 预览
const showCanvasPreview = ref(false)

// 是否显示下载信息
const showDownloadInfo = ref(false)

// 下载链接 URL
const downloadUrl = ref('#')

// 下载文件名
const downloadFileName = ref('')

// 文件大小
const fileSize = ref('0 KB')

// ========== DOM 引用（替代 getElementById） ==========
const fileInputRef = ref(null)
const svgPreviewRef = ref(null)
const canvasPreviewRef = ref(null)

// ========== 计算属性 ==========
// 计算当前文件名（不含扩展名）
const currentFileName = computed(() => {
  // 从文件名中提取不带扩展名的部分
  const fullName = fileName.value.replace('已选择: ', '').split(' ')[0] || ''
  return fullName.replace('.svg', '') || 'converted'
})

// ========== 方法定义 ==========
/**
 * 触发文件输入框点击
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * 处理文件选择
 * @param {Event} event - 文件选择事件
 */
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    readSVGFile(file)
  }
}

/**
 * 读取 SVG 文件内容
 * @param {File} file - SVG 文件对象
 */
const readSVGFile = (file) => {
  // 检查文件大小（限制 5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('文件大小超过 5MB 限制')
    return
  }

  // 显示文件名和大小
  fileName.value = `已选择: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`

  // 创建 FileReader 读取文件内容
  const reader = new FileReader()

  reader.onload = (e) => {
    // 保存 SVG 内容
    svgContent.value = e.target.result

    // 预览 SVG
    previewSVG(svgContent.value)
  }

  // 读取文件为文本
  reader.readAsText(file)
}

/**
 * 预览 SVG 内容（优化：精准获取根 SVG 元素）
 * @param {string} svgContent - SVG 文件内容
 */
const previewSVG = (svgContent) => {
  try {
    // 改用 DOMParser 规范解析 SVG 文档
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')

    // 检查解析是否出错
    if (svgDoc.querySelector('parsererror')) {
      throw new Error('SVG 文件格式错误，解析失败')
    }

    // 精准获取根级 SVG 元素（而非第一个 svg 元素）
    const svgElement = svgDoc.documentElement
    if (svgElement.tagName !== 'svg') {
      throw new Error('SVG 文件中未找到根级 <svg> 元素')
    }

    // 尝试获取 SVG 的原始尺寸（处理各种尺寸定义方式）
    const getNumericValue = (attr) => {
      const value = svgElement.getAttribute(attr)
      if (!value) return null
      // 移除单位（如 px、em 等），只保留数字
      const numericValue = parseFloat(value.replace(/[^\d.]/g, ''))
      return isNaN(numericValue) ? null : numericValue
    }

    const originalWidth = getNumericValue('width') || svgElement.viewBox?.split(' ')[2] || 800
    const originalHeight = getNumericValue('height') || svgElement.viewBox?.split(' ')[3] || 600

    // 更新宽度和高度输入框的值
    width.value = parseInt(originalWidth) || 800
    height.value = parseInt(originalHeight) || 600

    // 设置 SVG 预览内容（保留根元素的属性）
    const cloneSvg = svgElement.cloneNode(true)
    svgPreviewContent.value = cloneSvg.outerHTML

    // 重置下载信息和 Canvas 预览
    showDownloadInfo.value = false
    showCanvasPreview.value = false
  } catch (error) {
    console.error('SVG 预览失败:', error)
    alert(`SVG 预览失败: ${error.message}`)
  }
}

/**
 * 转换 SVG 为 PNG 格式
 */
const convertSVG = async () => {
  // 检查是否有 SVG 内容
  if (!svgContent.value) {
    alert('请先上传 SVG 文件')
    return
  }

  try {
    // 使用 ref 获取 Canvas 元素（替代 getElementById）
    const canvas = canvasPreviewRef.value
    if (!canvas) throw new Error('Canvas 元素未找到')

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文')

    // 设置 Canvas 尺寸
    canvas.width = width.value
    canvas.height = height.value

    // 创建 Image 对象
    const img = new Image()
    // 关闭跨域限制（避免 SVG 内外部资源导致的跨域问题）
    img.crossOrigin = 'anonymous'

    // 将 SVG 内容转换为 Data URL
    const svgBlob = new Blob([svgContent.value], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    // 等待图片加载完成
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = (err) => reject(new Error(`SVG 图片加载失败: ${err.message}`))
      img.src = svgUrl
    })

    // 清空画布（PNG 支持透明背景）
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制 SVG 到 Canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // 显示 Canvas 预览
    showCanvasPreview.value = true

    // 将 Canvas 转换为 PNG Blob（质量固定为100%）
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 1.0) // 明确指定质量 1.0
    })

    // 计算文件大小
    const sizeInKB = (blob.size / 1024).toFixed(1)
    fileSize.value = `${sizeInKB} KB`

    // 创建下载链接（并清理旧的 URL）
    if (downloadUrl.value !== '#') {
      URL.revokeObjectURL(downloadUrl.value)
    }
    downloadUrl.value = URL.createObjectURL(blob)
    downloadFileName.value = `${currentFileName.value}_${width.value}x${height.value}.png`

    // 显示下载信息
    showDownloadInfo.value = true

    // 清理 SVG URL 对象
    URL.revokeObjectURL(svgUrl)
  } catch (error) {
    console.error('转换失败:', error)
    alert(`转换失败: ${error.message}`)
  }
}

/**
 * 重置转换器状态
 */
const resetConverter = () => {
  // 清空所有响应式数据
  svgContent.value = ''
  fileName.value = ''
  svgPreviewContent.value = ''
  showCanvasPreview.value = false
  showDownloadInfo.value = false

  // 清理下载链接 URL
  if (downloadUrl.value !== '#') {
    URL.revokeObjectURL(downloadUrl.value)
  }
  downloadUrl.value = '#'
  downloadFileName.value = ''
  fileSize.value = '0 KB'

  // 重置尺寸
  width.value = 800
  height.value = 600

  // 重置文件输入框（使用 ref）
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.main-content {
  display: flex;
  flex-wrap: wrap;
  padding: 30px;
}

.control-panel {
  flex: 1;
  min-width: 300px;
  padding-right: 30px;
  border-right: 1px solid #eee;
}

.preview-panel {
  flex: 2;
  min-width: 300px;
  padding-left: 30px;
}

.panel-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2ecc71;
  display: flex;
  align-items: center;
}

.panel-title i {
  margin-right: 10px;
  font-size: 1.8rem;
}

.file-upload-area {
  border: 2px dashed #2ecc71;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-area:hover {
  background-color: #f0fff4;
  border-color: #27ae60;
}

.upload-icon {
  font-size: 3rem;
  color: #2ecc71;
  margin-bottom: 15px;
}

.file-input {
  display: none;
}

.file-info {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
}

.format-info {
  background-color: #f0fff4;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
  border: 1px solid #d5f5e3;
}

.format-icon {
  font-size: 2.5rem;
  color: #ff6b35;
  margin-bottom: 10px;
}

.format-name {
  font-weight: 600;
  margin-bottom: 5px;
  color: #2ecc71;
}

.format-desc {
  font-size: 0.9rem;
  color: #777;
}

.size-control {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 30px;
}

.size-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.size-input:focus {
  outline: none;
  border-color: #2ecc71;
}

.preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-area {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #f9f9f9;
}

.svg-preview {
  max-width: 100%;
  max-height: 300px;
  padding: 20px;
}

.canvas-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hidden {
  display: none;
}

.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 25px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(to right, #2ecc71, #27ae60);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 15px rgba(46, 204, 113, 0.3);
}

.btn-secondary {
  background-color: #f0fff4;
  color: #2ecc71;
}

.btn-secondary:hover {
  background-color: #e4f7ed;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.download-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8fff9;
  border-radius: 10px;
  border-left: 4px solid #2ecc71;
}

.download-link {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #2ecc71;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.download-link:hover {
  background-color: #27ae60;
}

.btn-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}
</style>
