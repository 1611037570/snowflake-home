<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
// 下沿强调色固定为琥珀色：带体跟随主题色，只有这一处细边不随用户改色，
// 否则两条装饰同为一种颜色会失去层次。
const accentColor = "#E0A33E";
</script>

<template>
  <!-- 首页顶部色带自行占位，不绘制纹理或依赖简历数据。 -->
  <div
    class="ink-sidebar-band flex h-9 w-full shrink-0 items-end"
    :style="{ backgroundColor: themeColor }"
    aria-hidden="true"
  >
    <span class="h-[3px] w-full" :style="{ backgroundColor: accentColor }" />
  </div>
</template>
