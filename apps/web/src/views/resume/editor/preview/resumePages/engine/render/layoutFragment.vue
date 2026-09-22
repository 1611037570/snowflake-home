<script setup lang="ts">
import ModuleActions from "../../moduleActions.vue";
import Title from "../../../components/title/index.vue";
import type { LayoutNode } from "../types";
import type { FragmentPlan } from "../paginate/pagePlan";
import LayoutNodeContent from "./layoutNodeContent.vue";

const props = defineProps<{
  fragment: FragmentPlan;
  node: LayoutNode;
  isEdit?: boolean;
  outlineClass?: string;
  showModuleTitle?: boolean;
}>();

const emit = defineEmits<{ mouseenter: [moduleKey: string] }>();
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative rounded-xl"
    :data-module="fragment.sourceModuleKey"
    :class="outlineClass"
    @mouseenter="emit('mouseenter', fragment.sourceModuleKey)"
  >
    <ModuleActions v-if="isEdit" :model-key="fragment.sourceModuleKey" />
    <Title
      v-if="showModuleTitle || fragment.titlePayload"
      :module-key="fragment.sourceModuleKey"
    />
    <LayoutNodeContent
      :node="node"
      :payload="fragment.payload"
      :content-range="fragment.contentRange"
      :decoration="fragment.decoration"
    />
  </div>
</template>
