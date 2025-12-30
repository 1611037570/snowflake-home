<template>
  <SfViewContainer>
    <div class="relative flex h-full w-full items-center justify-center bg-sf-modal p-2">
      <el-splitter
        class="mr-2! h-full flex-1"
        v-if="selectedFile"
        :class="[show || live ? 'flex' : 'hidden!']"
      >
        <el-splitter-panel :size="previewVisible ? '50%' : '100%'" min="20%" v-if="show">
          <Preview :data="original" :label="$t('image.original')" />
        </el-splitter-panel>
        <el-splitter-panel
          v-if="previewVisible"
          :size="previewVisible ? '50%' : '0%'"
          :resizable="previewVisible"
          min="20%"
        >
          <Preview :data="converted" :label="$t('image.previewLabel')" />
        </el-splitter-panel>
      </el-splitter>
      <ImageSelector
        v-else-if="!selectedFile"
        @file-selected="handleFileSelected"
        @select-click="open({ accept: 'image/*', multiple: false })"
      />
      <ElScrollbar
        v-if="!loading"
        class="relative h-full min-w-75 flex-col gap-4 overflow-hidden rounded-xl border border-sf-theme-hover bg-sf-primary p-3 transition-all hover:border-sf-theme hover:shadow-xl"
      >
        <!-- 已选择图片时的状态 -->
        <div class="mb-3 rounded-lg bg-sf-primary-hover/50 p-3 text-center">
          <div
            class="mb-2 max-w-full truncate text-sm font-medium text-sf-base"
            :title="selectedFile.name"
          >
            {{ selectedFile.name }}
          </div>
          <button
            class="inline-flex cursor-pointer items-center gap-1 rounded-md bg-sf-theme-hover/10 px-2.5 py-1 text-xs font-semibold text-sf-theme transition-colors hover:bg-sf-theme-hover/20"
            @click="open({ accept: 'image/*', multiple: false })"
          >
            <span>{{ $t('image.changeImage') }}</span>
          </button>
        </div>
        <!-- 推荐设置 -->
        <Presets
          :initial-w="original.width"
          :initial-h="original.height"
          @apply="handleApplyPreset"
        />
        <SizeAdjust
          :initial-w="original.width"
          :initial-h="original.height"
          v-model:width="converted.width"
          v-model:height="converted.height"
        />
        <FormatAdjust
          :default-format="original.format"
          :default-quality="original.quality"
          v-model:format="converted.format"
          v-model:quality="converted.quality"
        />

        <Worktop @save="save" v-model:show="show" v-model:live="live" />
        <Intro />
        <div
          v-if="isConverting"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md"
        >
          <div
            class="flex items-center gap-2 rounded-lg border border-sf-theme-hover bg-sf-primary px-4 py-3 text-sf-base shadow-lg"
          >
            <SfIcon
              name="line-md:loading-twotone-loop"
              class="animate-spin text-xl text-sf-theme"
            />
            <span class="text-sm font-medium">{{ $t('image.processing') }}</span>
          </div>
        </div>
      </ElScrollbar>
    </div>
  </SfViewContainer>
</template>

<script setup>
// 导入自 '@/utils' 的辅助函数
import { getFormat, toMime } from '@/utils'
// 导入 pica 库，用于高质量的图片缩放和格式转换
import pica from 'pica'
// 导入 FormatAdjust.vue 子组件 - 格式调整组件
import FormatAdjust from './components/formatAdjust.vue'
// 导入 ImageSelector.vue 子组件 - 图片选择器组件
import ImageSelector from './components/imageSelector.vue'
// 导入 Preview.vue 子组件 - 图片预览组件
import Preview from './components/preview.vue'
// 导入 SizeAdjust.vue 子组件 - 尺寸调整组件
import SizeAdjust from './components/sizeAdjust.vue'
// 导入 Worktop.vue 子组件 - 工作顶部组件
import Worktop from './components/worktop.vue'
// 导入 Intro.vue 子组件 - 介绍说明组件
import Intro from './components/intro.vue'
// 导入 Presets.vue 子组件 - 推荐设置组件
import Presets from './components/presets.vue'
// 导入 emptyImageData 函数 - 空图片数据对象模板
import { emptyImageData } from './data'
// 导入 'browser-image-compression' 库，用于图片压缩
// import imageCompression from 'browser-image-compression'
// 从 '@vueuse/core' 导入 useFileDialog，用于文件选择对话框
import { useClipboard } from '@vueuse/core'
const { copy } = useClipboard()

const { open, onChange } = useFileDialog()

