<script setup>
import { ref } from 'vue'
import { resumeTitle } from '../../utils'
import TitleEditor from './titleEditor.vue'
// 标题编辑器引用
const titleEditorRef = ref(null)
function handleEditTitle() {
  titleEditorRef.value?.openModal()
}
</script>

<template>
  <div class="flex cursor-pointer items-center hover:text-sf-theme-hover" @click="handleEditTitle">
    {{ resumeTitle }}
    <SfIcon name="arrow-right" class="ml-2" size="5" />
  </div>
  <TitleEditor v-model="title" ref="titleEditorRef" />
</template>

<style lang="scss" scoped></style>
