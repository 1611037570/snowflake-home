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
  <!-- 宋式页眉：顶部距离由页面上边距控制，底部留白承载双线装饰并计入分页测量 -->
  <div
    class="song-elegance-user resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[
      fontValue(),
      lineHeightValue(),
      {
        '--song-rule': themeColorLine,
        '--song-accent': themeColor,
        '--resume-user-name-size': fontValue(14).fontSize, // 姓名字号由内容组件读取
        '--resume-user-name-line-height': 1.35, // 姓名行高
        '--resume-user-name-spacing': '0.2em', // 姓名字距
        '--resume-user-subtitle-spacing': '0.24em', // 副标题字距
        '--resume-user-name-color': themeColor, // 姓名与副标题颜色
      },
    ]"
  >
    <slot name="actions" />
    <slot />
    <span aria-hidden="true" class="song-elegance-user__rule" />
  </div>
</template>

<style scoped>
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