// 创建一个 ref 来存储当前选择的文件对象
const selectedFile = ref(null)
const show = ref(false)
// 处理文件选择事件
const loading = ref(true)
const handleFileSelected = (file) => {
  // 如果没有文件，则直接返回
  if (!file) return
  loading.value = true
  // 设置当前选择的文件
  selectedFile.value = file
  // 清除已转换的图片数据（避免显示旧的转换结果）
  clearImageData('converted')
  // 重置转换状态为未转换
  isConverting.value = false
  console.log('file', file)
  if (file.type == 'image/svg+xml') {
    setSvgImage(file)
    return
  }
  // 设置原始图片数据（加载图片信息）
  setOriginalImageData(file)
}
// 极简版：仅核心逻辑，无多余校验（确认已拿到合法SVG文件时用）
async function setSvgImage(file) {
  // 1. 读取SVG文件内容为文本
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = function (e) {
    // 2. 转成SVG的DataURL
    const svgDataUrl = `data:image/svg+xml;utf8,${e.target.result}`

    // 3. 加载为Image对象
    const img = new Image()
    img.onload = function () {
      // 4. 创建Canvas并渲染
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      // 用SVG自身尺寸渲染
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // 此时canvas已渲染完成，可添加到页面/后续处理
      document.body.appendChild(canvas)
      console.log('canvas', canvas)
    }
    img.src = svgDataUrl
    console.log('img', img)
    console.log('svgDataUrl', svgDataUrl)
  }
}

// 监听文件选择对话框的变化事件
onChange((f) => {
  // 获取选择的第一个文件（支持多选但只取第一个）
  const file = f && f[0] ? f[0] : null
  // 处理选择的文件
  handleFileSelected(file)
})

// 创建一个 ref 来跟踪图片是否正在转换（用于UI状态显示）
const isConverting = ref(false)

const original = ref(emptyImageData())
const converted = ref(emptyImageData())

const initParamsHash = (data) => `${data.width}-${data.height}-${data.format}-${data.quality}`
// 原始图片参数哈希（基于原始图片参数动态生成）
const originalParamsHash = ref('')
// 当前转换参数哈希（基于转换参数动态生成）
const convertedParamsHash = computed(() => initParamsHash(converted.value))
// 是否需要处理（转换参数与原始参数不同）
const needsProcess = computed(() => convertedParamsHash.value !== originalParamsHash.value)
// 设置原始图片数据（加载图片并获取元信息）
const setOriginalImageData = async (file) => {
  // 为文件创建一个对象 URL（用于预览）
  const url = URL.createObjectURL(file)
  // 获取文件格式
  const format = getFormat(file)
  const img = await createImageBitmap(file)
  original.value = {
    width: img.width, // 图片原始宽度
    height: img.height, // 图片原始高度
    size: file.size, // 图片文件大小
    quality: 1, // 默认质量
    format, // 图片格式
    url, // 图片预览URL
  }
  converted.value = {
    ...original.value,
    blob: selectedFile.value,
  }
  originalParamsHash.value = initParamsHash(original.value)
  setTimeout(() => {
    loading.value = false
  }, 1)
}
// 实时预览转换：统一入口，含错误兜底与状态复位
const setConvertImageData = async () => {
  if (!live.value || !selectedFile.value) return
  if (isConverting.value) return

  try {
    const blob = await processImage()
    console.log('blob', blob)
    // 释放旧资源
    clearImageData('converted')
    converted.value.url = URL.createObjectURL(blob)
    converted.value.blob = blob
    converted.value.size = blob.size
    isConverting.value = false
  } catch (err) {
    console.log('setConvertImageData err', err)
  } finally {
    isConverting.value = false
  }
}
// 清除图片数据（释放资源并重置状态）
const clearImageData = (type = 'all') => {
  // 获取原始图片和转换后图片的 URL
  const originalUrl = original.value.url
  const convertedUrl = converted.value.url

  // 清除转换后图片数据
  if (type === 'converted' || type === 'all') {
    // 如果存在转换后图片 URL 且与原始图片 URL 不同，则撤销它
    // （避免重复撤销同一个URL）
    if (convertedUrl && convertedUrl !== originalUrl) {
      URL.revokeObjectURL(convertedUrl)
      converted.value.blob?.close?.()
      converted.value.blob = null
      converted.value.url = null
    }
  }
  // 清除原始图片数据
  if (type === 'original' || type === 'all') {
    // 如果存在原始图片 URL，则撤销它（释放内存）
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    // 重置原始图片数据为空对象
    original.value = emptyImageData()
  }
}

// 控制是否启用实时预览功能
const live = ref(false)

// 计算属性：判断预览是否可见
// 需要同时满足：启用实时预览、显示转换后图片、转换后图片URL存在
const previewVisible = computed(() => live.value && !!converted.value.url)

// 获取目标格式（直接从转换选项中获取）
// 返回：目标格式字符串（如 'jpg', 'png' 等）
const getTargetFormat = () => converted.value.format

// 创建 pica 实例（图片处理库）
const picaInstance = pica({
  tileSize: 512, // 分块大小，处理大图时减少内存占用
  idleTimeout: 3000, // WebWorker 空闲超时时间（毫秒）
})

