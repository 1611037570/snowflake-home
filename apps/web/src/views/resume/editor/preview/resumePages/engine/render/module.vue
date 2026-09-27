<script setup lang="ts">
import { computed } from "vue";
import ModuleActions from "../../moduleActions.vue";
import Title from "../../../components/title/index.vue";
import Item from "./item.vue";
import { getItemFragmentStyle, isItemNode } from "./itemStyle";
import LayoutNodeContent from "./layoutNodeContent.vue";
import { useResumePreviewContext } from "../../../shared/previewContext";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";

const props = defineProps<{
  moduleKey: string;
  items: Array<{ fragment: FragmentPlan; columnIndex: number }>;
  nodes: Map<string, LayoutNode>;
  pageIndex: number;
  groupIndex: number;
  isEdit?: boolean;
  showDebug?: boolean;
  moduleClass?: string;
  moveDirections?: { up: boolean; down: boolean };
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}>();
const emit = defineEmits<{
  mouseenter: [moduleKey: string];
  click: [payload: { moduleKey: string; itemIndex?: number }];
  move: [payload: { moduleKey: string; direction: string }];
}>();

const {
  ui,
  theme: { themeTemplate, themeColor },
} = useResumePreviewContext();
const itemConfig = computed(() => ui.value.item || {});
const isOutlineModule = computed(
  () => themeTemplate.value === "outline" && props.moduleKey !== "user",
);
const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
const getItemStyle = (fragment: FragmentPlan) =>
  getItemFragmentStyle(
    fragment.blockRange ?? { start: 0, end: Number.MAX_SAFE_INTEGER },
    fragment.contentRange,
    fragment.decoration,
    itemConfig.value.radius ?? "0",
  );
// 移动方向由模块所在栏位提供；个人信息模块保持固定位置。
const directions = computed(() => {
  if (props.moduleKey === "user") {
    return { up: false, down: false, left: false, right: false };
  }
  return {
    up: props.moveDirections?.up ?? false,
    down: props.moveDirections?.down ?? false,
    left: Boolean(props.canMoveLeft),
    right: Boolean(props.canMoveRight),
  };
});
const handleMove = (direction: string) => emit("move", { moduleKey: props.moduleKey, direction });
const handleContentClick = (node: LayoutNode) => {
  if (node.type === "spacer") return;
  emit("click", { moduleKey: props.moduleKey, itemIndex: node.sourceItemIndex });
};
const isLeadingOnPage = (itemIndex: number) =>
  props.pageIndex > 0 && props.groupIndex === 0 && itemIndex === 0;
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col rounded-3xl"
    :data-module="moduleKey"
    :class="moduleClass"
    @mouseenter="emit('mouseenter', moduleKey)"
  >
    <div
      v-if="isOutlineModule"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border rounded-none border"
      :style="{ borderColor: themeColor }"
    />
    <!-- 模块级操作只渲染一次，所有标题与条目都由模块外壳统一承载。 -->
    <ModuleActions
      v-if="isEdit"
      :model-key="moduleKey"
      :directions="directions"
      @move="handleMove"
    />
    <template v-for="(entry, itemIndex) in items" :key="entry.fragment.fragmentId">
      <template v-if="getNode(entry.fragment)">
        <Title v-if="entry.fragment.titlePayload" :module-key="moduleKey" />
        <Item
          v-if="entry.fragment.fragment !== 'title' && isItemNode(getNode(entry.fragment)!)"
          :item="itemConfig"
          :style="getItemStyle(entry.fragment)"
          class="resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!"
          data-layout-block-range
          @click.stop="handleContentClick(getNode(entry.fragment)!)"
        >
          <LayoutNodeContent
            :node="getNode(entry.fragment)!"
            :payload="entry.fragment.payload"
            :content-range="entry.fragment.contentRange"
            :block-range="entry.fragment.blockRange"
            :decoration="entry.fragment.decoration"
            :show-debug="showDebug"
            :leading-on-page="isLeadingOnPage(itemIndex)"
          />
        </Item>
        <div
          v-else-if="entry.fragment.fragment !== 'title'"
          @click.stop="handleContentClick(getNode(entry.fragment)!)"
          :class="
            getNode(entry.fragment)!.type === 'spacer'
              ? ''
              : 'resume-submodule-content relative rounded-3xl hover:bg-sf-theme-2!'
          "
        >
          <LayoutNodeContent
            :node="getNode(entry.fragment)!"
            :payload="entry.fragment.payload"
            :content-range="entry.fragment.contentRange"
            :block-range="entry.fragment.blockRange"
            :decoration="entry.fragment.decoration"
            :show-debug="showDebug"
            :leading-on-page="isLeadingOnPage(itemIndex)"
          />
        </div>
      </template>
    </template>
  </div>
</template>
