<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 解析后的个人信息外观编号：保留在 data-theme 上，供外观样式按主题分支
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
  <!-- 旧版个人信息外观：绘制层与主题分支原样保留，拆分外观时逐个主题搬走 -->
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

.resume-user__surface {
  display: none;
}

.resume-user__content {
  position: relative;
  width: 100%;
  min-width: 0;
}

.resume-user[data-theme="business"] {
  overflow: hidden;
  border-radius: 12px;
  padding: 8px 12px 8px 16px;
}

.resume-user[data-theme="business"] .resume-user__surface {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  pointer-events: none;
}

.resume-user[data-theme="business"] .resume-user__accent {
  position: absolute;
  inset-block: 0;
  left: 0;
  display: block;
  width: 6px;
}

.resume-user[data-theme="creative"] {
  overflow: hidden;
  border-radius: 12px;
  padding: 12px 16px 12px 12px;
}

.resume-user[data-theme="creative"] .resume-user__surface {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  pointer-events: none;
}

.resume-user[data-theme="creative"] .resume-user__accent {
  position: absolute;
  inset-block: 0;
  right: 0;
  display: block;
  width: 6px;
}

.resume-user[data-theme="fresh"] {
  border-radius: 16px;
  padding: 12px;
}

.resume-user[data-theme="fresh"] .resume-user__surface {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  pointer-events: none;
}

.resume-user[data-theme="vivid"] {
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 12px;
}

.resume-user[data-theme="vivid"] .resume-user__surface {
  position: absolute;
  inset: 0;
  display: block;
  border: 1px solid;
  border-radius: inherit;
  pointer-events: none;
}

.resume-user[data-theme="steady"] {
  padding-left: 15px;
}

.resume-user[data-theme="steady"] .resume-user__accent {
  position: absolute;
  inset-block: 0;
  left: 0;
  display: block;
  width: 3px;
}

.resume-user__accent,
.resume-user__line {
  display: none;
}
</style>
