<script setup>
import { computed } from "vue";
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

const { data: previewData } = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
</script>

<template>
  <div class="relative z-1 flex w-full min-w-0 items-end gap-9">
    <img
      v-if="!isUserFieldHidden('avatar') && user.avatar"
      :src="user.avatar"
      alt=""
      class="h-[174px] w-[174px] shrink-0 object-contain object-bottom"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-3 pb-3">
      <span class="text-3xl font-bold">Hello, I'm</span>
      <!-- 姓名、副标题及全部可见资料复用公共组件，不按主题裁剪字段。 -->
      <UserName />
      <UserContact class="w-full" />
    </div>
  </div>
</template>
