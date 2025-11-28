<template>
  <div
    ref="dropZoneRef"
    class="flex-c border-sf-primary-theme relative mr-3 h-full flex-1 cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-dashed border-sf-text-2 bg-sf-primary transition-all hover:border-sf-theme-hover hover:bg-sf-theme/10 hover:shadow-md"
    :class="{ 'border-sf-theme bg-sf-theme/20': isOverDropZone }"
    @click="handleClick"
  >
    <BaseIcon icon="material-symbols:image-outline" class="mb-2 text-3xl text-sf-text" />
    <div class="text-sf-secondary">{{ $t('image.selectorHint') }}</div>
  </div>
</template>

<script setup>
// 定义组件事件：文件选择和点击选择事件
const emit = defineEmits(['file-selected', 'select-click'])

// 拖放区域引用
const dropZoneRef = ref()

// 使用 useDropZone 处理拖放功能
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ['Files'], // 只接受文件类型
  onDrop: (files) => {
    if (files && files.length > 0) {
      const fileList = Array.from(files)
      if (fileList.length === 1) {
        // 单个文件：直接触发选择事件
        emit('file-selected', fileList[0])
      } else {
        // 多个文件：显示警告信息
        ElMessage.warning($t('image.selectorOneFile'))
      }
    }
  },
})

// 处理点击事件：触发选择点击事件
const handleClick = () => {
  emit('select-click')
}
</script>
