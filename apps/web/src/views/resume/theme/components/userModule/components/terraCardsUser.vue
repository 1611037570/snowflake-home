<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  data: previewData,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
const initial = computed(() => isUserFieldHidden("name") ? "" : String(user.value.name || "").trim().slice(0, 1));
const showPortrait = computed(() => !isUserFieldHidden("avatar") && (user.value.avatar || initial.value));
</script>

<template>
  <!-- 无头像时只使用真实姓名首字，联系方式继续由公共字段组件处理。 -->
  <div class="flex min-h-36 min-w-0 flex-wrap items-center gap-6 p-9">
    <div v-if="showPortrait" class="shrink-0">
      <UserAvatar v-if="user.avatar" class="terra-cards-user__avatar" />
      <div
        v-else
        class="flex h-24 w-24 items-center justify-center rounded-2xl text-2xl"
        :style="{ backgroundColor: themeColor, color: themeColorContrast }"
      >
        {{ initial }}
      </div>
    </div>
    <div class="min-w-[180px] flex-1"><UserName /></div>
    <div class="min-w-[180px] max-w-full flex-[0_1_32%] text-right">
      <UserContact align="right" single-column-grid />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.terra-cards-user__avatar {
  --resume-user-avatar-radius: 16px; // 主题默认头像圆角
}
</style>
