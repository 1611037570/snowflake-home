<script>
// 白色圆弧底板保留固定装饰内边距，测量和渲染共同读取；页面边距与模块间距另由公共布局结算。
const regionPadding = {
  top: 24, // 正文距离底板上沿的固定内边距
  right: 24, // 正文距离底板右沿的固定内边距
  bottom: 24, // 正文距离底板下沿的固定内边距
  left: 24, // 正文距离底板左沿的固定内边距
};
export default {
  regionPadding, // 正文区域内部留白
};
</script>

<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 栏间分割线锚定左栏右边缘，随栏宽与栏高自动变化。 -->
  <div
    class="violet-biography-main relative box-border flex w-full min-w-0 rounded-t-[28px]"
    :style="{ '--violet-divider': themeColor, background: `linear-gradient(180deg, #ead0f5 0px, #ffffff 110px, #ffffff 78%, #f8e8fa 100%)` }"
  >
    <slot />
  </div>
</template>

<style scoped>
.violet-biography-main :deep(> :first-child) {
  position: relative;
  align-self: stretch;
}

.violet-biography-main :deep(> :first-child)::after {
  content: "";
  position: absolute;
  top: 36px;
  right: -12px;
  bottom: 0;
  width: 1px;
  background-color: var(--violet-divider);
}

</style>
