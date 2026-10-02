<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 解析后的主题编号：写入 data-theme，便于在 DOM 上识别当前主题
  themeId: {
    type: String,
    default: "songElegance",
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
  theme: { fontValue, lineHeightValue, themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 宋式页眉：姓名放大居中，页眉底部用长细线加短粗线收束，内边距计入分页测量 -->
  <div
    class="song-elegance-user resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 pt-6 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[
      fontValue(),
      lineHeightValue(),
      {
        '--song-rule': themeColorLine,
        '--song-accent': themeColor,
        '--song-name-size': fontValue(14).fontSize,
      },
    ]"
  >
    <slot name="actions" />
    <slot />
    <span aria-hidden="true" class="song-elegance-user__rule" />
  </div>
</template>

<style scoped>
/* 姓名取主题色并按宋体大字距排布，字号与行高在字段默认值上单独收紧 */
.song-elegance-user :deep(.tracking-wide > div) {
  font-size: var(--song-name-size) !important;
  line-height: 1.35 !important;
  letter-spacing: 0.2em;
  color: var(--song-accent);
}

/* 副标题（职位、年龄等）收在姓名下方，用主题色与更宽的字距与姓名呼应 */
.song-elegance-user :deep(.tracking-wide > span) {
  letter-spacing: 0.24em;
  color: var(--song-accent);
}

/* 头像加一圈细线，与页边装裱呼应 */
.song-elegance-user :deep(img) {
  border-radius: 2px;
  box-shadow: 0 0 0 1px var(--song-rule);
}

/* 页眉底线：长细线铺满内容宽度，中间叠一段短粗线 */
.song-elegance-user__rule {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background: var(--song-rule);
}

.song-elegance-user__rule::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 56px;
  height: 2px;
  margin-left: -28px;
  background: var(--song-accent);
}
</style>
