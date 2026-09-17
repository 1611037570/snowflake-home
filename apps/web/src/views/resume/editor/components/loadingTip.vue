<script setup>
// 加载提示：编辑区与预览区共用同一视觉，避免多处加载效果不一致
defineProps({
  text: {
    type: String,
    default: "正在加载配置",
  },
});
</script>

<template>
  <div class="flex items-center justify-center gap-3">
    <SfIcon icon="line-md:loading-twotone-loop" size="6" />
    <span class="text-sm text-sf-text-2">{{ text }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
