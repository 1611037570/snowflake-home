<script setup>
import { ref } from "vue";

// QA 解答弹窗可见性
const visible = ref(false);
</script>

<template>
  <!-- 右侧工具栏区域的 QA 解答入口：渐变光晕 + 扩散动画的酷炫样式 -->
  <div class="relative">
    <!-- 扩散光晕动画 -->
    <span class="absolute inset-0 animate-ping rounded-full bg-sf-theme-2 [animation-duration:2.5s]"></span>
    <SfTooltip content="QA解答" placement="left">
      <SfIcon
        icon="mdi:chat-question-outline"
        size="5"
        boxSize="10"
        class="relative cursor-pointer rounded-full bg-gradient-to-br from-sf-theme to-sf-theme-2 text-sf-theme-text shadow-lg shadow-sf-theme transition-all duration-400 hover:rotate-180 hover:scale-115 hover:shadow-2xl hover:shadow-sf-theme"
        @click="visible = true"
      />
    </SfTooltip>
  </div>

  <!-- QA 解答弹窗：内容待补充 -->
  <SfModal v-model="visible" title="QA解答">
    <div class="flex w-[400px] flex-col gap-5 p-4">
      <!-- 内容区：待补充 -->
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
