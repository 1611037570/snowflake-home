<template>
  <SfViewContainer>
    <div class="relative flex h-full w-full bg-sf-modal py-2">
      <div class="flex h-full flex-1 overflow-hidden" v-if="selectedFile">
        <el-splitter class="flex h-full flex-1 overflow-hidden">
          <el-splitter-panel :size="previewVisible ? '50%' : '100%'" min="20%">
            <Preview :data="original" :label="$t('image.original')" />
          </el-splitter-panel>
          <el-splitter-panel
            :size="previewVisible ? '50%' : '0%'"
            :resizable="previewVisible"
            min="20%"
          >
            <Preview :data="converted" v-if="previewVisible" :label="$t('image.previewLabel')" />
          </el-splitter-panel>
        </el-splitter>

        <!-- <div :class="paneClass">
          <Preview :data="original" :label="$t('image.original')" />
        </div>
        <div v-if="previewVisible" :class="paneClass">
          <Preview :data="converted" :label="$t('image.previewLabel')" />
        </div> -->
      </div>
      <ImageSelector
        v-else
        @file-selected="handleFileSelected"
        @select-click="open({ accept: 'image/*', multiple: false })"
      />
      <ElScrollbar
        v-if="selectedFile"
        class="relative mr-2 h-full w-[250px] flex-col gap-4 overflow-hidden rounded-xl border border-sf-theme-hover bg-sf-primary p-3 shadow-md transition-all hover:border-sf-theme hover:shadow-xl"
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
        <Tabs v-model="mode">
          <div
            v-if="original.url && mode === 'custom'"
            class="flex flex-col gap-3 text-sf-base"
            :key="fileKey"
          >
            <SizeAdjust
              :initial-w="original.width"
              :initial-h="original.height"
              v-model="converted"
            />
            <FormatAdjust :original-format="original.format" v-model="converted.format" />

            <QualityAdjust v-model="converted.quality" />
          </div>
          <Presets
            v-if="original.url && mode === 'presets'"
            :initial-w="original.width"
            :initial-h="original.height"
            :key="fileKey"
            @apply="handleApplyPreset"
          />
        </Tabs>

        <div
          class="mb-3 flex items-center justify-between rounded-lg bg-sf-primary-hover/50 px-3 py-2 transition-colors duration-200 hover:bg-sf-primary-hover"
        >
          <span class="text-sm font-medium">{{ $t('image.realtimePreview') }}</span>
          <ElSwitch v-model="enableRealtime" />
        </div>

        <ElButton
          class="w-full bg-sf-theme py-2.5 font-medium text-sf-primary transition-all duration-200 hover:bg-sf-theme-hover hover:shadow-lg active:scale-[0.99]"
          @click="save"
          >{{ $t('image.saveImage') }}</ElButton
        >
        <Intro />
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
            <span class="text-sm font-medium">{{ $t('image.processing') }}</span>
          </div>
        </div>
      </ElScrollbar>
    </div>
  </SfViewContainer>
</template>

<script setup>
// 导入自 '@/utils' 的辅助函数
import { getFormat, getUUID, toMime } from '@/utils'
// 导入 pica 库，用于高质量的图片缩放和格式转换
import pica from 'pica'
// 导入 FormatAdjust.vue 子组件 - 格式调整组件
import FormatAdjust from './components/formatAdjust.vue'
// 导入 ImageSelector.vue 子组件 - 图片选择器组件
import ImageSelector from './components/imageSelector.vue'
// 导入 Preview.vue 子组件 - 图片预览组件
import Preview from './components/preview.vue'
// 导入 QualityAdjust.vue 子组件 - 质量调整组件
import QualityAdjust from './components/qualityAdjust.vue'
// 导入 SizeAdjust.vue 子组件 - 尺寸调整组件
import SizeAdjust from './components/sizeAdjust.vue'
// 导入 Intro.vue 子组件 - 介绍说明组件
import Intro from './components/intro.vue'
// 导入 Presets.vue 子组件 - 推荐设置组件
import Presets from './components/presets.vue'
// 导入 Tabs.vue 子组件 - 选项卡组件
import Tabs from './components/tabs.vue'
// 从 '@vueuse/core' 导入 useFileDialog，用于文件选择对话框
const { open, onChange } = useFileDialog()

// 创建一个 ref 来存储当前选择的文件对象
const selectedFile = ref(null)

// 控制当前模式：'custom' 自定义模式 或 'presets' 推荐模式
const mode = ref('presets')

