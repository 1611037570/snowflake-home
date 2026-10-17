<template>
  <div
    style=""
    class="sf-wang-editor relative w-full rounded-2xl"
    :class="[bg, sfBorder]"
    @mousedown.capture="handleLinkMenuMouseDown"
    @click.capture="handleLinkMenuClick"
  >
    <div class="relative">
      <!-- 编辑器实例创建成功后再挂载工具栏，避免工具栏在 editor 就绪前初始化报错 -->
      <div v-if="editorRef" class="flex min-w-0 items-center">
        <div class="min-w-0 flex-1">
          <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
        </div>
        <slot v-if="$slots.toolbar" name="toolbar" :editor="editorRef" />
      </div>
      <!-- 正文顶部显示分隔线，关闭滚动条默认左右留白以避免重复内边距。 -->
      <SfScrollbar
        flush
        :max-height="height"
        class="border-t border-sf-b"
        :class="$slots.bottom ? 'rounded-b-none' : 'rounded-b-2xl'"
      >
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

  <SfModal
    v-model="linkModalVisible"
    :title="$t(linkMode === 'edit' ? 'editLink' : 'insertLink')"
    width="420px"
  >
    <form class="flex w-full flex-col gap-3" @submit.prevent="confirmLink">
      <label class="flex flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("linkTextOptional") }}</span>
        <SfInput v-model="linkText" :placeholder="$t('linkTextPlaceholder')" clearable />
      </label>
      <label class="flex flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("linkUrl") }}</span>
        <SfInput v-model="linkUrl" :placeholder="$t('linkUrlPlaceholder')" clearable />
      </label>
      <footer class="flex justify-end gap-3">
        <SfButton type="bg" @click="linkModalVisible = false">{{ $t("cancel") }}</SfButton>
        <SfButton :disabled="!canInsertLink" @click="confirmLink">
          {{ $t(linkMode === "edit" ? "save" : "insertLink") }}
        </SfButton>
      </footer>
    </form>
  </SfModal>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import {
  Editor,
  getSelectedEditorLink,
  insertEditorLink,
  Toolbar,
  updateEditorLink,
} from "./editorLoader";
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
const linkModalVisible = ref(false);
const linkMode = ref("insert");
const linkText = ref("");
const linkUrl = ref("");
const canInsertLink = computed(() => Boolean(linkUrl.value.trim()));

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

// 打开外部弹窗前保存当前选中文字，关闭内置链接浮层依赖。
const openLinkModal = async (mode = "insert") => {
  const editor = editorRef.value;
  if (!editor) return;
  linkMode.value = mode;
  if (mode === "edit") {
    const link = await getSelectedEditorLink(editor);
    if (!link) return;
    linkText.value = link.text;
    linkUrl.value = link.url;
  } else {
    linkText.value = editor.getSelectionText()?.trim() || "";
    linkUrl.value = "";
  }
  linkModalVisible.value = true;
};

// 插入与修改按钮保留在编辑器内部，按下时阻止内置浮层抢走编辑器选区。
const handleLinkMenuMouseDown = (event) => {
  const target = event.target;
  if (
    !(target instanceof Element) ||
    !target.closest('[data-menu-key="insertLink"], [data-menu-key="editLink"]')
  ) return;
  event.preventDefault();
  event.stopPropagation();
};

// 捕获原链接按钮点击，仅打开项目弹窗，不执行编辑器内置链接弹层。
const handleLinkMenuClick = (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const menu = target.closest('[data-menu-key="insertLink"], [data-menu-key="editLink"]');
  if (!menu) return;
  event.preventDefault();
  event.stopPropagation();
  openLinkModal(menu.getAttribute("data-menu-key") === "editLink" ? "edit" : "insert");
};

// 未填写协议时按网页地址补全，已填写的协议保持原值。
const normalizeLinkUrl = (value) => {
  const url = value.trim();
  if (!url) return "";
  return /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith("#") ? url : `https://${url}`;
};

// 确认后恢复编辑器选区并插入链接节点，弹窗始终位于编辑器外层。
const confirmLink = async () => {
  const editor = editorRef.value;
  const url = normalizeLinkUrl(linkUrl.value);
  const text = linkText.value.trim() || url;
  if (!editor || !url) return;
  if (linkMode.value === "edit") await updateEditorLink(editor, text, url);
  else await insertEditorLink(editor, text, url);
  linkModalVisible.value = false;
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
:deep(.w-e-hover-bar) {
  background: var(--color-sf-page) !important;
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
// 正文仅保留顶部留白，取消底部及默认左右留白。
:deep(.w-e-text-container [data-slate-editor]) {
  min-height: 100px;
  padding-top: 12px;
  padding-bottom: 0;
  padding-inline: 0;
}
// 占位文字与取消留白后的正文起点对齐。
:deep(.w-e-text-placeholder) {
  top: 12px !important;
  left: 0;
}
// 修改段落样式
:deep(.w-e-text-container p) {
  margin: 0 !important;
  margin-bottom: 10px !important;
}
// ——————编辑器样式结束——————
</style>
