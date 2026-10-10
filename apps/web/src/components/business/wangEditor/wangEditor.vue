<template>
  <div style="" class="sf-wang-editor relative w-full rounded-2xl" :class="[bg, sfBorder]">
    <div class="relative">
      <!-- 编辑器实例创建成功后再挂载工具栏，避免工具栏在 editor 就绪前初始化报错 -->
      <div v-if="editorRef && $slots.toolbar" class="flex min-w-0 items-center">
        <div class="min-w-0 flex-1">
          <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
        </div>
        <slot name="toolbar" :editor="editorRef" />
      </div>
      <Toolbar v-else-if="editorRef" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <!-- 使用项目统一滚动条承载编辑器内容 -->
      <SfScrollbar :max-height="height" :class="$slots.bottom ? 'rounded-b-none' : 'rounded-b-2xl'">
        <Editor
          :class="$slots.bottom ? 'rounded-b-none' : 'rounded-b-2xl'"
          :style="{ height: 'auto', minHeight: '80px' }"
          v-model="valueHtml"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
          @onChange="handleChange"
        />
      </SfScrollbar>
      <div class="pointer-events-none absolute right-2 bottom-2 z-10 text-xs text-sf-text-2">
        {{ currentLength }}/{{ props.maxLength }}
      </div>
    </div>
    <!-- 底部插槽与编辑内容共用编辑器卡片外框 -->
    <slot name="bottom" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import { Editor, Toolbar } from "./editorLoader";
import { useFormReadyTask } from "../dynamicForm/api";
// 富文本实际创建后才完成任务，异步代码下载完成不等于可编辑。
const finishReady = useFormReadyTask();
const sfBorder = inject("sfBorder", "");

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
  toolbarKeys: [
    "bold",
    "italic",
    "underline",
    // 恢复文字颜色与文字背景色工具，供正文局部强调使用。
    "color",
    "bgColor",
    "bulletedList",
    "numberedList",
    "insertLink",
    "undo",
    "redo",
  ],
};
// 关闭编辑器内部滚动，避免出现嵌套滚动条
const editorConfig = { placeholder: "请输入内容...", scroll: false };

const mode = "simple"; // 或 'simple'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  finishReady();
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
  height: auto !important;
  padding: 0 !important;
  padding-bottom: 3px !important;
}
// 让编辑器内容自然撑开，由外层滚动容器负责滚动
:deep(.w-e-scroll) {
  height: 100% !important;
}
// 保证空内容时仍保留完整的可编辑区域
:deep(.w-e-text-container [data-slate-editor]) {
  min-height: 100px;
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
