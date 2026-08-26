<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const emit = defineEmits(["switch-mode"]);
const resumeStore = useResumeStore();
const { selectedModule } = storeToRefs(resumeStore);

const moduleNames = computed(() => {
  return selectedModule.value.length
    ? selectedModule.value
    : [
        {
          name: "整个简历",
        },
      ];
});
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-5 px-5 text-center">
    <div class="flex-c gap-3 text-2xl font-bold text-sf-base">
      你好，我是 <span class="text-sf-theme">{{ $t("router.resumeAI") }}</span>
      <SfIcon icon="lucide:sparkles" class="text-sf-theme" size="6" />
    </div>
    <div class="text-base text-sf-theme">{{ $t("router.resumeAIDesc") }}</div>
    <div
      class="flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium text-sf-base"
    >
      <span>我可以根据你的</span>
      <span
        v-for="item in moduleNames"
        :key="item"
        class="rounded-full bg-sf-theme/10 px-2.5 py-0.5 text-sf-theme ring-1 ring-sf-theme/10"
      >
        {{ item.name }}
      </span>
      <span>进行以下操作</span>
    </div>
  </div>
</template>
