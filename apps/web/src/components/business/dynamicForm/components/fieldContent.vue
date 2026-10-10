<template>
  <Suspense @pending="beginRender" @resolve="finishRender">
    <slot />
    <template #fallback>
      <SfSkeleton />
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount } from "vue";
import SfSkeleton from "@/components/el/skeleton";
import { FORM_READY } from "../code/formReady";

const readiness = inject(FORM_READY, undefined);
let renderDone = () => {};
// 只替换当前字段的加载占位，同时登记到表单统一就绪统计。
const beginRender = () => {
  renderDone();
  renderDone = readiness?.begin() ?? (() => {});
};
const finishRender = () => renderDone();
// 字段加载途中被移除时释放任务，避免表单一直等待。
onBeforeUnmount(finishRender);
</script>
