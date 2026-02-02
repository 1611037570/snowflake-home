<template>
  <div style="" class="">
    <Toolbar
      class="rounded-t-xl"
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="rounded-b-xl"
      style="height: 500px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import '@wangeditor-next/editor/dist/css/style.css' // 引入 css

import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = defineModel('modelValue', {
  default: '<p>欢迎体验 雪花浏览器</p>',
})

// 模拟 ajax 异步获取内容
onMounted(() => {})

const toolbarConfig = {
  toolbarKeys: ['bold', 'italic', 'underline', 'bulletedList', 'numberedList', 'undo', 'redo'],
}
const editorConfig = { placeholder: '请输入内容...' }

const mode = 'simple' // 或 'simple'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
</script>

<style scoped lang="scss">
/* 修改编辑器文本容器样式 */
:deep(.w-e-text-container) {
  background: var(--color-sf-primary);
  color: var(--color-sf-base);
}
:deep(.w-e-bar svg) {
  fill: var(--color-sf-base);
}
/* 修改工具栏样式 */
:deep(.w-e-bar) {
  background: var(--color-sf-primary);
  color: var(--color-sf-base);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
</style>
