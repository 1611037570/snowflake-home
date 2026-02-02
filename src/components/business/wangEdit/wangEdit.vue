<template>
  <div style="" class="mb-3">
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

<style scoped>
/* 自定义工具栏图标样式 */
:deep(.w-e-menu-bold .w-e-icon) {
  /* 隐藏默认图标 */
  display: none;
}

:deep(.w-e-menu-bold::before) {
  /* 添加自定义图标 */
  /* content: 'B'; */
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