// 图片处理函数（核心处理逻辑）
const processImage = async (options = {}) => {
  const { type = 'blob' } = options
  try {
    isConverting.value = true
    const file = selectedFile.value
    // 如果原始图片和转换后图片相同，则直接返回原始图片URL
    if (!needsProcess.value && type === 'blob') {
      console.log('原图返回')
      return file
    }
    const w = converted.value.width
    const h = converted.value.height
    const quality = converted.value.quality
    const format = converted.value.format
    const mime = toMime(format)
    // 创建目标画布
    // 创建图像位图（高性能图像处理）
    const bitmap = await createImageBitmap(file)
    // 设置目标画布尺寸
    let dst = document.createElement('canvas')
    dst.width = w
    dst.height = h
    // 使用 pica 进行高质量缩放
    const canvas = await picaInstance.resize(
      bitmap, // 源图像
      dst, // 目标画布
      {
        filter: 'lanczos3', // 使用 lanczos3 滤波器（高质量）
        // alpha: format !== 'image/jpeg', // 注释：仅非jpeg格式启用透明通道
        // 锐化参数（增强图像清晰度）
        unsharpAmount: 120, // 锐化力度（120表示中等锐化）
        unsharpRadius: 1, // 锐化半径（1像素）
        unsharpThreshold: 2, // 锐化阈值（避免过度锐化平滑区域）
      },
    )
    let res = ''
    console.log('canvas', canvas)
    // 转换为 base64 字符串
    if (type === 'base64') {
      // dst.drawImage(bitmap, 0, 0) // 完整绘制
      res = canvas.toDataURL(mime, quality)
      console.log('base64', quality, res)
      return res
    }
    // 转换为 Blob 对象
    else if (type === 'blob') {
      res = await picaInstance.toBlob(canvas, mime, quality)
    }

    // 释放位图资源（优化内存占用）
    bitmap.close()
    dst.width = 0
    dst.height = 0
    dst = null
    return res
  } catch (err) {
    console.log('processImage err', err)
  } finally {
    isConverting.value = false
  }

  // } else if (mode.value === 'custom') {
  //   console.log('自定义模式 大小没压下去 需要继续优化')
  //   return await imageCompression(file, {
  //     maxWidth: w,
  //     maxHeight: h,
  //     fileType: mime, // 文件类型
  //     initialQuality: quality, // 初始质量
  //     useWebWorker: true, // 使用 Web Worker
  //   })
  // }
}
const handleApplyPreset = (options) => {
  const { quality, format, size } = options
  converted.value.quality = quality
  converted.value.format = format
  converted.value.width = size.w
  converted.value.height = size.h
  // 显示成功消息
  ElMessage.success($t('image.appliedRecommendation'))
}

// 保存文件函数（处理并下载转换后的图片）
const save = async (type = 'blob') => {
  try {
    if (type == 'base64') {
      const res = await processImage({ type })
      copy(res)
        .then(() => {
          ElMessage.success('复制base64成功')
        })
        .catch(() => {
          ElMessage.error('复制base64失败')
        })
      return res
    }
    let blob
    // 如果不是实时预览，需要处理图片
    if (!live.value) blob = await processImage({ type })
    // 如果是实时预览，直接使用转换后的图片Blob
    else blob = converted.value.blob

    // 获取当前选择的文件
    const file = selectedFile.value
    // 获取目标格式
    const fmt = getTargetFormat()
    const name =
      fmt && fmt !== getFormat(file.name) ? file.name.replace(/\.\w+$/, `.${fmt}`) : file.name

    // 为文件创建一个对象 URL（用于下载）
    const url = URL.createObjectURL(blob)

    // 创建下载链接并触发下载
    const a = document.createElement('a')
    a.href = url
    a.download = name // 设置下载文件名
    document.body.appendChild(a) // 添加到DOM（必要的浏览器安全限制）
    a.click() // 模拟点击触发下载
    document.body.removeChild(a) // 移除链接元素

    // 撤销对象 URL（释放内存）
    URL.revokeObjectURL(url)
    originalParamsHash.value = convertedParamsHash.value
  } finally {
  }
}

// 开启实时预览时，如已有参数变化则立即触发一次
watch([live, convertedParamsHash], () => {
  const currentLive = live.value
  // 关闭实时预览时，清除转换后的图片数据
  if (!currentLive) {
    clearImageData('converted')
    return
  }
  // 如果没有选择文件，则不处理
  if (!selectedFile.value) {
    return
  }
  if (needsProcess.value) {
    console.log('实时预览', convertedParamsHash.value)
    setConvertImageData()
  }
})
onBeforeUnmount(() => {
  clearImageData('all')
})
</script>

<style>
.el-splitter-bar {
  width: 16px !important;
}
</style>
