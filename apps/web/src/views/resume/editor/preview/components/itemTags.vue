<script setup>
// 条目标签：跟随首行排布，锁死自身行高避免被主题行高撑高
defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});
const fontValue = inject("fontValue");
// 简历主题色与其浅色派生底：标签配色跟随用户选择的主题
const themeColor = inject("themeColor");
const themeColorSoft = inject("themeColorSoft");
</script>

<template>
  <div
    v-for="tag in tags"
    :key="tag"
    :style="[fontValue(-5), { backgroundColor: themeColorSoft, color: themeColor }]"
    class="flex-c rounded-3xl p-1 leading-none"
  >
    {{ tag }}
  </div>
</template>

<style lang="scss" scoped></style>
