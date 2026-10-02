<script setup>
import UserHeading from "./userHeading.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { infoPosition, themeColor },
} = useResumePreviewContext();
</script>

<template>
  <UserHeading>
    <template #divider>
      <!-- 现代主题的居中短线由自身维护。 -->
      <div
        v-if="infoPosition === 'center'"
        class="my-1 h-1 w-10 rounded-full"
        :style="{ background: themeColor }"
      />
    </template>
  </UserHeading>
</template>
