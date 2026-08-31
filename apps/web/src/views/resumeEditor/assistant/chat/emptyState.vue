<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const emit = defineEmits(["switch-mode", "suggest"]);
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

// 建议操作卡片：点击后进入引导式对话流程
const suggestCards = [
  {
    icon: "ph:translate-duotone",
    title: "简历翻译",
    desc: "将简历翻译成英文或中文",
    flow: "resumeTranslate",
  },
  {
    icon: "ph:microphone-duotone",
    title: "面试自我介绍",
    desc: "将简历转成面试口头稿",
    flow: "selfIntro",
  },
];

// 点击建议卡片，启动对应流程
const handleSuggest = (card) => {
  emit("suggest", { flow: card.flow });
};
</script>

<template>
  <div
    class="flex h-[400px] w-full flex-1 flex-col items-center justify-center gap-5 px-5 text-center"
  >
    <div class="flex-c gap-3 text-2xl font-bold text-sf-base">
      你好，我是 <span class="text-sf-theme">{{ $t("router.resumeAI") }}</span>
      <SfIcon icon="lucide:sparkles" class="text-sf-theme" size="6" />
    </div>
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

    <!-- 建议操作按钮 -->
    <div class="grid w-full max-w-sm grid-cols-1 gap-3">
      <button
        v-for="card in suggestCards"
        :key="card.title"
        class="group/card flex cursor-pointer items-start gap-3 rounded-xl border border-sf-b bg-sf-bg p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sf-theme active:scale-[0.98]"
        @click="handleSuggest(card)"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sf-bg-2 text-sf-text-3 transition-colors duration-300 group-hover/card:bg-sf-theme-3 group-hover/card:text-sf-theme"
        >
          <SfIcon :icon="card.icon" size="4.5" />
        </div>
        <div class="flex flex-col gap-0.5 overflow-hidden">
          <h3 class="text-sm font-bold tracking-tight text-sf-text">
            {{ card.title }}
          </h3>
          <p class="truncate text-[12px] text-sf-text-3 opacity-70">
            {{ card.desc }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
