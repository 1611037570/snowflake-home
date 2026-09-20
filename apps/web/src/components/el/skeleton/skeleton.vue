<template>
  <ElSkeleton v-bind="$attrs" :animated="animated" :loading="loading" aria-busy="true" class="w-full p-3">
    <template #template>
      <div class="flex w-full flex-col gap-3">
        <ElSkeletonItem variant="text" class="h-3! w-1/3!" />
        <ElSkeletonItem variant="rect" class="h-9! w-full!" />
        <ElSkeletonItem variant="rect" class="h-9! w-2/3!" />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";

defineOptions({ name: "SfSkeleton", inheritAttrs: false });

withDefaults(
  defineProps<{
    // 骨架内容默认保持加载状态，并开启 Element Plus 动画
    loading?: boolean;
    animated?: boolean;
  }>(),
  {
    loading: true,
    animated: true,
  },
);
</script>
