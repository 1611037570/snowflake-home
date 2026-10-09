<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 解析后的主题编号：写入 data-theme，便于在 DOM 上识别当前主题
  themeId: {
    type: String,
    default: "academic",
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
  theme: { fontValue, lineHeightValue },
} = useResumePreviewContext();
</script>

<template>
  <!-- 学术个人信息外观：保留资料内容，移除底部两条分隔线。 -->
  <div
    class="resume-module-wrapper resume-user group group/module box-border min-w-0"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue()]"
  >
    <slot name="actions" />
    <div class="resume-user__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resume-user {
  position: relative;
  width: 100%;
  display: flex;
  /* 个人信息内容保持纵向排列。 */
  flex-direction: column;
  justify-content: center;
  /* 底部不叠加留白，间距由区域布局统一控制。 */
}

.resume-user__content {
  position: relative;
  width: 100%;
  min-width: 0;
}


</style>
