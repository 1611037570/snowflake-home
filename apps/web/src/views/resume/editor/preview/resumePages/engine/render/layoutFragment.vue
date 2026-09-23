<script setup lang="ts">
import Title from "../../../components/title/index.vue";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";
import LayoutNodeContent from "./layoutNodeContent.vue";

defineProps<{
  fragment: FragmentPlan;
  node: LayoutNode;
  showDebug?: boolean;
}>();

const emit = defineEmits<{ mouseenter: [moduleKey: string] }>();
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative rounded-xl"
    :class="{ 'resume-debug-paragraph-spacing': showDebug }"
    :data-module="fragment.sourceModuleKey"
    @mouseenter="emit('mouseenter', fragment.sourceModuleKey)"
  >
    <Title v-if="fragment.titlePayload" :module-key="fragment.sourceModuleKey" />
    <LayoutNodeContent
      v-if="fragment.fragment !== 'title'"
      :node="node"
      :payload="fragment.payload"
      :content-range="fragment.contentRange"
      :block-range="fragment.blockRange"
      :decoration="fragment.decoration"
    />
  </div>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 模块段落间距使用独立色带，标记只覆盖真实间距区域 */
.resume-debug-paragraph-spacing :deep([style*="--resume-paragraph-spacing"]) {
  position: relative;
}

.resume-debug-paragraph-spacing :deep([style*="--resume-paragraph-spacing"])::before {
  position: absolute;
  top: calc(0px - var(--resume-paragraph-spacing));
  right: 0;
  left: 0;
  height: var(--resume-paragraph-spacing);
  content: "";
  pointer-events: none;
  @apply bg-sf-theme;
}
</style>
