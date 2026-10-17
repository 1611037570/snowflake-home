<script setup>
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import UserAvatar from "./userAvatar.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 黑框资料：直角框围住资料区，框顶线中段被白底盖住、只在左右两角各露一小段；头像跨越框顶线、姓名放大排在框顶线上方，联系方式带图标排在框内；资料区垫纯白底。 -->
  <div
    class="frame-profile-user relative box-border w-full min-w-0 bg-white px-6 pt-6 pb-6"
    :style="{ '--frame-profile-accent': themeColor }"
  >
    <!-- 黑色直角框只画线，不参与区域高度结算；顶线中段由白底层压掉，两端各留一小段露在角上 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-[92px] bottom-0 border-2"
      :style="{ borderColor: 'var(--frame-profile-accent)' }"
    />
    <!-- 纯白背景层：左右与底边都比黑框内缩，露出黑框左、右、下三边，并把顶线中段盖住、只留两端 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-3 top-0 bottom-3 bg-white"
    />
    <div class="relative flex min-w-0 items-start gap-6">
      <UserAvatar class="shrink-0" />
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <UserName class="min-w-0" />
        <UserContact class="min-w-0" align="left" single-column-grid />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 姓名用大字号、资料行用紧凑行距，几何量都按参考图的页眉比例给定。 */
.frame-profile-user {
  --resume-user-name-size: 42px; /* 姓名字号 */
  --resume-user-name-line-height: 1.1; /* 姓名行高 */
  --resume-user-avatar-width: 118px; /* 头像宽度 */
  --resume-user-avatar-height: 118px; /* 头像高度 */
  --resume-user-contact-gap: 6px 12px; /* 资料行距与列间距 */
  --resume-user-contact-item-column-gap: 10px; /* 图标与数值之间的间距 */
}
</style>
