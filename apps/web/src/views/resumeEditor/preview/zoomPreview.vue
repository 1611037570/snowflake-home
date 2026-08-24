<script setup>
// 简历放大预览组件：全屏遮罩内用 ScaleContainer 缩放展示 resumePages 渲染的全部页
// 数据源由 props 传入，供模板页预览、编辑器全屏查看等场景复用
import { ref } from "vue";
import ResumePages from "./resumePages.vue";
import ScaleContainer from "./ScaleContainer.vue";

defineOptions({ name: "ZoomPreview" });

const props = defineProps({
  // 简历项：{ data, config, fixedConfig, ui }
  item: {
    type: Object,
    required: true,
  },
});

const visible = ref(false);
const open = () => (visible.value = true);
const close = () => (visible.value = false);
defineExpose({ open, close });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col bg-black/70"
      @click.self="close"
    >
      <!-- 顶部栏 -->
      <div class="flex h-12 shrink-0 items-center justify-between px-4">
        <span class="text-sm font-medium text-white">简历预览</span>
        <button
          type="button"
          class="flex h-8 w-8 cursor-pointer! items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          @click="close"
        >
          <SfIcon icon="lucide:x" size="4" />
        </button>
      </div>
      <!-- 缩放预览内容 -->
      <div class="min-h-0 flex-1">
        <ScaleContainer>
          <ResumePages :item="item" show-page-index />
        </ScaleContainer>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped></style>
