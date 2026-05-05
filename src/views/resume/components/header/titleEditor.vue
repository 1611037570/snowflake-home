<script setup>
import { useResumeStore } from '@/stores'
import { ref } from 'vue'
import { resumeTitle } from '../../utils'
const resumeStore = useResumeStore()
const { currentUsage } = storeToRefs(resumeStore)
const props = defineProps({
  defaultTitle: {
    type: String,
    default: '',
  },
})
// 编辑标题
const editTitleVisible = ref(false)
const custom = ref(currentUsage.value?.customTitle || false)
const tempTitle = ref(props.defaultTitle)

function handleEditTitle() {
  currentUsage.value.customTitle = custom.value ? tempTitle.value : ''
  editTitleVisible.value = !editTitleVisible.value
}

function handleInput() {
  custom.value = true
}

function handleResetTitle() {
  tempTitle.value = resumeTitle.value
}

function openModal() {
  editTitleVisible.value = true
}

defineExpose({
  openModal,
})
</script>

<template>
  <SfModal v-model="editTitleVisible" title="重命名简历">
    <div class="flex w-100 flex-col gap-5 p-4">
      <div class="flex items-center gap-3">
        <SfInput
          @input="handleInput"
          v-model="tempTitle"
          placeholder="请输入标题"
          class="w-full rounded-lg border border-sf-border bg-sf-bg"
        />
        <ElButton @click="handleResetTitle">重置</ElButton>
      </div>
      <ElButton type="primary" @click="handleEditTitle" class="w-full">确定</ElButton>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
