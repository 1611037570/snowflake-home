<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 解析后的主题编号：写入 data-theme，便于在 DOM 上识别当前主题
  themeId: {
    type: String,
    default: "default",
  },
  // 模块 key：写入 data-module，供编辑器点击定位
  moduleKey: {
    type: String,
    default: "user",
  },
  // 模块附加类名，由编辑器按模块状态下发
  moduleClass: {
    type: String,
    default: "",
  },
});

const {
  theme: { fontValue, lineHeightValue, themeColor, themeColorSoft, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 默认个人信息外观：不绘制底色、边框与留白，未单独设计的主题都落到这里 -->
  <div
    class="resume-module-wrapper resume-user group group/module box-border min-w-0"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue()]"
  >
    <div
      aria-hidden="true"
      class="resume-user__surface"
      :style="{ backgroundColor: themeColorSoft, borderColor: themeColorLine }"
    />
    <slot name="actions" />
    <div class="resume-user__content">
      <slot />
    </div>
    <div aria-hidden="true" class="resume-user__accent" :style="{ backgroundColor: themeColor }" />
    <div
      aria-hidden="true"
      class="resume-user__line resume-user__line--soft"
      :style="{ backgroundColor: themeColorLine }"
    />
    <div
      aria-hidden="true"
      class="resume-user__line resume-user__line--theme"
      :style="{ backgroundColor: themeColor }"
    />
  </div>
</template>

<style lang="scss" scoped>
.resume-user {
  position: relative;
  width: 100%;
}

.resume-user__content {
  position: relative;
  width: 100%;
  min-width: 0;
}

/* 默认外观不绘制任何装饰层，保留元素供主题自行改写 */
.resume-user__surface,
.resume-user__accent,
.resume-user__line {
  display: none;
}
</style>
