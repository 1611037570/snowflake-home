<script>
// 正文容器负责内部留白，分页据此扣除可用宽高。
const regionPadding = {
  top: 36, // 正文上留白
  right: 48, // 正文右留白
  bottom: 36, // 正文下留白
  left: 48, // 正文左留白
};
export default {
  regionPadding, // 正文区域内部留白
  gapBefore: 0, // 页眉与正文容器自然衔接
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
