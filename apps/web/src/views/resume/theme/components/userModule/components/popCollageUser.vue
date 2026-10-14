<script setup>
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import UserAvatar from "./userAvatar.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 黑色斜切页眉保留真实姓名与资料，背片和虚线圆只作装饰。 -->
  <div class="relative box-border w-full px-3 pt-6 pb-6">
    <span
      aria-hidden="true"
      class="absolute top-6 right-0 bottom-3 left-6 bg-[#F7D65A]"
      style="clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%)"
    />
    <span
      aria-hidden="true"
      class="absolute top-3 left-0 h-[72px] w-[72px] rounded-full border-[5px] border-dashed"
      :style="{ borderColor: themeColor }"
    />
    <div
      class="relative box-border min-h-[174px] min-w-0 px-9 py-6 text-white"
      :style="{
        backgroundColor: '#242424',
        clipPath: 'polygon(0 10%, 100% 0, 100% 90%, 0 100%)',
        '--resume-user-name-size': '58px',
        '--resume-user-name-line-height': '1.08',
        '--resume-user-name-color': '#FFFFFF',
      }"
    >
      <div class="flex min-w-0 items-center gap-6">
        <div class="flex min-w-0 flex-1 flex-col gap-3">
          <div class="flex min-w-0 flex-wrap items-center gap-3">
            <UserName />
            <span aria-hidden="true" class="h-4 w-4 shrink-0 rounded-full" :style="{ backgroundColor: themeColor }" />
          </div>
          <UserContact class="min-w-0 text-[18px] leading-[1.5] text-[#70DDD2] tracking-[0.18em]" />
        </div>
        <UserAvatar class="pop-collage-user__avatar shrink-0" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 头像描一圈背片同色的黄框，让肖像在黑色页眉上保持可读边界。 */
.pop-collage-user__avatar { --resume-user-avatar-shadow: 0 0 0 3px #f7d65a; }
</style>
