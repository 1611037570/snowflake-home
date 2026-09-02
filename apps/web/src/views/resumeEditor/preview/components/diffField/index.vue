<script setup>
import { computed, ref } from "vue";
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

// 字段代理兜底，避免未传入时取值报错
const field = computed(() => model.value || { value: "", newValue: "" });
const valueContent = computed(() => field.value.value ?? "");
const newValueContent = computed(() => field.value.newValue ?? "");

// 文档流统一渲染：有草稿显示新增，否则显示原值；打印时固定展示原值
const documentContent = computed(() =>
  isPrinting.value ? valueContent.value : newValueContent.value || valueContent.value,
);
const documentClass = computed(() =>
  !isPrinting.value && newValueContent.value
    ? "cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]"
    : "",
);
const hasContent = computed(() =>
  isPrinting.value ? !!valueContent.value : !!(newValueContent.value || valueContent.value),
);

const rootRef = ref(null);

const handleMouseEnter = () => {
  if (isPrinting.value || !newValueContent.value) return;
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
  <!-- 纯文本：保持原有包装div结构，支持diff弹窗 -->
  <div
    v-else-if="hasContent"
    ref="rootRef"
    class="relative max-w-full min-w-0 break-words"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 文档流：有草稿显示新增内容，否则显示原值 -->
    <div class="w-full" :class="documentClass">
      <DiffContent :content="documentContent" :html="html" />
    </div>
  </div>
</template>
