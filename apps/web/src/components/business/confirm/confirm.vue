<template>
  <Teleport to="body">
    <!-- 蒙版 -->
    <SfMask :show="isVisible && mask" :index="maskIndex" @click="handleCancel" />
    <!-- 弹窗内容 -->
    <Transition name="up">
      <div
        v-if="isVisible"
        ref="dialogRef"
        tabindex="-1"
        class="fixed top-1/2 left-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-4"
        :style="{ '--duration': animationTime, zIndex: index }"
      >
        <div class="text-xl font-semibold" v-if="title">{{ title }}</div>
        <div class="text-base text-sf-text-2" v-if="content">{{ content }}</div>
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
import { computed, nextTick, onMounted, ref } from "vue";
import { onKeyStroke } from "@vueuse/core";
import SfMask from "@/components/base/mask";
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
const dialogRef = ref<HTMLElement | null>(null);

// 打开后自动聚焦弹窗，使回车/ESC 作用于弹窗而非背景元素
onMounted(() => {
  isVisible.value = true;
  nextTick(() => dialogRef.value?.focus());
});

// 动画时长
const animationTime = computed(() => {
  const num = props.duration?.match(/\d+(\.\d+)?/)?.[0] || "0.3";
  return `${num}s`;
});

// 确认事件（关闭后卸载容器，避免重复触发溢出）
const handleConfirm = () => {
  if (!isVisible.value) return;
  isVisible.value = false;
  setTimeout(() => props.onConfirm?.(), parseFloat(animationTime.value) * 1000);
};

// 取消事件
const handleCancel = () => {
  if (!isVisible.value) return;
  isVisible.value = false;
  setTimeout(() => props.onCancel?.(), parseFloat(animationTime.value) * 1000);
};

// ESC 取消、Enter 确认（阻止焦点在弹窗外时回车触发背景元素）
onKeyStroke("Escape", (e) => {
  e.preventDefault();
  handleCancel();
});
onKeyStroke("Enter", (e) => {
  e.preventDefault();
  handleConfirm();
});

defineExpose({ close: handleCancel });
</script>

<style lang="scss" scoped>
.up-enter-active,
.up-leave-active {
  transition: all var(--duration);
}
.up-enter-from,
.up-leave-to {
  opacity: 0;
  translate: -50% calc(-50% + 100px);
}
</style>
