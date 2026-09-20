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
import { getCurrentInstance, h, onMounted, ref, useSlots, watch } from "vue";
import CollapseItemContent from "./collapseItemContent.vue";

defineOptions({ name: "SfCollapseItem" });
const vm: any = getCurrentInstance();
const slots = useSlots();
const { lazy = false } = defineProps<{
  // 是否首次展开后再挂载内容
  lazy?: boolean;
}>();
const collapseItem = ref<any>(null);
const isActive = ref(false);

function changeRef(exports: any) {
  collapseItem.value = exports;
  vm.exposed = exports;
}

if (lazy) {
  // 折叠状态只在首次展开时解除内容挂载限制，后续收起保留组件状态
  watch(
    () => Boolean(collapseItem.value?.isActive),
    (active) => {
      isActive.value = active;
    },
    { immediate: true },
  );
  onMounted(() => {
    isActive.value = Boolean(collapseItem.value?.isActive);
  });
}
const renderDefault = () => {
  if (!lazy) return slots.default?.();
  return h(CollapseItemContent, { active: isActive.value, lazy }, {
    default: () => slots.default?.(),
  });
};
defineExpose({} as ComponentInstance<typeof ElCollapseItem>);
</script>

<style scoped>
/* EP 标题包裹层默认 min-width:auto，长标题会撑破折叠头，这里放开收缩 */
:deep(.el-collapse-item__title) {
  min-width: 0;
}
</style>
