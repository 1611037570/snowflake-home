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

// 建议操作卡片：简历转面试口头稿
const suggestCards = [
  {
    icon: "ph:microphone-duotone",
    title: "面试自我介绍",
    desc: "将简历转成面试口头稿",
    prompt: `# 任务：生成面试自我介绍口头稿
请根据用户的简历数据，撰写一段自然流畅、口语化的面试自我介绍口头稿。
要求：
1. 以第一人称展开，突出核心优势、关键经历与求职意向。
2. 字数控制在 200 字左右，适合直接朗读。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 字段原样返回。
5. 将自我介绍口头稿写入 analysis 字段，标题使用「问题回复」。`,
    userContent: "请根据我的简历，生成一段面试自我介绍口头稿",
  },
  {
    icon: "ph:translate-duotone",
    title: "中译英",
    desc: "将简历内容翻译成英文",
    prompt: `# 任务：将简历内容翻译成英文
请将用户的简历数据翻译成英文。
要求：
1. 逐项翻译所有字段内容，保持结构对应，不增删、不改写原意。
2. 专业术语、职位、项目名称使用规范英文表达。
3. 严格基于简历真实数据，严禁编造任何信息。
4. 本次不修改简历内容，data 字段原样返回。
5. 将英文翻译结果写入 analysis 字段，标题使用「问题回复」。`,
    userContent: "请将我的简历内容翻译成英文",
  },
];

// 点击建议卡片，触发 AI 生成
const handleSuggest = (card) => {
  emit("suggest", {
    prompt: card.prompt,
    userContent: card.userContent,
  });
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
        class="group flex cursor-pointer items-start gap-3 rounded-xl border border-sf-b bg-sf-bg-2 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sf-theme hover:shadow-md active:scale-[0.98]"
        @click="handleSuggest(card)"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sf-bg text-sf-text-3 transition-colors duration-300 group-hover:bg-sf-theme/10 group-hover:text-sf-theme"
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
