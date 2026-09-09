<template>
  <div style="" class="relative w-full rounded-2xl" :class="bg">
    <!-- 编辑器实例创建成功后再挂载工具栏，避免工具栏在 editor 就绪前初始化报错 -->
    <Toolbar
      v-if="editorRef"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="rounded-b-2xl"
      style="overflow-y: hidden"
      :style="{ height: height }"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
    <div class="pointer-events-none absolute right-3 bottom-3 z-10 text-xs text-sf-text-2">
      {{ currentLength }}/{{ props.maxLength }}
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";

// 延迟加载 wangeditor 库及样式：组件实际渲染时才引入，避免编辑资源提前进包
const Editor = defineAsyncComponent(() =>
  import("@wangeditor-next/editor/dist/css/style.css").then(() =>
    import("@wangeditor-next/editor-for-vue").then((m) => m.Editor),
  ),
);
const Toolbar = defineAsyncComponent(() =>
  import("@wangeditor-next/editor-for-vue").then((m) => m.Toolbar),
);

const props = defineProps({
  height: {
    type: String,
    default: "300px",
  },
  maxLength: {
    type: Number,
    default: 9999,
  },
});
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const bg = inject("bg", "var(--color-sf-primary)");
// 内容 HTML
const valueHtml = defineModel("modelValue", {
  default: "<p>欢迎体验 雪花浏览器</p>",
});

// 根据编辑器实例的纯文本内容统计当前字数，仅用于展示
const currentLength = ref(0);
const updateCurrentLength = (editor) => {
  currentLength.value = editor.getText().length;
};

// 模拟 ajax 异步获取内容
onMounted(() => {});

const toolbarConfig = {
  toolbarKeys: ["bold", "italic", "underline", "bulletedList", "numberedList", "undo", "redo"],
};
const editorConfig = { placeholder: "请输入内容..." };

const mode = "simple"; // 或 'simple'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  updateCurrentLength(editor);
};

const handleChange = (editor) => {
  updateCurrentLength(editor);
};
</script>

<style scoped lang="scss">
// ——————工具栏样式开始——————
:deep(.w-e-bar svg) {
  fill: var(--color-sf-base);
}
/* 修改工具栏样式 */
:deep(.w-e-bar) {
  background: transparent;
  color: var(--color-sf-base);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  padding: 0 !important;
}
:deep(.w-e-bar-item button) {
  border-radius: 10px !important;
}
:deep(.w-e-bar-item .active) {
  background-color: var(--color-sf-theme-2) !important;
}
// 修改工具栏按钮hover样式
:deep(.w-e-bar-item button:hover) {
  svg {
    fill: var(--color-sf-theme) !important;
  }
  background: none;
}
// 修改工具栏按钮下拉菜单hover样式
:deep(.w-e-menu-tooltip-v5) {
  &::before {
    color: var(--color-sf-base);
    background: var(--color-sf-page);
    border: var(--color-sf-border) 1px solid;
  }
  &:after {
    border: none !important;
  }
}
// ——————工具栏样式结束——————

// ——————编辑器样式开始——————
/* 修改编辑器文本容器样式 */
:deep(.w-e-text-container) {
  background: transparent;
  color: var(--color-sf-base);
}
//
:deep(.w-e-text-placeholder) {
  top: -5px !important;
}
// 修改段落样式
:deep(.w-e-text-container p) {
  margin: 0 !important;
  margin-bottom: 10px !important;
}
// ——————编辑器样式结束——————
</style>
