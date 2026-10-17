<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 珊瑚色页眉竖线与暖黄色小标记不进入个人资料字段。 -->
  <div
    class="sunlit-dots-user relative w-full min-w-0 border-l-[3px] border-[#FF6976] [--resume-user-name-size:45px] [--resume-user-name-color:#24364F] [--resume-user-subtitle-size:14px] [--resume-user-subtitle-spacing:0.13em] [--resume-user-subtitle-color:#5A7396] [--resume-user-contact-gap:12px]"
    :style="{ '--sunlit-dots-accent': themeColor }"
  >
    <slot />
  </div>
</template>

<style scoped>
.sunlit-dots-user::after {
  content: "";
  position: absolute;
  top: 65px;
  left: 29px;
  width: 42px;
  height: 5px;
  background: var(--sunlit-dots-accent);
  pointer-events: none;
}
</style>
