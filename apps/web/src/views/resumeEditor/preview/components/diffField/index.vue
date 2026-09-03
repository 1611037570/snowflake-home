<script setup>
import { computed, inject, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useDiffPopoverStore } from "@/stores/modules/diffPopover";
import DiffContent from "./diffContent.vue";

// 字段代理对象：v-model 绑定，包含 value 与 newValue
const model = defineModel();

const props = defineProps({
  // 是否按富文本 HTML 渲染
  html: {
    type: Boolean,
    default: false,
  },
});

// 打印/导出期间强制展示原值，隐藏 diff 对比效果
const { isPrinting } = storeToRefs(useResumeStore());
const popover = useDiffPopoverStore();

// 单页模式标记：由 resumePages 注入；单页下无 diff 悬浮交互，仅渲染文档流
const isSinglePage = inject("isSinglePage", ref(false));

// 字段代理兜底，避免未传入时取值报错
const field = computed(() => model.value || { value: "", newValue: "" });
const valueContent = computed(() => field.value.value ?? "");
const newValueContent = computed(() => field.value.newValue ?? "");

// 文档流统一渲染：有草稿显示新增，否则显示原值；打印时固定展示原值
const documentContent = computed(() =>
  isPrinting.value ? valueContent.value : newValueContent.value || valueContent.value,
);
// 草稿高亮：单页无悬浮交互，不显示可点击光标；多页保留光标提示可对比
const documentClass = computed(() => {
  if (isPrinting.value || !newValueContent.value) return "";
  return isSinglePage.value
    ? "rounded-xl bg-[#e8f5e9] text-[#2e7d32]"
    : "cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]";
});
const hasContent = computed(() =>
  isPrinting.value ? !!valueContent.value : !!(newValueContent.value || valueContent.value),
);

const rootRef = ref(null);

const handleMouseEnter = () => {
  if (isPrinting.value || isSinglePage.value || !newValueContent.value) return;
  const el = rootRef.value;
  const page = el?.closest(".resume-page-item");
  if (!el || !page) return;
  const rect = el.getBoundingClientRect();
  const pageRect = page.getBoundingClientRect();
  popover.show({
    field: model.value,
    value: valueContent.value,
    newValue: newValueContent.value,
    html: props.html,
    rect: {
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    },
    direction: rect.top - pageRect.top < pageRect.height / 2 ? "down" : "up",
    // 依据窗口大小决定水平对齐：字段右缘距窗口右侧不足时向左展开
    align: window.innerWidth - rect.right < 420 ? "right" : "left",
  });
};

const handleMouseLeave = () => {
  popover.hide();
};
</script>

<template>
  <!-- HTML 富文本：直接渲染块元素，避免包装div导致分页无法按块拆分 -->
  <template v-if="html && hasContent">
    <DiffContent :content="documentContent" :html="html" />
  </template>
  <!-- 纯文本 · 单页模式：仅渲染文档流，去掉悬浮监听与内层包装div，避免测量渲染时冗余DOM -->
  <div
    v-else-if="hasContent && isSinglePage"
    class="relative w-full max-w-full min-w-0 wrap-break-word"
    :class="documentClass"
  >
    <DiffContent :content="documentContent" :html="html" />
  </div>
  <!-- 纯文本 · 多页模式：保持原有包装div结构，支持diff弹窗 -->
  <!-- 惰性绑定：仅在存在草稿 newValue 时挂载悬浮事件，无草稿字段不注册监听 -->
  <div
    v-else-if="hasContent"
    ref="rootRef"
    class="relative max-w-full min-w-0 wrap-break-word"
    v-on="newValueContent ? { mouseenter: handleMouseEnter, mouseleave: handleMouseLeave } : {}"
  >
    <!-- 文档流：有草稿显示新增内容，否则显示原值 -->
    <div class="w-full" :class="documentClass">
      <DiffContent :content="documentContent" :html="html" />
    </div>
  </div>
</template>
