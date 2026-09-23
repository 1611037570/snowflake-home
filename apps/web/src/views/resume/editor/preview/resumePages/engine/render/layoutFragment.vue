<script setup lang="ts">
import Title from "../../../components/title/index.vue";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";
import LayoutNodeContent from "./layoutNodeContent.vue";

defineProps<{
  fragment: FragmentPlan;
  node: LayoutNode;
  // 当前分片与上方内容的间距，续段固定为零
  gapTop?: number;
}>();

const emit = defineEmits<{ mouseenter: [moduleKey: string] }>();
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative rounded-xl"
    :data-module="fragment.sourceModuleKey"
    :style="gapTop ? { marginTop: `${gapTop}px` } : undefined"
    @mouseenter="emit('mouseenter', fragment.sourceModuleKey)"
  >
    <Title v-if="fragment.titlePayload" :module-key="fragment.sourceModuleKey" />
    <LayoutNodeContent
      :node="node"
      :payload="fragment.payload"
      :content-range="fragment.contentRange"
      :block-range="fragment.blockRange"
      :decoration="fragment.decoration"
    />
  </div>
</template>
