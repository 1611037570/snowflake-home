<template>
  <div class="cropper-container" />
</template>

<script setup lang="ts">
import Cropper from "cropperjs";
import { onMounted } from "vue";

// 定义props接收图片地址
const props = defineProps<{
  src: string;
}>();

onMounted(() => {
  const image = new Image();

  image.src = props.src;
  image.alt = "Picture";

  const cropper = new Cropper(image, {
    container: ".cropper-container",
    viewMode: 1, // 限制裁切框不超过图片边界
  });

  console.log(cropper);
});
</script>

<style lang="scss" scoped>
.cropper-container {
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 1.25rem 1.5rem;
  width: 100%;
  height: 100%;

  :deep(cropper-canvas) {
    height: 460px;
  }
}
</style>
