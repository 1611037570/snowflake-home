<script setup>
import { useResumeStore } from '@/stores'
import { computed, ref } from 'vue'
import { workYears } from '../../utils'
import TitleEditor from './titleEditor.vue'

// 简历 Store
const resumeStore = useResumeStore()
// 简历标题，根据当前简历数据计算
const title = computed(() => {
  const data = resumeStore.currentData
  if (!data) return '未命名简历'
  const { user, education } = data
  const name = user?.name || ''
  const edu = education?.[0]?.education || ''
  const position = user?.position || ''
  return [name, edu, position, workYears.value].filter(Boolean).join('-') || '未命名简历'
})
// 标题编辑器引用
const titleEditorRef = ref(null)
function handleEditTitle() {
  titleEditorRef.value?.openModal()
}
</script>

<template>
  <div class="flex cursor-pointer items-center hover:text-sf-theme-hover" @click="handleEditTitle">
    {{ title }}
    <SfIcon name="arrow-right" class="ml-2" size="5" />
  </div>
  <TitleEditor v-model="title" ref="titleEditorRef" />
</template>

<style lang="scss" scoped></style>
