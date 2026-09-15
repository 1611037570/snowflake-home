<script setup>
import { computed } from "vue";
import FieldContent from "./content.vue";
import { isContentEmpty } from "../../modules/validData";

// 简历字段文本渲染器：接收原始值或 { value } 字段代理
const model = defineModel();

const props = defineProps({
  html: {
    type: Boolean,
    default: false,
  },
});

const fieldValue = computed(() => {
  const value = model.value;
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
});
const hasContent = computed(() => {
  const value = fieldValue.value;
  // Skip the editor's canonical empty paragraph before mounting HTML blocks.
  if (props.html && isContentEmpty(value)) return false;
  return value != null && value !== "";
});
</script>

<template>
  <template v-if="html && hasContent">
    <FieldContent :content="fieldValue" :html="html" />
  </template>
  <div v-else-if="hasContent" class="relative max-w-full min-w-0 break-words">
    <FieldContent :content="fieldValue" :html="html" />
  </div>
</template>
