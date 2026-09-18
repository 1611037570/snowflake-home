<script setup>
import { ref } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

// 六爻问心弹窗可见性
const visible = ref(false);
</script>

<template>
  <!-- 调试模式下的六爻问心入口：同 QA 样式圆形图标，位于 QA 下方 -->
  <div v-if="system.showDebug" class="absolute -bottom-24 left-1/2 -translate-x-1/2">
    <SfTooltip content="六爻问心" placement="left">
      <SfIcon
        icon="mdi:yin-yang"
        size="5"
        boxSize="10"
        class="relative cursor-pointer rounded-full bg-gradient-to-br from-sf-theme to-sf-theme-2 text-sf-theme-text"
        @click="visible = true"
      />
    </SfTooltip>
  </div>

  <!-- 六爻问心弹窗：内容待补充 -->
  <SfModal v-model="visible" title="六爻问心">
    <!-- 内容区：待补充 -->
  </SfModal>
</template>

<style lang="scss" scoped></style>
