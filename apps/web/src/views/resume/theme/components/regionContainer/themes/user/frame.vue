<script>
// 个人信息区域留白：由组件与分页共用，模板内边距换算后与这里的数值一致。
export default {
  regionPadding: {
    top: 12, // 个人信息顶部留白，与模板 pt-3 一致
    right: 0, // 水平留白由页面设置控制
    bottom: 12, // 个人信息底部留白，与模板 pb-3 一致
    left: 0, // 水平留白由页面设置控制
  },
  gapBefore: 0, // 页眉与正文白底自然相接，不在两者之间插入区域间距
};
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 页眉收口：顶部主题色块压住个人信息上沿，底部细线在正文白底之前收口。
const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 色块与细线只作装饰，用绝对定位绘制，不参与留白与测量尺寸。 -->
  <div
    class="frame-user relative box-border w-full min-w-0 pt-3 pb-3"
    :style="{ '--frame-user-accent': themeColor, '--frame-user-line': themeColorLine }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* 顶部色块：向右铺满内容宽度，用加深的主题色与红色纸张背景区分 */
.frame-user::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 6px;
  background: color-mix(in srgb, var(--frame-user-accent) 88%, black);
  pointer-events: none;
}

/* 底部收口细线：与正文白底上沿相接，形成页眉的收边 */
.frame-user::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background-color: var(--frame-user-line);
  pointer-events: none;
}
</style>
