<script setup>
// 条目标签：跟随首行排布，锁死自身行高避免被主题行高撑高
defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});
const fontValue = inject("fontValue");
</script>

<template>
  <div
    v-for="tag in tags"
    :key="tag"
    :style="fontValue(-5)"
    class="flex-c rounded-3xl bg-sf-theme p-1 leading-none text-sf-theme-text"
  >
    {{ tag }}
  </div>
</template>

<style lang="scss" scoped></style>