// 处理文件选择事件
const handleFileSelected = (file) => {
  // 如果没有文件，则直接返回
  if (!file) return

  // 设置当前选择的文件
  selectedFile.value = file
  fileKey.value = getUUID()
  // 清除已转换的图片数据（避免显示旧的转换结果）
  clearImageData('converted')
  // 重置转换状态为未转换
  isConverting.value = false
  // 设置原始图片数据（加载图片信息）
  setOriginalImageData(file)
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
// 创建一个 ref 来跟踪图片是否正在保存（用于UI状态显示）
const isSaving = ref(false)

// 返回一个空的图片数据对象模板
const emptyImageData = () => ({
  width: 0,
  height: 0,
  size: 0,
  format: '',
  url: '',
  blob: null,
  quality: 1,
})

const original = ref(emptyImageData())
const converted = ref(emptyImageData())

// 当前转换参数哈希（基于转换参数动态生成）
const currentParamsHash = computed(
  () =>
    `${converted.value.width}-${converted.value.height}-${converted.value.format}-${converted.value.quality}`,
)
const processedParamsHash = ref('')
const needsProcess = computed(() => currentParamsHash.value !== processedParamsHash.value)
// 设置原始图片数据（加载图片并获取元信息）
const setOriginalImageData = (file) => {
  // 如果没有文件，则返回 false
  if (!file) return false

  // 为文件创建一个对象 URL（用于预览）
  const url = URL.createObjectURL(file)
  // 创建一个新的 Image 对象用于获取图片尺寸等信息
  const img = new Image()
  // 获取文件格式
  const format = getFormat(file)
  // 图片加载成功时的回调
  img.onload = () => {
    // 设置原始图片数据
    original.value = {
      width: img.naturalWidth, // 图片原始宽度
      height: img.naturalHeight, // 图片原始高度
      size: file.size || 0, // 图片文件大小
      quality: 1, // 默认质量
      format, // 图片格式
      url, // 图片预览URL
    }
    converted.value = {
      width: img.naturalWidth, // 默认使用原始宽度
      height: img.naturalHeight, // 默认使用原始高度
      size: file.size || 0, // 默认使用原始大小
      quality: 1, // 默认质量
      format, // 默认使用原始格式
      url, // 默认使用原始URL
      blob: selectedFile.value, // 转换后的 Blob 对象（用于下载）
    }
    converted.value.quality = 1
    processedParamsHash.value = currentParamsHash.value
  }

  // 图片加载失败时的回调
  img.onerror = () => {
    URL.revokeObjectURL(url)
    clearImageData('all')
  }
  img.src = url
}
// 实时预览转换：统一入口，含错误兜底与状态复位
const setConvertImageData = async () => {
  if (!enableRealtime.value || !selectedFile.value) return
  if (isConverting.value) return

  isConverting.value = true

  try {
    const file = selectedFile.value
    const blob = await processImage(file)
    // 释放旧资源
    clearImageData('converted')
    converted.value.url = URL.createObjectURL(blob)
    converted.value.blob = blob
    converted.value.size = blob.size
    processedParamsHash.value = currentParamsHash.value
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
const enableRealtime = ref(false)

// 文件唯一标识：选择文件时生成一次随机ID
const fileKey = ref('none')

// 计算属性：判断预览是否可见
// 需要同时满足：启用实时预览、显示转换后图片、转换后图片URL存在
const previewVisible = computed(() => enableRealtime.value && !!converted.value.url)

// 获取目标格式（直接从转换选项中获取）
// 返回：目标格式字符串（如 'jpg', 'png' 等）
const getTargetFormat = () => converted.value.format

// 创建 pica 实例（图片处理库）
const picaInstance = pica({
  tileSize: 512, // 分块大小，处理大图时减少内存占用
  idleTimeout: 3000, // WebWorker 空闲超时时间（毫秒）
})

// 统一的图片处理函数（核心处理逻辑）
const processImage = async (file) => {
  const w = converted.value.width
  const h = converted.value.height
  const quality = converted.value.quality
  const format = converted.value.format
  console.log('w', w, 'h', h)
  const mime = toMime(format)
  // 创建目标画布
  const dst = document.createElement('canvas')

  // 如果设置了尺寸（需要缩放）

  // 创建图像位图（高性能图像处理）
  const bitmap = await createImageBitmap(file)
  // 设置目标画布尺寸
  dst.width = w
  dst.height = h

  // 使用 pica 进行高质量缩放
  await picaInstance.resize(
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

  // 将画布转换为指定格式和质量的Blob
  const res = await picaInstance.toBlob(dst, mime, quality)
  // 释放位图资源（优化内存占用）
  bitmap.close()
  return res
  // 如果没有设置尺寸，直接返回原始文件（理论上不会执行到这里）
  // return file
}
// 处理推荐设置的应用
// const recommendedOptions = {
//   quality: 1,
//   format: 'webp',
//   size: { w: 0, h: 0 },
// }
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
const save = async () => {
  isSaving.value = true

  try {
    // 获取当前选择的文件
    const file = selectedFile.value
    // 获取目标格式
    const fmt = getTargetFormat()
    let blob
    // 如果参数没有变化，直接返回
    if (needsProcess.value) blob = await processImage(file)
    else blob = converted.value.blob

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
    processedParamsHash.value = currentParamsHash.value
  } finally {
    isSaving.value = false
  }
}

// 实时预览触发：防抖并按需处理
const runRealtime = useDebounceFn(() => {
  if (enableRealtime.value && selectedFile.value && needsProcess.value) {
    setConvertImageData()
  }
}, 300)

// 监听核心参数变化：统一走防抖触发
watch(
  () => currentParamsHash.value,
  () => {
    if (needsProcess.value) {
      console.log('实时预览触发：防抖并按需处理')
      runRealtime()
    }
  },
)

// 开启实时预览时，如已有参数变化则立即触发一次
watch(enableRealtime, (on) => {
  console.log('enableRealtime', selectedFile.value, needsProcess.value)
  if (on && selectedFile.value && needsProcess.value) {
    console.log('开启实时预览时，如已有参数变化则立即触发一次')
    setConvertImageData()
    return
  }
  if (!on) {
    clearImageData('converted')
    return
  }
  if (selectedFile.value && on) {
    setConvertImageData()
  }
})
onBeforeUnmount(() => {
  clearImageData('all')
})
</script>
<!--
// 以下为注释掉的旧代码（使用 browser-image-compression 的方案） // const blob = await
imageCompression(file, { // fileType: mime, // alwaysKeepResolution: true, // initialQuality:
quality, // useWebWorker: true, // }) -->
