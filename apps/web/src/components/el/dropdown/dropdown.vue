<template>
  <ElDropdown
    ref="dropdownRef"
    v-bind="$attrs"
    :effect="theme"
    :trigger="trigger"
    :max-height="resolvedMaxHeight"
    @visible-change="handleVisibleChange"
  >
    <template #default>
      <slot name="default"></slot>
    </template>
    <template #dropdown>
      <slot name="dropdown"></slot>
    </template>
  </ElDropdown>
</template>

<script setup lang="ts">
import { ElDropdown } from "element-plus";
import type { ComponentInstance } from "vue";
import { computed, provide, ref, watch } from "vue";
import { useWindowSize } from "@vueuse/core";

import { useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";

const props = withDefaults(
  defineProps<{
    /** 下拉触发方式 */
    trigger?: "hover" | "click" | "contextmenu";
    /** 下拉内容最大高度，未设置时根据触发位置自动适配视口 */
    maxHeight?: number | string;
  }>(),
  {
    trigger: "hover",
    maxHeight: undefined,
  },
);

defineOptions({ inheritAttrs: false, name: "SfDropdown" });
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);
const { height: viewportHeight } = useWindowSize();

// 使用稳定的模板 ref，避免渲染期间通过回调 ref 修改响应式状态。
const dropdownRef = ref<ComponentInstance<typeof ElDropdown>>();
const isVisible = ref(false);
const availableHeight = ref("calc(100vh - 24px)");
const resolvedMaxHeight = computed(() => props.maxHeight ?? availableHeight.value);

// 取触发点上下较大的可用空间，交由弹层自动选择不越界的展开方向。
const updateAvailableHeight = () => {
  const triggerElement = dropdownRef.value?.$el as HTMLElement | undefined;
  if (!triggerElement) return;
  const rect = triggerElement.getBoundingClientRect();
  const viewportGap = 12;
  const spaceAbove = rect.top - viewportGap;
  const spaceBelow = viewportHeight.value - rect.bottom - viewportGap;
  availableHeight.value = `${Math.max(spaceAbove, spaceBelow, 0)}px`;
};
const handleVisibleChange = (visible: boolean) => {
  isVisible.value = visible;
  if (visible) updateAvailableHeight();
};
// 窗口尺寸变化时同步收紧已打开弹层的可用高度。
watch(viewportHeight, () => {
  if (isVisible.value) updateAvailableHeight();
});

const handleClose = () => dropdownRef.value?.handleClose?.();
// 向下拉内容提供统一关闭方法，列表点击时自动收起当前下拉。
provide("sfDropdownClose", handleClose);
// 内部选择器弹层挂到下拉弹层根节点，避开菜单滚动层并保留内部点击判定。
provide(
  "sfDropdownContent",
  computed(() => {
    const dropdown = dropdownRef.value as any;
    return dropdown?.popperRef?.contentRef?.contentRef?.popperContentRef;
  }),
);
defineExpose({ handleClose });
</script>

<style scoped>
:deep(.el-dropdown__popper .el-dropdown-menu) {
  background-color: red !important;
}
</style>
