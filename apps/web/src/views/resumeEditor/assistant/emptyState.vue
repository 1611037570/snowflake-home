<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { quickActions } from "./data";

const emit = defineEmits(["switch-mode"]);
const resumeStore = useResumeStore();
const { currentConfig, currentFixedConfig, selectedModule } = storeToRefs(resumeStore);

const moduleNames = computed(() => {
  const fields = [
    ...(currentFixedConfig.value?.fields || []),
    ...(currentConfig.value?.fields || []),
  ];
  const names = Array.from(
    selectedModule.value,
    (key) => fields.find((item) => item.key === key)?.name || key,
  );
  return names.length ? names : ["整个简历"];
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
        {{ item }}
      </span>
      <span>进行以下操作</span>
    </div>

    <div class="grid w-full max-w-[300px] grid-cols-2 gap-2.5">
      <button
        v-for="action in quickActions"
        :key="action.name"
        type="button"
        class="group flex h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-sf-b bg-white px-3 text-sm font-medium text-sf-base shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sf-theme/40 hover:bg-sf-theme/5 hover:text-sf-theme hover:shadow-md active:scale-[0.98] active:shadow-sm"
        @click="emit('switch-mode', action.type)"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-md bg-sf-bg text-sf-theme transition-colors group-hover:bg-sf-theme/10"
        >
          <SfIcon :icon="action.icon" size="4" />
        </span>
        <span>{{ action.name }}</span>
      </button>
    </div>
  </div>
</template>
