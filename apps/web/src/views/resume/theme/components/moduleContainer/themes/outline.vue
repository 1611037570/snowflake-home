<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 模块 key：写入 data-module，供编辑器点击定位
  moduleKey: {
    type: String,
    default: "",
  },
  // 模块附加类名，由编辑器按模块状态下发
  moduleClass: {
    type: String,
    default: "",
  },
});

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 线框模块外框：主题色描边覆盖整块模块 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :data-module="moduleKey"
    :class="moduleClass"
  >
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border rounded-none border"
      :style="{ borderColor: themeColor }"
    />
    <slot name="actions" />
    <!-- 标题槽与正文槽保持原有排列顺序。 -->
    <slot name="title" />
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
