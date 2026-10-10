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
.violet-biography-main :deep(> [data-resume-column="left"]) {
  position: relative;
  align-self: stretch;
}

.violet-biography-main :deep(> [data-resume-column="left"])::after {
  content: "";
  position: absolute;
  top: 0; /* 从正文内容顶部开始，底板内边距已由公共容器施加。 */
  right: calc(-1 * var(--resume-column-gap-half));
  bottom: 0;
  width: 1px;
  background-color: var(--violet-divider);
}

</style>
