<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useUserFieldVisibility } from "@/views/resume/theme/components/userModule/useUserFieldVisibility";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { data: previewData, ui } = useResumePreviewContext();
const { isUserFieldHidden } = useUserFieldVisibility();
const user = computed(() => previewData.value?.user?.data || {});
const name = computed(() => isUserFieldHidden("name") ? "" : user.value.name || "");
const position = computed(() => isUserFieldHidden("position") ? "" : user.value.position || "");
const horizontalPadding = computed(() => `${Number(ui.value?.page?.padding?.horizontal) || 0}px`);
</script>

<template>
  <!-- 姓名和求职方向读取真实资料，色块与几何图形只负责首页装饰。 -->
  <div class="relative box-border h-[180px] w-full min-w-0" :style="{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding }">
    <span aria-hidden="true" class="absolute top-0 right-[39px] h-[72px] w-[72px] rounded-full bg-[#FFE279]" />
    <span aria-hidden="true" class="absolute top-[78px] right-[92px] h-[54px] w-[54px] rotate-[-15deg] bg-[#F58F91]" style="clip-path: polygon(50% 0, 100% 100%, 0 100%)" />
    <span aria-hidden="true" class="absolute top-[108px] -left-3 h-[90px] w-[9px] rotate-[-29deg] bg-[#F7AA60]" />
    <div class="relative flex h-full min-w-0 flex-col items-start justify-center gap-3">
      <div v-if="name" class="max-w-full rotate-[-2deg] bg-[#FFDD62] px-6 py-3 text-[43px] leading-[1.15] font-black tracking-[0.12em] text-[#171717]">
        <ResumeField :model-value="name" />
      </div>
      <div v-if="position" class="max-w-full min-w-0 text-[19px] leading-[1.3] font-bold tracking-[0.1em] text-[#F16E68]">
        <ResumeField :model-value="position" />
      </div>
    </div>
  </div>
</template>
