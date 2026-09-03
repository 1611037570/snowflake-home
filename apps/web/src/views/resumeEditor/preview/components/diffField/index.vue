<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import DiffContent from "./diffContent.vue";
import { diffFieldRegistry } from "./diffFieldRegistry";

// 字段自增序号：保证同页面多个字段 key 唯一（模块级变量，跨组件实例共享）
let diffFieldSeq = 0;

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

// 编辑态标记：由 resumePages 注入；仅编辑态多页开放 diff 悬浮交互，单页/只读不开放
const isEdit = inject("isEdit", ref(false));

// 字段唯一标识：元素上以 data-field-key 标记，供容器事件委托定位；挂载注册、卸载注销
const fieldKey = `df-${++diffFieldSeq}`;
onMounted(() => {
  diffFieldRegistry.set(fieldKey, { model: () => model.value, html: props.html });
});
onBeforeUnmount(() => {
  diffFieldRegistry.delete(fieldKey);
});

// 字段快照：非编辑态 model 为原始值，编辑态为 { value, newValue } 代理，归一化供渲染判定
const fieldSnap = computed(() => {
  const v = model.value;
  if (v == null) return { value: "", newValue: "", hasNew: false };
  if (!isEdit.value) return { value: v, newValue: "", hasNew: false };
  const value = v.value ?? "";
  const newValue = v.newValue ?? "";
  return { value, newValue, hasNew: newValue !== "" };
});
// 文档流统一渲染：有草稿显示新增，否则显示原值；打印时固定展示原值
const documentContent = computed(() =>
  isPrinting.value ? fieldSnap.value.value : fieldSnap.value.newValue || fieldSnap.value.value,
);
// 草稿高亮：仅编辑态可点击时展示光标提示
const documentClass = computed(() => {
  if (isPrinting.value || !fieldSnap.value.hasNew) return "";
  return isEdit.value
    ? "cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]"
    : "rounded-xl bg-[#e8f5e9] text-[#2e7d32]";
});
// 文档流有内容才渲染（与 documentContent 空判等价，避免重复判断）
const hasContent = computed(() => documentContent.value !== "");
</script>

<template>
  <!-- HTML 富文本：直接渲染块元素，避免包装div导致分页无法按块拆分；高亮与字段标记经 attrs 透传到各块 -->
  <template v-if="html && hasContent">
    <DiffContent
      :content="documentContent"
      :html="html"
      :class="documentClass"
      :data-field-key="fieldKey"
    />
  </template>
  <!-- 纯文本：仅渲染文档流，悬浮交互由容器事件委托按 data-field-key 提供 -->
  <div
    v-else-if="hasContent"
    class="relative max-w-full min-w-0 break-words"
    :class="documentClass"
    :data-field-key="fieldKey"
  >
    <DiffContent :content="documentContent" :html="html" />
  </div>
</template>