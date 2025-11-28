<template>
  <SfViewContainer>
    <div class="relative flex h-full w-full bg-sf-modal p-3">
      <div class="flex h-full flex-1 overflow-hidden" v-if="selectedFile">
        <div :class="paneClass">
          <Preview :data="imageData.original" />
        </div>
        <div v-if="previewVisible" :class="paneClass">
          <Preview :data="imageData.converted" label="预览图" />
        </div>
      </div>
      <ImageSelector
        v-else
        @file-selected="handleFileSelected"
        @select-click="open({ accept: 'image/*', multiple: false })"
      />
      <ElScrollbar
        v-if="selectedFile"
        class="relative h-full w-[250px] flex-col gap-4 overflow-hidden rounded-xl border border-sf-theme-hover bg-sf-primary p-4 shadow-md transition-all hover:border-sf-theme hover:shadow-xl"
      >
        <!-- 已选择图片时的状态 -->
        <div class="mb-4 rounded-lg bg-sf-primary-hover/50 p-3 text-center">
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
            <span>更换图片</span>
          </button>
        </div>
        <!-- 这里增加tab切换 -->
        <div class="mb-4 flex justify-center">
          <div class="inline-flex rounded-md bg-sf-primary-hover/60 p-1">
            <button
              class="rounded px-6 py-1 text-sm font-semibold"
              :class="
                mode === 'custom'
                  ? 'bg-sf-primary text-sf-base shadow'
                  : 'text-sf-secondary hover:text-sf-base'
              "
              @click="mode = 'custom'"
            >
              自定义
            </button>
            <button
              class="rounded px-6 py-1 text-sm font-semibold"
              :class="
                mode === 'recommended'
                  ? 'bg-sf-primary text-sf-base shadow'
                  : 'text-sf-secondary hover:text-sf-base'
              "
              @click="mode = 'recommended'"
            >
              推荐
            </button>
          </div>
        </div>

        <div
          v-if="selectedFile && imageData.original.url && mode === 'custom'"
          class="flex flex-col gap-3 text-sf-base"
        >
          <SizeAdjust
            :initial-w="imageData.original.width"
            :initial-h="imageData.original.height"
            v-model="conversionOptions.size"
            :key="'size-' + fileKey"
          />
          <FormatAdjust
            :original-format="originalFormat"
            v-model="conversionOptions.format"
            :key="'fmt-' + fileKey"
          />

          <QualityAdjust v-model="conversionOptions.quality" :key="'qual-' + fileKey" />
        </div>
        <Recommendation
          v-if="mode === 'recommended'"
          :initial-w="imageData.original.width"
          :initial-h="imageData.original.height"
          @apply="handleApplyRecommendation"
        />

        <div
          class="mb-3 flex items-center justify-between rounded-lg bg-sf-primary-hover/50 px-3 py-2 transition-colors duration-200 hover:bg-sf-primary-hover"
        >
          <span class="text-sm font-medium">实时预览</span>
          <ElSwitch v-model="enableRealtime" />
        </div>

        <ElButton
          :disabled="!selectedFile || isConverting"
          class="w-full bg-sf-theme py-2.5 font-medium text-sf-primary transition-all duration-200 hover:bg-sf-theme-hover hover:shadow-lg active:scale-[0.99]"
          @click="save"
          >保存图片</ElButton
        >
        <div
          v-if="isSaving || isConverting"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md"
        >
          <div
            class="flex items-center gap-2 rounded-lg border border-sf-theme-hover bg-sf-primary px-4 py-3 text-sf-base shadow-lg"
          >
            <BaseIcon
              name="line-md:loading-twotone-loop"
              class="animate-spin text-xl text-sf-theme"
            />
            <span class="text-sm font-medium">处理中…</span>
          </div>
        </div>
      </ElScrollbar>
    </div>
  </SfViewContainer>
</template>

