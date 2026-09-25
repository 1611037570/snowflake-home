<script setup lang="ts">
import Title from "../../../components/title/index.vue";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";
import LayoutNodeContent from "./layoutNodeContent.vue";

const props = defineProps<{
  fragment: FragmentPlan;
  node: LayoutNode;
  showDebug?: boolean;
  /** 当前分片是否位于所在页面的第一位：此时不绘制顶部间距占位 */
  leadingOnPage?: boolean;
}>();

const emit = defineEmits<{
  mouseenter: [moduleKey: string];
  click: [payload: { moduleKey: string; itemIndex?: number }];
}>();

const handleContentClick = () => {
  if (props.node.type === "spacer") return;
  emit("click", {
    moduleKey: props.fragment.sourceModuleKey,
    itemIndex: props.node.sourceItemIndex,
  });
};
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative rounded-xl"
    :data-module="fragment.sourceModuleKey"
    @mouseenter="emit('mouseenter', fragment.sourceModuleKey)"
  >
    <Title v-if="fragment.titlePayload" :module-key="fragment.sourceModuleKey" />
    <div
      v-if="fragment.fragment !== 'title'"
      @click.stop="handleContentClick"
      :class="
        node.type === 'spacer'
          ? ''
          : 'resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!'
      "
    >
      <LayoutNodeContent
        :node="node"
        :payload="fragment.payload"
        :content-range="fragment.contentRange"
        :block-range="fragment.blockRange"
        :decoration="fragment.decoration"
        :show-debug="showDebug"
        :leading-on-page="leadingOnPage"
      />
    </div>
  </div>
</template>

<style scoped></style>
