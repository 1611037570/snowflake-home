<template>
  <!-- 仅在 value 与激活值匹配时显示对应内容 -->
  <div v-show="value === modelValue">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "SfTabPane" });
import { inject } from "vue";

// 该项对应的标识值，需与父级 SfTab 的 v-model 值匹配
defineProps<{
  value: any;
}>();

// 从父级 SfTab 注入当前激活值
const modelValue = inject("tabModelValue")!;
</script>

<style scoped></style>