<script setup>
// 导入自 '@/utils' 的辅助函数
import { getFormat, renameWithExt, resizeToBlob, toMime } from '@/utils'
// 导入 'browser-image-compression' 库，用于图片压缩
import imageCompression from 'browser-image-compression'
// 导入 FormatAdjust.vue 子组件
import FormatAdjust from './components/FormatAdjust.vue'
// 导入 ImageSelector.vue 子组件
import ImageSelector from './components/ImageSelector.vue'
// 导入 Preview.vue 子组件
import Preview from './components/Preview.vue'
// 导入 QualityAdjust.vue 子组件
import QualityAdjust from './components/QualityAdjust.vue'
// 导入 SizeAdjust.vue 子组件
import SizeAdjust from './components/SizeAdjust.vue'
// 导入 RecommendedAdjust.vue 子组件
import Recommendation from './components/Recommendation.vue'
// 从 '@vueuse/core' 导入 useFileDialog，用于文件选择
const { open, onChange } = useFileDialog()
// 创建一个 ref 来存储当前选择的文件
const selectedFile = ref(null)
const showConverted = ref(false)
const mode = ref('custom') // 'custom' or 'recommended'

const conversionOptions = ref({
  format: '',
  quality: null,
  size: { w: 0, h: 0 },
})

// 定义处理文件选择的函数
const handleFileSelected = (file) => {
  // 如果没有文件，则直接返回
  if (!file) return
  // 设置当前选择的文件
  selectedFile.value = file
  // 重置转换选项
  conversionOptions.value = {
    format: '',
    quality: null,
    size: { w: 0, h: 0 },
  }
  // 清除已转换的图片数据
  clearImageData('converted')
  // 重置保存状态
  isSaving.value = false
  // 重置转换状态
  isConverting.value = false
  showConverted.value = false
}

// 监听文件选择器的变化
onChange((f) => {
  // 获取选择的第一个文件
  const file = f && f[0] ? f[0] : null
  // 处理选择的文件
  handleFileSelected(file)
})
// 创建一个 ref 来跟踪图片是否正在转换
const isConverting = ref(false)
// 创建一个 ref 来跟踪图片是否正在保存
const isSaving = ref(false)

// 定义一个函数，返回一个空的图片数据对象
const emptyImageData = () => ({
  width: 0, // 图片宽度
  height: 0, // 图片高度
  size: 0, // 图片大小
  format: '', // 图片格式
  url: '', // 图片 URL
  blob: null,
})

// 创建一个 ref 来存储原始图片和转换后图片的数据
const imageData = ref({
  original: emptyImageData(), // 原始图片数据
  converted: emptyImageData(), // 转换后图片数据
})
// 定义设置原始图片数据的函数
const setOriginalImageData = (file) => {
  // 如果没有文件，则返回 false
  if (!file) return false

  // 为文件创建一个对象 URL
  const url = URL.createObjectURL(file)
  // 创建一个新的 Image 对象
  const img = new Image()

  // 设置图片加载成功时的回调
  img.onload = () => {
    // 设置原始图片数据
    imageData.value.original = {
      width: img.naturalWidth, // 图片原始宽度
      height: img.naturalHeight, // 图片原始高度
      size: file.size || 0, // 图片大小
      format: getFormat(file), // 图片格式
      url: url, // 图片 URL
    }

    // 如果启用了实时预览，则触发转换预览
    if (enableRealtime.value) convertPreview()
  }

  // 设置图片加载失败时的回调
  img.onerror = () => {
    // 撤销对象 URL
    URL.revokeObjectURL(url)
    // 返回 false
    return false
  }

  // 设置图片的 src，开始加载图片
  img.src = url

  // 返回 true 表示成功
  return true
}

