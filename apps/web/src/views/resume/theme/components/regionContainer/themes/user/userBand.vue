<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
// 个人信息通栏外观：让个人信息整块铺满页面宽度并铺上主题色底纹。
// 页面提供通栏位置，组件只维护底纹和内部留白。
const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

const bandStyle = computed(() => {
  return {
    backgroundColor: themeColor.value,
    color: themeColorContrast.value,
  };
});
</script>

<template>
  <!-- 区域容器保持行方向：栏位用 flex-basis 表达宽度 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
