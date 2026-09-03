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

// 编辑态标记：由 resumePages 注入；仅编辑态多页开放 diff 悬浮交互，单页/只读不开放
const isEdit = inject("isEdit", ref(false));

// 非编辑态：model 直接是 raw 值（如 "张三"），无 proxy 包裹
// 编辑态：model 是 { value, newValue } 代理字段
const valueContent = computed(() => {
  const v = model.value;
  if (v == null) return "";
  return isEdit.value ? (v.value ?? "") : v;
});
const newValueContent = computed(() => {
  if (!isEdit.value) return "";
  return model.value?.newValue ?? "";
});

// 文档流统一渲染：有草稿显示新增，否则显示原值；打印时固定展示原值
const documentContent = computed(() =>
  isPrinting.value ? valueContent.value : newValueContent.value || valueContent.value,
);
// 草稿高亮：仅编辑态可点击时展示光标提示
const documentClass = computed(() => {
  if (isPrinting.value || !newValueContent.value) return "";
  return isEdit.value
    ? "cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]"
    : "rounded-xl bg-[#e8f5e9] text-[#2e7d32]";
});
const hasContent = computed(() =>
  isPrinting.value ? !!valueContent.value : !!(newValueContent.value || valueContent.value),
);

// 悬浮定位：直接以鼠标位置为锚点，浮层只保证不超出屏幕
const handleMouseEnter = (event) => {
  if (!isEdit.value || isPrinting.value || !newValueContent.value) return;
  popover.show({
    field: model.value,
    value: valueContent.value,
    newValue: newValueContent.value,
    html: props.html,
    x: event.clientX,
    y: event.clientY,
  });
};

const handleMouseLeave = () => {
  popover.hide();
};

// 悬浮监听：仅编辑态且有草稿时挂载；打印/无草稿不注册事件
const hoverListeners = computed(() =>
  isEdit.value && !isPrinting.value && newValueContent.value
    ? { mouseenter: handleMouseEnter, mouseleave: handleMouseLeave }
    : {},
);
</script>

<template>
  <!-- HTML 富文本：直接渲染块元素，避免包装div导致分页无法按块拆分；高亮与监听经 class/attrs 透传到各块 -->
  <template v-if="html && hasContent">
    <DiffContent
      :content="documentContent"
      :html="html"
      :class="documentClass"
      v-on="hoverListeners"
    />
  </template>
  <!-- 纯文本：编辑态多页挂载悬浮支持diff弹窗，其余场景仅渲染文档流 -->
  <div
    v-else-if="hasContent"
    class="relative max-w-full min-w-0 break-words"
    :class="documentClass"
    v-on="hoverListeners"
  >
    <DiffContent :content="documentContent" :html="html" />
  </div>
</template>
