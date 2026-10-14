<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColorSoft, themeColorLine },
} = useResumePreviewContext();

// 个人信息通栏只铺一层浅底纹与收尾细线，内部留白由公共区域容器施加。
const bandStyle = computed(() => ({
  backgroundColor: themeColorSoft.value, // 主题色浅底纹
  borderBottom: `1px solid ${themeColorLine.value}`, // 与正文之间的收尾细线
}));
</script>

<template>
  <!-- 区域容器保持行方向，栏位宽度仍由公共几何决定。 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
  </div>
</template>
