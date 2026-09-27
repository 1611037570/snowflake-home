<script setup lang="ts">
import { computed } from "vue";
import Container from "../../../components/container.vue";
import { getContainerFragmentStyle, hasContainerStyle } from "../../../components/containerStyle";
import Title from "../../../components/title/index.vue";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";
import LayoutNodeContent from "./layoutNodeContent.vue";
import { useResumePreviewContext } from "../../../shared/previewContext";

const props = defineProps<{
  fragment: FragmentPlan;
  node: LayoutNode;
  showDebug?: boolean;
  /** 当前分片是否位于所在页面的第一位：此时不绘制顶部间距占位 */
  leadingOnPage?: boolean;
}>();

const { ui } = useResumePreviewContext();
const containerConfig = computed(() => ui.value.container || {});
// 只在原先具有内容容器样式的节点上合并交互外壳与通用容器。
const useContainer = computed(() => hasContainerStyle(props.node));
const containerFragmentStyle = computed(() =>
  getContainerFragmentStyle(
    props.fragment.blockRange ?? { start: 0, end: Number.MAX_SAFE_INTEGER },
    props.fragment.contentRange,
    props.fragment.decoration,
    containerConfig.value.radius ?? "0",
  ),
);

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
    <Container
      v-if="fragment.fragment !== 'title' && node.type !== 'spacer' && useContainer"
      :container="containerConfig"
      :style="containerFragmentStyle"
      class="resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!"
      data-layout-block-range
      @click.stop="handleContentClick"
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
    </Container>
    <div
      v-else-if="fragment.fragment !== 'title'"
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
