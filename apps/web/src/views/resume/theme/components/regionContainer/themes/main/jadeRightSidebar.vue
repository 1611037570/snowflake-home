<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

// 资料卡用整列墨玉底衬托反白文字，烫金只落在标签与头像外圈。
const GOLD = "#C9B682";
const sidebarStyle = computed(() => ({
  "--jade-card": themeColor.value, // 右栏卡片底色
  "--jade-contrast": themeColorContrast.value, // 卡内文字按底色亮度反白
  "--jade-gold": GOLD, // 资料标签、副标题与头像描边的烫金色
}));
</script>

<template>
  <!-- 整列墨玉底以右栏为基准铺到纸张右、上、下三边，左缘停在栏间中线。 -->
  <div class="jade-right-sidebar isolate" :style="sidebarStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "../../columnBleed" as *;

/* 整列墨玉底托住资料卡，栏内尺寸仍由公共盒子决定。 */
.jade-right-sidebar :deep(> [data-resume-column="right"]) {
  isolation: isolate;
  color: var(--jade-contrast);
  --resume-user-name-color: var(--jade-contrast); /* 姓名反白 */
  --resume-user-name-family: "SimSun, Songti SC, STSong, serif"; /* 宋体姓名压住深色底 */
  --resume-user-name-spacing: 0.08em; /* 姓名加宽字距 */
  --resume-user-name-weight: 500; /* 深色底上减轻字重，避免糊字 */
  --resume-user-subtitle-color: var(--jade-gold); /* 副标题用烫金区分层级 */
  --resume-user-contact-label-color: var(--jade-gold); /* 资料标签烫金 */
  --resume-user-icon-color: var(--jade-gold); /* 资料图标烫金 */
  --resume-user-contact-gap: 10px; /* 窄栏资料行距收紧 */
  --resume-user-avatar-radius: 9999px; /* 头像取圆，呼应印章式图章 */
  --resume-user-avatar-border: 1px solid color-mix(in srgb, var(--jade-gold) 55%, transparent); /* 头像外圈淡金 */
}

/* 底色以右栏为定位基准，向纸张三边铺满并停在栏间中缝。 */
.jade-right-sidebar :deep(> [data-resume-column="right"])::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: calc(-1 * var(--resume-page-inset-vertical, 0px));
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  right: calc(-1 * var(--resume-page-inset-horizontal, 0px));
  left: 0;
  pointer-events: none;
  background-color: var(--jade-card);
}
</style>
