<script setup>
import { inject, provide } from "vue";
import ResumeModule from "../modules/index.vue";

defineProps({
  allModules: {
    type: Array,
    required: true,
  },
});

// 测量容器不参与 diff 交互：编辑态根档位 full 降为 render（仅渲染草稿），只读态沿用 none
const parentDiffMode = inject("diffMode", "none");
provide("diffMode", parentDiffMode === "full" ? "render" : parentDiffMode);
</script>

<template>
  <div class="flex flex-col">
    <template v-for="(item, index) in allModules" :key="index">
      <ResumeModule :name="item.key" class="resume-module-wrapper" />
    </template>
  </div>
</template>
