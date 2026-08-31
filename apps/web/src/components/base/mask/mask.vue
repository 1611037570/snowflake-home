<template>
  <Transition name="mask-fade" :disabled="isDisabled" appear>
    <div
      v-if="show"
      class="fixed inset-0 bg-sf-transparent-3"
      :style="[backgroundStyle, { zIndex: index }]"
      v-bind="$attrs"
    ></div>
  </Transition>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref, type Ref } from "vue";
import { useSystemStore } from "@/stores/modules/system";

defineOptions({ name: "SfMask", inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** 是否显示 */
    show: boolean;
    /** 层级 */
    index?: number;
    /** 是否显式禁用动画 */
    disabled?: boolean;
    /** 首次渲染是否播放进入动画 */
    appear?: boolean;
  }>(),
  { index: 80, disabled: false, appear: true },
);

// 读取系统性能模式（pinia 未注入时回退为默认值）
let performanceMode: Ref<boolean> = ref(false);
try {
  performanceMode = storeToRefs(useSystemStore()).performanceMode;
} catch {
  /* pinia 未注入（如 confirm 独立挂载场景）时保持默认 */
}

/** 性能模式或显式禁用时关闭动画 */
const isDisabled = computed(() => props.disabled || performanceMode.value);

/** 毛玻璃背景，性能模式下关闭模糊 */
const backgroundStyle = computed(() =>
  performanceMode.value
    ? {
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        backgroundColor: "var(--sf-transparent)",
      }
    : { backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" },
);
</script>

<style lang="scss" scoped>
.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.3s ease;
}
.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}
</style>
