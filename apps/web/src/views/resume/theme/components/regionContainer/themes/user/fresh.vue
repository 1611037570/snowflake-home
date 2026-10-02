<script>
// 页眉容器不加内边距，组件声明留白并在模板根元素上用等值类补齐，分页据此测量区域高度。
const regionPadding = {
  top: 36, // 个人信息顶部留白
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 个人信息与正文区域之间的留白
  left: 0, // 水平留白沿用页面设置
};
export default {
  regionPadding, // 分页与组件共用的页眉留白
};
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 清新页眉区域：pt-9/pb-6 与导出的留白等值，细基线透出一段主题色作为页眉收尾 -->
  <div class="fresh-user relative w-full min-w-0 pt-9 pb-6">
    <span
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 left-0 h-px w-full"
      :style="{
        background: `linear-gradient(90deg, ${themeColor}, ${themeColorLine})`,
      }"
    />
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
