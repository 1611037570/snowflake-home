<script setup lang="ts">
import { ALL_MODULE_KEY } from "@/stores/modules/resume/defaultConfig";
import type { SelectedModule } from "@/stores/modules/resume/types";
import { computed, ref } from "vue";
import type { SuggestCard } from "../../types";
import OneVOne from "./oneVOne.vue";

// 当前操作模块列表：选中哪些模块就遍历展示哪些模块
const props = defineProps<{
  suggestions: SuggestCard[];
  selectedModules?: SelectedModule[];
  removeModule?: (key: string) => void;
}>();
const emit = defineEmits(["switch-mode", "suggest"]);

// 默认突出简历编辑能力，面试训练通过次级分类按需展示
const activeCategory = ref<"resume" | "interview">("resume");
const categories = [
  { key: "resume" as const, label: "简历工具" },
  { key: "interview" as const, label: "面试训练" },
];
const visibleSuggestions = computed(() =>
  props.suggestions.filter((card) => card.category === activeCategory.value),
);
const assistantDescription = computed(() =>
  activeCategory.value === "resume"
    ? "能通过对话帮你打造受HR青睐的专业简历。"
    : "基于你的简历开展岗位准备与模拟训练。",
);

// 简历分类中的一键优化独立置顶，其余建议保持原有网格布局
const oneKeyOptimize = computed(() =>
  visibleSuggestions.value.find((card) => card.flow === "oneKeyOptimize"),
);
const commonSuggestions = computed(() =>
  visibleSuggestions.value.filter((card) => card.flow !== "oneKeyOptimize"),
);

// 一键优化先展示能力与数据范围说明，用户确认后再进入原有引导流程
const oneKeyIntroVisible = ref(false);
// 带功能介绍的建议先展示详情，确认后再进入对应引导流程
const featureIntroVisible = ref(false);
const activeFeature = ref<SuggestCard | null>(null);
const oneKeyFeatures = [
  {
    icon: "ph:stethoscope-duotone",
    title: "全方位诊断",
    description: "从完整度、阅读效率、职业契合、职业成就、发展潜力和稳定性六个维度检查简历。",
  },
  {
    icon: "ph:magic-wand-duotone",
    title: "智能优化",
    description: "结合求职方向优化结构、表达和岗位关键词，让重点更清晰。",
  },
  {
    icon: "fa6-solid:edit",
    title: "必要增删",
    description: "基于已有事实补充必要内容、精简重复套话；缺失事实会标记为待补充。",
  },
  {
    icon: "fa-solid:chart-line",
    title: "优化报告",
    description: "展示六维评分、本次改动、优化亮点和下一步建议，方便继续完善。",
  },
];

// 点击建议卡片，启动对应流程
const handleSuggest = (card: SuggestCard) => {
  if (card.flow === "oneKeyOptimize") {
    oneKeyIntroVisible.value = true;
    return;
  }
  if (card.intro) {
    activeFeature.value = card;
    featureIntroVisible.value = true;
    return;
  }
  emit("suggest", { flow: card.flow });
};

// 用户确认了解功能后，关闭弹窗并启动一键优化流程
const startOneKeyOptimize = () => {
  if (!oneKeyOptimize.value) return;
  oneKeyIntroVisible.value = false;
  emit("suggest", { flow: oneKeyOptimize.value.flow });
};

// 关闭功能介绍并启动当前建议对应的引导流程
const startFeature = () => {
  if (!activeFeature.value) return;
  featureIntroVisible.value = false;
  emit("suggest", { flow: activeFeature.value.flow });
};
</script>

