<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useUserFieldVisibility } from "../../userModule/useUserFieldVisibility";

defineProps({
  /** 当前主题编号，供预览识别外观 */
  themeId: {
    /** 主题编号类型 */
    type: String,
    /** 默认主题编号 */
    default: "curvedHeader",
  },
  /** 模块编号，供编辑器点击定位 */
  moduleKey: {
    /** 模块编号类型 */
    type: String,
    /** 默认个人信息模块 */
    default: "user",
  },
  /** 编辑器下发的模块状态类名 */
  moduleClass: {
    /** 类名值类型 */
    type: String,
    /** 无附加状态时使用空类名 */
    default: "",
  },
});
const {
  data,
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
const { isUserFieldHidden } = useUserFieldVisibility();
// 有头像时使用页眉自身的上留白，无头像时仍将姓名放在弧形背景下方。
const hasAvatar = computed(() => !isUserFieldHidden("avatar") && !!data.value?.user?.data?.avatar);
</script>

<template>
  <div
    class="resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0"
    :class="[moduleClass, hasAvatar ? 'pt-0' : 'pt-[114px]']"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue()]"
  >
    <slot name="actions" />
    <div class="curved-header__content relative w-full min-w-0">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 圆形头像跨在弧线两侧，覆盖规则仅作用于本主题的个人信息内容。 */
.curved-header__content :deep(img) {
  width: 108px;
  height: 108px;
  border-radius: 50%;
  /* 优先保留头像顶部，避免居中裁切截掉头部。 */
  object-position: center top;
}
</style>
