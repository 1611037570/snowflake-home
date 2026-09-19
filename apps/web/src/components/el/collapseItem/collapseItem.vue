<template>
  <Component
    :is="
      h(
        ElCollapseItem,
        { ...$attrs, ref: changeRef, class: ['w-full', $attrs.class] },
        {
          ...$slots,
          default: renderDefault,
        },
      )
    "
  />
</template>

<script setup lang="ts">
import { ElCollapseItem } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";

defineOptions({ name: "SfCollapseItem" });
const vm: any = getCurrentInstance();
const slots = useSlots();
const { lazy = false } = defineProps<{
  // 是否首次展开后再挂载内容
  lazy?: boolean;
}>();
const collapseItem = ref<any>(null);
const hasRendered = ref(!lazy);
const isLoading = ref(false);
let frameId: number | null = null;
let timeoutId: number | null = null;

function changeRef(exports: any) {
  collapseItem.value = exports;
  vm.exposed = exports;
}

if (lazy) {
  // 首次展开先显示骨架，待浏览器完成绘制后再挂载真实内容
  const mountContent = () => {
    timeoutId = window.setTimeout(() => {
      hasRendered.value = true;
      isLoading.value = false;
    }, 0);
  };
  const startLoading = (active: boolean) => {
    if (!active || hasRendered.value || isLoading.value) return;
    isLoading.value = true;
    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      mountContent();
      return;
    }
    frameId = window.requestAnimationFrame(() => {
      frameId = window.requestAnimationFrame(mountContent);
    });
  };

  // 折叠状态只在首次展开时解除内容挂载限制，后续收起保留组件状态
  watch(() => Boolean(collapseItem.value?.isActive), startLoading, { immediate: true });
  onMounted(() => {
    startLoading(Boolean(collapseItem.value?.isActive));
  });
  onBeforeUnmount(() => {
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    if (timeoutId !== null) window.clearTimeout(timeoutId);
  });
}
const renderSkeleton = () =>
  h("div", { class: "flex w-full flex-col gap-3 p-3" }, [
    h("div", { class: "h-3 w-1/3 animate-pulse rounded bg-sf-bg-3" }),
    h("div", { class: "h-9 w-full animate-pulse rounded bg-sf-bg-3" }),
    h("div", { class: "h-9 w-2/3 animate-pulse rounded bg-sf-bg-3" }),
  ]);
const renderDefault = () => {
  if (hasRendered.value) return slots.default?.();
  return isLoading.value ? renderSkeleton() : undefined;
};
defineExpose({} as ComponentInstance<typeof ElCollapseItem>);
</script>

<style scoped>
/* EP 标题包裹层默认 min-width:auto，长标题会撑破折叠头，这里放开收缩 */
:deep(.el-collapse-item__title) {
  min-width: 0;
}
</style>
