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
  theme: { themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 左侧贯穿细线的模块外框：细线随模块分片在每页延伸 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :data-module="moduleKey"
    :class="moduleClass"
  >
    <slot name="actions" />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 border-l"
      :style="{ borderColor: themeColorLine }"
    />
    <!-- 标题槽与正文槽保持原有排列顺序。 -->
    <slot name="title" />
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
