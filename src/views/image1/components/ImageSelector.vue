<template>
  <div
    ref="dropZoneRef"
    class="flex-c border-sf-primary-theme relative mr-3 h-full flex-1 cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-dashed border-sf-text-2 bg-sf-primary transition-all hover:border-sf-theme-hover hover:bg-sf-theme/10 hover:shadow-md active:scale-[0.99]"
    :class="{ 'border-sf-theme bg-sf-theme/20': isOverDropZone }"
    @click="handleClick"
  >
    <BaseIcon icon="material-symbols:image-outline" class="mb-2 text-3xl text-sf-text" />
    <div class="text-sf-secondary">点击或拖拽图片到此</div>
  </div>
</template>

<script setup>
const emit = defineEmits(['file-selected', 'select-click'])

const dropZoneRef = ref()
const { isOverDropZone } = useDropZone(dropZoneRef, {
  dataTypes: ['Files'],
  onDrop: (files) => {
    if (files && files.length > 0) {
      const fileList = Array.from(files)
      if (fileList.length === 1) {
        emit('file-selected', fileList[0])
      } else {
        ElMessage.warning('请只拖拽一个文件')
      }
    }
  },
})

const handleClick = () => {
  emit('select-click')
}
</script>
