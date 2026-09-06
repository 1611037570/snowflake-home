<script setup>
import { computed } from "vue";

// 更多配置展开状态：数组含 "1" 表示展开，与模块折叠语义一致
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => [],
});

const expanded = computed(() => collapsed.value.includes("1"));

// 切换展开/收起
function toggle() {
  collapsed.value = expanded.value ? [] : ["1"];
}
</script>

<template>
  <div class="w-full">
    <!-- 更多配置开关 -->
    <div
      class="flex cursor-pointer items-center justify-center gap-3 rounded-3xl border border-sf-b bg-sf-bg px-3 py-2 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
      @click="toggle"
    >
      <span>{{ expanded ? "收起" : "更多" }}</span>
      <SfIcon :icon="expanded ? 'fa6-solid:caret-up' : 'fa6-solid:caret-down'" size="3" />
    </div>
    <!-- 展开后才渲染其他配置 -->
    <div v-if="expanded" class="mt-3">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