// 定义清除图片数据的函数
const clearImageData = (type = 'all') => {
  // 获取原始图片和转换后图片的 URL
  const originalUrl = imageData.value.original.url
  const convertedUrl = imageData.value.converted.url

  // 如果类型是 'original' 或 'all'
  if (type === 'original' || type === 'all') {
    // 如果存在原始图片 URL，则撤销它
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    // 重置原始图片数据
    imageData.value.original = emptyImageData()
  }

  // 如果类型是 'converted' 或 'all'
  if (type === 'converted' || type === 'all') {
    // 如果存在转换后图片的 URL 且与原始图片 URL 不同，则撤销它
    if (convertedUrl && convertedUrl !== originalUrl) {
      URL.revokeObjectURL(convertedUrl)
    }
    // 重置转换后图片数据
    imageData.value.converted = emptyImageData()
  }
}

// 监听 selectedFile 的变化
watch(selectedFile, (file) => {
  // 如果选择了文件
  if (file) {
    // 设置原始图片数据
    const success = setOriginalImageData(file)
    // 如果设置失败，则清除已转换的图片数据
    if (!success) clearImageData('converted')
  } else {
    // 如果没有选择文件，则清除已转换的图片数据
    clearImageData('converted')
  }
})

// 计算原始文件的格式
const originalFormat = computed(() => getFormat(selectedFile.value))
// 创建一个 ref 来控制是否启用实时预览
const enableRealtime = ref(false)

// 计算文件的唯一标识，用于组件的重新渲染
const fileKey = computed(() =>
  selectedFile.value
    ? [
        selectedFile.value.name || 'unnamed',
        selectedFile.value.size || 0,
        selectedFile.value.lastModified || 0,
      ].join(':')
    : 'none',
)

const previewVisible = computed(
  () => enableRealtime.value && showConverted.value && !!imageData.value.converted.url,
)

const paneClass = computed(() => [
  'ease-in-out relative flex h-full transition-all duration-300',
  previewVisible.value ? 'w-[50%]' : 'w-full',
])

// 定义获取目标格式的函数
// @param {File} file - 文件对象
// @returns {string} 目标格式
const getTargetFormat = (file) => conversionOptions.value.format || getFormat(file)

const optionsKey = computed(() => {
  const { size, format, quality } = conversionOptions.value
  const w = size.w || 0
  const h = size.h || 0
  const q = quality ?? ''
  const f = format || ''
  return `${f}|${q}|${w}x${h}`
})

const needsProcess = computed(() => {
  return (
    (conversionOptions.value.size.w && conversionOptions.value.size.h) ||
    conversionOptions.value.format ||
    conversionOptions.value.quality != null
  )
})

// 定义统一的图片处理函数
const processImage = async (file, mime) => {
  const { size, quality, format } = conversionOptions.value
  // 如果需要调整尺寸
  if (size.w && size.h) {
    // 调用 resizeToBlob 函数调整图片尺寸
    return await resizeToBlob(file, mime, size.w, size.h, quality ?? 1)
  }

  // 如果需要压缩或转换格式
  if (format || quality != null) {
    // 调用 imageCompression 函数进行压缩
    return await imageCompression(file, {
      fileType: mime, // 文件类型
      alwaysKeepResolution: true, // 保持分辨率
      initialQuality: quality ?? 1, // 初始质量
      useWebWorker: true, // 使用 Web Worker
    })
  }

  // 如果不需要处理，则返回原文件
  return file
}
const handleApplyRecommendation = (recommendedOptions) => {
  const { quality, format, size } = recommendedOptions
  if (quality) conversionOptions.value.quality = quality
  if (format) conversionOptions.value.format = format
  if (size) {
    conversionOptions.value.size = { w: size.w, h: size.h }
  }
  console.log('已应用推荐设置:', recommendedOptions)
}

