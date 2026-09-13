<script setup>
const props = defineProps({
  // AI 遮罩层默认关闭
  visible: { type: Boolean, default: false },
});
</script>

<template>
  <div
    v-if="props.visible"
    class="absolute inset-0 z-50 flex cursor-not-allowed items-center justify-center backdrop-blur-[1.5px]"
  >
    <div
      class="absolute bottom-12 flex items-center gap-3 rounded-3xl border border-sf-theme-2 bg-sf-primary p-3 text-center"
    >
      <div class="flex items-center gap-1 text-sf-theme">
        <SfIcon icon="lucide:sparkles" size="4" class="" />
        <span class="text-sm font-semibold">小舟AI</span>
      </div>
      <div class="text-xs text-sf-text-3">正在处理中，请稍候，内容即将呈现</div>
      <SfIcon icon="ph:stop-circle-fill" size="7" class="text-sf-error" />
    </div>
  </div>
</template>

<style scoped></style>
