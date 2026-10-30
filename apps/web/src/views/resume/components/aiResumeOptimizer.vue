<script setup lang="ts">
import { ref } from "vue";
import OptimizationPanel from "./aiOptimize/optimizationPanel.vue";

// 编辑器内一键优化：外壳只提供弹窗与高度，功能本身由 panel 承担。
const visible = defineModel<boolean>({ default: false });
const props = defineProps<{ resumeId: string /* 打开时选定的简历编号，本弹窗内不随编辑器切换。 */ }>();
const panel = ref<InstanceType<typeof OptimizationPanel> | null>(null);
// 保存期间拦截重复关闭；候选阶段关闭只释放草稿。
const beforeClose = () => panel.value?.canClose() ?? true;
</script>

<template>
  <SfModal v-model="visible" :title="$t('resumeNavAiOptimize')" width="min(92vw, 1080px)" :before-close="beforeClose" bg-class="bg-sf-primary">
    <div class="h-[75svh]">
      <OptimizationPanel ref="panel" :resume-id="props.resumeId" @close="visible = false" />
    </div>
  </SfModal>
</template>
