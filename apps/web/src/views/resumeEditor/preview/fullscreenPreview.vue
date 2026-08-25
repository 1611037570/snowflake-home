<script setup>
// 简历放大预览组件：全屏遮罩内用 ScaleContainer 缩放展示 resumePages 渲染的全部页
// 数据源由 props 传入，供模板页预览、编辑器全屏查看等场景复用
import { onBeforeUnmount, onMounted, ref } from "vue";
import ResumePages from "./resumePages/index.vue";
import ScaleContainer from "./ScaleContainer.vue";

defineOptions({ name: "FullscreenPreview" });

defineProps({
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

const handleKeydown = (e) => {
  if (e.key === "Escape" && visible.value) {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col backdrop-blur-[10px]"
      @click.self="close"
    >
      <!-- 顶部栏 -->
      <div class="flex h-12 shrink-0 items-center justify-between px-4">
        <span class="text-sm font-medium text-sf-text">简历预览</span>
        <button
          type="button"
          class="flex h-8 w-8 cursor-pointer! items-center justify-center rounded-full text-sf-text transition-colors hover:bg-sf-bg-2"
          @click="close"
        >
          <SfIcon icon="lucide:x" size="4" />
        </button>
      </div>
      <!-- 缩放预览内容 -->
      <div class="min-h-0 flex-1">
        <ScaleContainer :show-toolbar="false">
          <ResumePages :item="item" mode="preview" />
        </ScaleContainer>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped></style>
