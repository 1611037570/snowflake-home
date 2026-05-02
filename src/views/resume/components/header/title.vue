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
  <div class="flex items-center">
    {{ resumeTitle }}
    <SfIcon
      icon="lucide:pencil"
      class="ml-2 hover:text-sf-theme-hover"
      size="5"
      @click="handleEditTitle"
    />
  </div>
  <TitleEditor v-model="title" ref="titleEditorRef" />
</template>

<style lang="scss" scoped></style>
