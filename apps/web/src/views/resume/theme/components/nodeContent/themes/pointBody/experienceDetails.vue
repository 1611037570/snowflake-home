<script setup lang="ts">
import type { NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import ExperienceDetails from "../../contents/experienceDetails.vue";

// 点线主题为共用经历组件启用段首方点。
defineProps<NodeContentProps>();
</script>

<template>
  <ExperienceDetails v-bind="$props" point-body />
</template>
