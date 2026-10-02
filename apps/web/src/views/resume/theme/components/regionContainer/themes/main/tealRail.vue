<script>
// 正文留白由组件声明，分页和真实预览读取相同尺寸。
const regionPadding = {
  top: 24, // 两栏内容距页面顶部的留白
  right: 0, // 右侧留白沿用页面设置
  bottom: 0, // 底部留白沿用页面设置
  left: 0, // 左侧留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 右栏自己的边线随栏位铺满页高，内容仍按普通双栏自然排版。 -->
  <div class="teal-rail flex w-full min-w-0" :style="{ '--teal-rail-color': themeColor }">
    <slot />
  </div>
</template>

<style scoped>
.teal-rail :deep(> :nth-child(2)) {
  box-sizing: border-box;
  align-self: stretch;
  position: relative;
  padding-left: 48px;
  --teal-rail-title-offset: 48px;
}

.teal-rail :deep(> :nth-child(2))::before {
  content: "";
  position: absolute;
  top: 15px;
  bottom: 0;
  left: 0;
  width: 1px;
  background-color: var(--teal-rail-color);
}

/* 左栏标题保持纯文字，右栏标题负责节点和横线。 */
.teal-rail :deep(> :first-child .teal-rail-title__dot),
.teal-rail :deep(> :first-child .teal-rail-title__line) {
  display: none;
}
</style>
