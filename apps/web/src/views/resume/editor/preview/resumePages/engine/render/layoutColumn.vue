<script setup lang="ts">
import { computed } from "vue";
import type { LayoutNode } from "../types";
import type { ColumnPlan, FragmentPlan } from "../paginate/pagePlan";
import LayoutFragment from "./layoutFragment.vue";

const props = defineProps<{
  column: ColumnPlan;
  nodes: Map<string, LayoutNode>;
  firstFragmentIds: Set<string>;
  isEdit?: boolean;
  moduleClassMap?: Record<string, string>;
  gap: number;
}>();
const emit = defineEmits<{ mouseenter: [moduleKey: string] }>();

const fragments = computed(() => props.column.fragments);
const getNode = (fragment: FragmentPlan) => props.nodes.get(fragment.sourceNodeId);
// 同一节点的续段之间不留模块间距，让分片在页面上连成一块，与分页高度口径一致
const getGapTop = (fragment: FragmentPlan, index: number) =>
  index === 0 || fragment.fragment === "middle" || fragment.fragment === "last" ? 0 : props.gap;
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <template v-for="(fragment, index) in fragments" :key="fragment.fragmentId">
      <LayoutFragment
        v-if="getNode(fragment)"
        :fragment="fragment"
        :node="getNode(fragment)!"
        :is-edit="isEdit"
        :outline-class="moduleClassMap?.[fragment.sourceModuleKey]"
        :show-module-title="firstFragmentIds.has(fragment.fragmentId) && !fragment.titlePayload"
        :gap-top="getGapTop(fragment, index)"
        @mouseenter="emit('mouseenter', $event)"
      />
    </template>
  </div>
</template>
