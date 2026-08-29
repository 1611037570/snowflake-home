<script setup>
import { showBrowserTip } from "./show";

defineOptions({ name: "SfBrowserTip" });

// 浏览器建议提示：点击后按浏览器类型反馈
const show = () => {
  showBrowserTip();
};
defineExpose({ show });
</script>

<template>
  <div class="cursor-pointer" @click="show">
    <slot>
      <SfIcon icon="mdi:google-chrome" size="5" />
    </slot>
  </div>
</template>

<style lang="scss" scoped></style>
