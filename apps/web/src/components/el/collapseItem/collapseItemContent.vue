<template>
  <template v-if="renderContent">
    <Suspense>
      <template #default>
        <slot />
      </template>
      <template #fallback>
        <div class="flex w-full flex-col gap-3 p-3" aria-busy="true">
          <div class="h-3 w-1/3 animate-pulse rounded bg-sf-bg-3" />
          <div class="h-9 w-full animate-pulse rounded bg-sf-bg-3" />
          <div class="h-9 w-2/3 animate-pulse rounded bg-sf-bg-3" />
        </div>
      </template>
    </Suspense>
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  active: boolean;
  lazy: boolean;
}>();
const renderContent = ref(!props.lazy);

// 首次展开后保留内容挂载，避免收起时重复加载异步组件
watch(
  () => props.active,
  (active) => {
    if (active) renderContent.value = true;
  },
  { immediate: true },
);
</script>
