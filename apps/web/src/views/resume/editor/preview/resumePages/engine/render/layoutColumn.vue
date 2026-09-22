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
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col" :style="{ gap: `${gap}px` }">
    <template v-for="fragment in fragments" :key="fragment.fragmentId">
      <LayoutFragment
        v-if="getNode(fragment)"
        :fragment="fragment"
        :node="getNode(fragment)!"
        :is-edit="isEdit"
        :outline-class="moduleClassMap?.[fragment.sourceModuleKey]"
        :show-module-title="firstFragmentIds.has(fragment.fragmentId) && !fragment.titlePayload"
        @mouseenter="emit('mouseenter', $event)"
      />
    </template>
  </div>
</template>
