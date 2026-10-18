<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 浅色几何页眉承载公共个人信息，不增加示例文字与自定义字段。 -->
  <div
    class="light-poster-user relative flex w-full min-w-0 overflow-hidden"
    :style="{ '--light-poster-accent': themeColor }"
  >
    <slot />
  </div>
</template>

<style scoped>
.light-poster-user {
  background: linear-gradient(115deg, #F9E9DE, #F8DDD4);
  color: #3B2A2A;
  --resume-user-name-size: 54px;
  --resume-user-name-line-height: 1.12;
  --resume-user-name-spacing: 0.08em;
  --resume-user-name-color: #3B2A2A;
  --resume-user-subtitle-color: #744944;
  --resume-user-avatar-radius: 0;
  --resume-user-contact-label-color: #744944;
}

.light-poster-user::before {
  content: "";
  position: absolute;
  top: -105px;
  right: -75px;
  width: 275px;
  height: 275px;
  border-radius: 50%;
  background: #EABFAA;
  pointer-events: none;
}

.light-poster-user::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--light-poster-accent);
  pointer-events: none;
}
</style>
