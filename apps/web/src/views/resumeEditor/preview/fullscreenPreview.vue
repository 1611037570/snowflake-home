<script setup>
// 简历放大预览组件：全屏遮罩内用 ScaleContainer 缩放展示 resumePages 渲染的全部页
// 数据源由 props 传入，供模板页预览、编辑器全屏查看等场景复用
import { onBeforeUnmount, ref, watch } from "vue";
import ResumePages from "./resumePages/index.vue";
import ScaleContainer from "./ScaleContainer.vue";

defineOptions({ name: "FullscreenPreview" });

// 关闭时通知父组件复位控制状态
const emit = defineEmits(["close"]);

const props = defineProps({
  // 全屏是否可见，由父组件单向控制
  visible: {
    type: Boolean,
    default: false,
  },
  // 简历项：{ data, config, fixedConfig, ui }
  item: {
    type: Object,
    required: true,
  },
});

const handleKeydown = (e) => {
  if (e.key === "Escape" && props.visible) {
    // 关闭由父组件统一处理，发送 close 由父复位 visible
    emit("close");
  }
};

// 仅打开时注册 Escape 监听、关闭后移除，避免未打开的实例常驻 window 监听
watch(
  () => props.visible,
  (val) => {
    if (val) {
      window.addEventListener("keydown", handleKeydown);
    } else {
      window.removeEventListener("keydown", handleKeydown);
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col backdrop-blur-[10px]"
      @click.self="emit('close')"
    >
      <!-- 顶部栏 -->
      <div class="flex h-12 shrink-0 items-center justify-between px-4">
        <span class="text-sm font-medium text-sf-text">简历预览</span>
        <button
          type="button"
          class="flex h-8 w-8 cursor-pointer! items-center justify-center rounded-full text-sf-text transition-colors hover:bg-sf-bg-2"
          @click="emit('close')"
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
