<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveUserContent } from "./registry";

const props = defineProps({
  // 个人信息分片覆盖的块区间，默认展示全部资料。
  blockRange: {
    type: Object,
    default: () => ({ start: 0 /* 起始块序号 */, end: Number.MAX_SAFE_INTEGER /* 结束块序号 */ }),
  },
});

// 个人信息内容按注册表解析：主题维度优先、版式维度兜底，组件内不再维护映射表。
const {
  ui,
  theme: { themeTemplate },
} = useResumePreviewContext();
const current = computed(() => resolveUserContent(themeTemplate.value, ui.value?.layout?.type));
</script>

<template>
  <component :is="current" :block-range="props.blockRange" />
</template>
