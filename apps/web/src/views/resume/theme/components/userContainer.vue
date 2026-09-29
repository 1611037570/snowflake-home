<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  moduleKey: {
    type: String,
    default: "user",
  },
  moduleClass: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["mouseenter"]);

const {
  theme: {
    userModuleTemplate: themeTemplateRef,
    fontValue,
    lineHeightValue,
    themeColor,
    themeColorSoft,
    themeColorLine,
  },
} = useResumePreviewContext();
// 未提供主题时沿用默认个人信息样式。
const themeTemplate = computed(() => themeTemplateRef.value || "default");
</script>

<template>
  <div
    class="resume-module-wrapper resume-user group group/module box-border min-w-0"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeTemplate"
    :style="[lineHeightValue(), fontValue()]"
    @mouseenter="emit('mouseenter', moduleKey)"
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
    <div
      aria-hidden="true"
      class="resume-user__accent"
      :style="{ backgroundColor: themeColor }"
    />
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

.resume-user[data-theme="classic"],
.resume-user[data-theme="academic"] {
  padding-bottom: 12px;
}

.resume-user[data-theme="minimal"],
.resume-user[data-theme="academic"] {
  display: flex;
  justify-content: center;
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

.resume-user[data-theme="academic"] .resume-user__line {
  display: block;
  width: 100%;
  height: 1px;
}

.resume-user[data-theme="academic"] .resume-user__line--soft {
  margin-top: 12px;
}

.resume-user[data-theme="academic"] .resume-user__line--theme {
  margin-top: 4px;
}
</style>
