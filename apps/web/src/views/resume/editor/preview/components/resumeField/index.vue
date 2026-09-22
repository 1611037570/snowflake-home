<script setup>
import { computed } from "vue";
import FieldContent from "./content.vue";
import { isContentEmpty } from "../../modules/validData";

// 简历字段文本渲染器：预览只读取原始字段值
const model = defineModel();

const props = defineProps({
  html: {
    type: Boolean,
    default: false,
  },
  boxClass: {
    type: String,
    default: "",
  },
  // 外层标签由调用方声明，字段组件不自行决定文字布局。
  tag: {
    type: String,
    default: "div",
  },
});

const fieldValue = computed(() => model.value);
const hasContent = computed(() => {
  const value = fieldValue.value;
  // Skip the editor's canonical empty paragraph before mounting HTML blocks.
  if (props.html && isContentEmpty(value)) return false;
  // 纯文本字段同样忽略纯空白，避免渲染出空白行
  if (typeof value === "string") return value.trim() !== "";
  return value != null && value !== "";
});
</script>

<template>
  <template v-if="html && hasContent">
    <FieldContent :content="fieldValue" :html="html" />
  </template>
  <component
    v-else-if="hasContent"
    :is="tag"
    class="relative max-w-full min-w-0 break-words"
  >
    <FieldContent :content="fieldValue" :html="html" :class="boxClass" />
  </component>
</template>