<template>
  <div
    class="relative flex h-full w-full flex-col items-center justify-center gap-3 text-center select-none"
  >
    <!-- 1V1 人工优化入口 -->
    <OneVOne />

    <div class="flex-c gap-3 text-2xl font-bold text-sf-base select-none">
      你好，我是 <span class="text-sf-theme">{{ $t("router.resumeAI") }}</span
      >AI助手
      <SfIcon icon="lucide:sparkles" class="text-sf-theme" size="6" />
    </div>
    <div class="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-sf-base">
      <span>{{ assistantDescription }}</span>
    </div>
    <!-- 两个轻量分类保持当前页面以简历编辑为主，面试功能按需展开 -->
    <div class="flex items-center gap-3 rounded-xl bg-sf-bg p-3">
      <button
        v-for="category in categories"
        :key="category.key"
        class="flex h-9 items-center rounded-xl px-3 text-sm font-medium transition-colors duration-300"
        :class="
          activeCategory === category.key
            ? 'bg-sf-theme text-sf-theme-text'
            : 'text-sf-text-2 hover:bg-sf-bg-2'
        "
        type="button"
        @click="activeCategory = category.key"
      >
        {{ category.label }}
      </button>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-x-3 text-sm">✨📄你可以这样问</div>
    <!-- 一键优化入口独立置顶并突出主题色 -->
    <div v-if="oneKeyOptimize" class="flex w-full max-w-md justify-center">
      <button
        class="group/card flex w-1/2 cursor-pointer items-center justify-center gap-3 rounded-xl bg-sf-theme p-3 text-sf-theme-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-sf-theme-2 active:scale-[0.98]"
        @click="handleSuggest(oneKeyOptimize)"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sf-theme-2 text-sf-theme-text transition-colors duration-300"
        >
          <SfIcon :icon="oneKeyOptimize.icon" size="4.5" />
        </div>
        <h3 class="text-[14px] font-bold tracking-tight">
          {{ oneKeyOptimize.title }}
        </h3>
      </button>
    </div>
    <!-- 建议操作按钮 -->
    <div class="grid w-full max-w-md grid-cols-2 gap-3">
      <button
        v-for="card in commonSuggestions"
        :key="card.title"
        class="group/card flex cursor-pointer items-center gap-3 rounded-xl bg-sf-bg p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sf-theme active:scale-[0.98]"
        @click="handleSuggest(card)"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sf-bg-2 text-sf-text-3 transition-colors duration-300 group-hover/card:bg-sf-theme-3 group-hover/card:text-sf-theme"
        >
          <SfIcon :icon="card.icon" size="4.5" />
        </div>
        <div class="flex flex-col gap-0.5 overflow-hidden">
          <h3 class="text-[14px] font-bold tracking-tight text-sf-text">
            {{ card.title }}
          </h3>
        </div>
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-x-3 text-sm">
      我将根据你的
      <div
        v-for="item in props.selectedModules"
        :key="item.key"
        class="flex-c relative h-6 rounded-xl bg-sf-theme px-1.5 py-0.5 text-sf-theme-text"
      >
        {{ item.name }}
        <!-- 右上角关闭按钮：点击移除该模块选中 -->
        <SfIcon
          v-if="item.key !== ALL_MODULE_KEY"
          icon="mingcute:close-line"
          size="3"
          class="absolute top-0 right-0 cursor-pointer text-sf-theme-text/70 hover:text-sf-theme-text"
          @click="props.removeModule?.(item.key)"
        />
      </div>
      {{ activeCategory === "resume" ? "一键操作" : "开展训练" }}
    </div>

    <SfModal v-model="oneKeyIntroVisible" title="一键优化能为你做什么" width="560px">
      <div class="flex w-full flex-col gap-3 pb-3 text-left">
        <p class="text-[14px] leading-relaxed text-sf-text-2">
          一次完成简历诊断、内容优化和结果评估，所有改动都可以撤回。
        </p>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="feature in oneKeyFeatures"
            :key="feature.title"
            class="flex gap-3 rounded-xl bg-sf-bg p-3"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sf-bg-2 text-sf-theme"
            >
              <SfIcon :icon="feature.icon" size="5" />
            </div>
            <div class="flex flex-col gap-3">
              <h3 class="text-[14px] font-bold text-sf-text">{{ feature.title }}</h3>
              <p class="text-[13px] leading-relaxed text-sf-text-2">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 rounded-xl bg-sf-bg-2 p-3">
          <SfIcon icon="mdi:database-outline" size="5" class="shrink-0 text-sf-theme" />
          <p class="text-[13px] leading-relaxed text-sf-text-2">
            为保证判断完整，一键优化需要读取整份简历。当前只选择部分模块时，下一步会单独询问读取授权；拒绝后不会发起请求。
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-3">
          <SfButton type="bg" size="large" @click="oneKeyIntroVisible = false">
            暂不优化
          </SfButton>
          <SfButton size="large" @click="startOneKeyOptimize">开始一键优化</SfButton>
        </div>
      </div>
    </SfModal>

    <SfModal
      v-model="featureIntroVisible"
      :title="activeFeature?.title || '功能介绍'"
      width="560px"
    >
      <div v-if="activeFeature?.intro" class="flex w-full flex-col gap-3 pb-3 text-left">
        <div class="flex flex-wrap items-center gap-3">
          <span
            v-if="activeFeature.intro.badge"
            class="flex h-6 items-center rounded-xl bg-sf-theme-3 px-3 text-[12px] font-medium text-sf-theme"
          >
            {{ activeFeature.intro.badge }}
          </span>
          <span class="text-[13px] font-medium text-sf-theme">
            {{ activeFeature.intro.duration }}
          </span>
        </div>

        <p class="text-[14px] leading-relaxed text-sf-text-2">
          {{ activeFeature.intro.description }}
        </p>

        <div class="flex flex-col gap-3 rounded-xl bg-sf-bg p-3">
          <div
            v-for="feature in activeFeature.intro.features"
            :key="feature"
            class="flex items-start gap-3"
          >
            <SfIcon icon="ph:check-circle-duotone" size="5" class="shrink-0 text-sf-theme" />
            <span class="text-[13px] leading-relaxed text-sf-text">{{ feature }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-xl bg-sf-bg-2 p-3">
          <span class="text-[13px] text-sf-text-2">适合场景</span>
          <span class="text-[13px] font-bold text-sf-text">{{ activeFeature.intro.scene }}</span>
        </div>

        <div class="flex justify-end gap-3 pt-3">
          <SfButton type="bg" size="large" @click="featureIntroVisible = false">暂不开始</SfButton>
          <SfButton size="large" @click="startFeature">{{ activeFeature.intro.action }}</SfButton>
        </div>
      </div>
    </SfModal>
  </div>
</template>
