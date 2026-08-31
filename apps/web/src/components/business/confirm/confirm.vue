<template>
  <Teleport to="body">
    <!-- 蒙版 -->
    <Transition name="fade">
      <div
        v-if="isVisible && mask"
        @click="handleCancel"
        class="fixed inset-0 h-full w-full bg-black/50"
        :style="{ zIndex: maskIndex }"
      ></div>
    </Transition>
    <!-- 弹窗内容 -->
    <Transition name="up">
      <div
        v-if="isVisible"
        class="fixed top-1/2 left-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-3xl border bg-sf-primary p-4 shadow-lg"
        :style="{ zIndex: index }"
      >
        <div class="text-xl font-semibold" v-if="title">{{ title }}</div>
        <div class="text-base text-sf-text" v-if="content">{{ content }}</div>
        <!-- 按钮 -->
        <div class="flex items-center justify-end gap-2 text-[14px]">
          <div
            v-if="cancelText"
            @click="handleCancel"
            class="cursor-pointer rounded-2xl bg-sf-bg-2 px-4 py-1"
          >
            {{ cancelText }}
          </div>
          <div
            v-if="confirmText"
            @click="handleConfirm"
            class="cursor-pointer rounded-2xl bg-sf-theme px-4 py-1 text-white"
          >
            {{ confirmText }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { DEFAULT_CONFIRM_OPTIONS } from "./data";

export interface ConfirmProps {
  title?: string;
  content?: string;
  cancelText?: string | boolean;
  confirmText?: string;
  duration?: string;
  index?: number;
  mask?: boolean;
  maskIndex?: number;
  close?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const props = withDefaults(defineProps<ConfirmProps>(), DEFAULT_CONFIRM_OPTIONS);

const isVisible = ref(false);
onMounted(() => (isVisible.value = true));

// 动画时长
const animationTime = computed(() => {
  const num = props.duration?.match(/\d+(\.\d+)?/)?.[0] || "0.3";
  return `${num}s`;
});

// 确认事件
const handleConfirm = () => {
  isVisible.value = false;
  setTimeout(() => props.onConfirm?.(), parseFloat(animationTime.value) * 1000);
};

// 取消事件
const handleCancel = () => {
  isVisible.value = false;
  setTimeout(() => props.onCancel?.(), parseFloat(animationTime.value) * 1000);
};

defineExpose({ close: handleCancel });
</script>

<style lang="scss" scoped>
:root {
  --duration: v-bind(animationTime);
}
.fade-enter-active,
.fade-leave-active {
  transition: all var(--duration);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.up-enter-active,
.up-leave-active {
  transition: all var(--duration);
}
.up-enter-from,
.up-leave-to {
  opacity: 0;
  transform: translate3d(-50%, 100px, 0);
}
</style>
