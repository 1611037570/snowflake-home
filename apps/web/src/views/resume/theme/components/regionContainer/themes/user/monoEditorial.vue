<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 细线与姓名排版只改变页眉外观，个人字段沿用公共组件。 -->
  <div
    class="mono-editorial-user relative flex w-full min-w-0"
    :style="{ '--mono-editorial-accent': themeColor }"
  >
    <slot />
  </div>
</template>

<style scoped>
.mono-editorial-user {
  --resume-user-name-size: 50px;
  --resume-user-name-line-height: 1.12;
  --resume-user-name-spacing: 0.08em;
  --resume-user-name-color: var(--mono-editorial-accent);
  --resume-user-name-family: Georgia, "Times New Roman", serif;
  --resume-user-avatar-width: 100px;
  --resume-user-avatar-height: 128px;
  --resume-user-avatar-radius: 0;
  --resume-user-subtitle-color: #555555;
  --resume-user-contact-label-color: #666666;
}

.mono-editorial-user::before {
  content: "";
  position: absolute;
  top: -18px;
  right: 0;
  left: 0;
  height: 3px;
  background: var(--mono-editorial-accent);
  pointer-events: none;
}
</style>