// 定义保存文件的函数
const save = async () => {
  // 如果没有选择文件或正在转换，则直接返回
  if (!selectedFile.value || isConverting.value) return
  // 设置正在转换为 true
  isConverting.value = true
  // 设置正在保存为 true
  isSaving.value = true
  try {
    // 获取当前选择的文件
    const file = selectedFile.value
    // 获取目标格式
    const fmt = getTargetFormat(file)
    // 获取 MIME 类型
    const mime = toMime(fmt)
    // 检查是否存在已处理好的 blob，且选项指纹一致，则直接使用
    const key = optionsKey.value
    let blob = imageData.value.converted.blob
    if (!blob || imageData.value.converted.optionsKey !== key) {
      blob = await processImage(file, mime)
    }
    // 获取新文件名
    const name = conversionOptions.value.format
      ? renameWithExt(file.name || 'image', fmt)
      : file.name
    // 为文件创建一个对象 URL
    const url = URL.createObjectURL(blob)
    // 创建一个 a 标签用于下载
    const a = document.createElement('a')
    // 设置 a 标签的 href
    a.href = url
    // 设置 a 标签的 download 属性
    a.download = name
    // 将 a 标签添加到 body 中
    document.body.appendChild(a)
    // 模拟点击 a 标签
    a.click()
    // 从 body 中移除 a 标签
    a.remove()
    // 撤销对象 URL
    URL.revokeObjectURL(url)
  } finally {
    // 无论成功或失败，都将 isConverting 设置为 false
    isConverting.value = false
    // 无论成功或失败，都将 isSaving 设置为 false
    isSaving.value = false
  }
}

// 定义转换预览的函数
const convertPreview = async () => {
  // 如果未启用实时预览或未选择文件，则直接返回
  if (!enableRealtime.value || !selectedFile.value) return
  // 设置正在转换为 true
  isConverting.value = true
  showConverted.value = !!imageData.value.converted.url

  // 获取当前选择的文件
  const file = selectedFile.value
  // 获取目标格式
  const fmt = getTargetFormat(file)
  // 获取 MIME 类型
  const mime = toMime(fmt)
  // 判断是否需要处理
  const need = needsProcess.value

  try {
    if (
      need &&
      imageData.value.converted.blob &&
      imageData.value.converted.optionsKey === optionsKey.value
    ) {
      showConverted.value = true
      return
    }
    // 如果不需要处理
    if (!need) {
      // 直接使用原始图片 URL
      const prevUrl = imageData.value.converted.url
      const nextUrl = imageData.value.original.url

      // 如果 URL 发生变化
      if (prevUrl !== nextUrl) {
        // 清除已转换的图片数据
        clearImageData('converted')
        // 更新转换后的图片数据
        imageData.value.converted = {
          ...imageData.value.original,
          url: nextUrl,
          blob: null,
          optionsKey: '',
        }
      }
      showConverted.value = true
      return
    }

    // 如果需要处理图片
    const blob = await processImage(file, mime)
    // 为处理后的 blob 创建一个对象 URL
    const nextUrl = URL.createObjectURL(blob)

    // 清除已转换的图片数据
    clearImageData('converted')
    // 更新转换后的图片数据
    imageData.value.converted = {
      width: conversionOptions.value.size.w || imageData.value.original.width,
      height: conversionOptions.value.size.h || imageData.value.original.height,
      size: blob.size,
      format: fmt,
      url: nextUrl,
      blob: blob,
      optionsKey: optionsKey.value,
    }
    showConverted.value = true
  } finally {
    // 无论成功或失败，都将 isConverting 设置为 false
    isConverting.value = false
  }
}

// 创建一个防抖函数，用于实时预览
const runRealtime = useDebounceFn(() => {
  // 如果启用了实时预览且选择了文件，则执行转换预览
  if (enableRealtime.value && selectedFile.value) convertPreview()
}, 300)

// 监听实时预览开关的变化
watch(enableRealtime, (on) => {
  // 如果开启了实时预览且选择了文件，则执行转换预览
  if (on && selectedFile.value) convertPreview()
  // 如果关闭了实时预览，则清除已转换的图片数据
  if (!on) {
    clearImageData('converted')
    showConverted.value = false
  }
})

// 监听格式、质量、尺寸的变化，触发实时预览
watch(conversionOptions, runRealtime, { deep: true })
</script>
