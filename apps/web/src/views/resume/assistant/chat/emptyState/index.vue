<script setup lang="ts">
import { ALL_MODULE_KEY } from "@/stores/modules/resume/config/defaultConfig";
import { computed, ref } from "vue";
import type { SuggestCard } from "../../types";
import OneVOne from "./oneVOne.vue";
import OneKeyIntro from "../../../editor/components/oneKeyIntro.vue";
import { useOneKeyActions, type OneKeyFlow } from "../../../editor/hooks/useOneKeyActions";

// 当前操作模块列表：选中哪些模块就遍历展示哪些模块
const props = defineProps<{
  suggestions: SuggestCard[];
  selectedModules?: any[];
  removeModule?: (key: string) => void;
}>();
const emit = defineEmits(["switch-mode", "suggest"]);

// 默认突出简历编辑能力，面试训练通过次级分类按需展示
const activeCategory = ref<"resume" | "interview">("resume");
const categories = [
  { value: "resume" as const, name: "简历工具" },
  { value: "interview" as const, name: "面试训练" },
];
const visibleSuggestions = computed(() =>
  props.suggestions.filter((card) => card.category === activeCategory.value),
);
const assistantDescription = computed(() =>
  activeCategory.value === "resume"
    ? "能通过对话帮你打造受HR青睐的专业简历。"
    : "基于你的简历开展岗位准备与模拟训练。",
);

// 一键优化与一键调整并排置顶，其余建议保持原有网格布局
const isOneKeyFlow = (flow: string): flow is OneKeyFlow =>
  flow === "oneKeyOptimize" || flow === "oneKeyAdjust";
const oneKeySuggestions = computed(() =>
  visibleSuggestions.value.filter((card) => isOneKeyFlow(card.flow)),
);
const commonSuggestions = computed(() =>
  visibleSuggestions.value.filter((card) => !isOneKeyFlow(card.flow)),
);

// 一键优化与一键调整先展示共用功能说明，确认后再启动对应通用流程
const { introVisible, introFlow, openOneKeyIntro, confirmOneKeyIntro } = useOneKeyActions(
  (flow) => emit("suggest", { flow }),
);
// 带功能介绍的建议先展示详情，确认后再进入对应引导流程
const featureIntroVisible = ref(false);
const activeFeature = ref<SuggestCard | null>(null);

// 点击建议卡片，启动对应流程
const handleSuggest = (card: SuggestCard) => {
  if (isOneKeyFlow(card.flow)) {
    openOneKeyIntro(card.flow);
    return;
  }
  if (card.intro) {
    activeFeature.value = card;
    featureIntroVisible.value = true;
    return;
  }
  emit("suggest", { flow: card.flow });
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
      你好，我是 <span class="text-sf-theme">{{ $t("core.router.resumeAI") }}</span
      >AI助手
      <SfIcon icon="lucide:sparkles" class="text-sf-theme" size="6" />
    </div>
    <div class="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-sf-base">
      <span>{{ assistantDescription }}</span>
    </div>
    <!-- 两个轻量分类保持当前页面以简历编辑为主，面试功能按需展开 -->
    <SfTab v-model="activeCategory" :list="categories" />
    <div class="flex flex-wrap items-center justify-center gap-x-3 text-sm">✨📄你可以这样问</div>
    <!-- 一键优化与一键调整并排置顶并突出主题色 -->
    <div
      v-if="oneKeySuggestions.length"
      class="flex w-full max-w-md items-center justify-center gap-3"
    >
      <button
        v-for="card in oneKeySuggestions"
        :key="card.flow"
        class="group/card flex w-[140px] cursor-pointer items-center justify-center gap-1 rounded-3xl bg-sf-theme p-2 text-sf-theme-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-sf-theme-2 active:scale-[0.98]"
        @click="handleSuggest(card)"
      >
        <SfIcon :icon="card.icon" size="4.5" />
        <h3 class="text-[14px] font-bold tracking-tight">{{ card.title }}</h3>
      </button>
    </div>
    <!-- 建议操作按钮 -->
    <div class="grid w-full max-w-md grid-cols-2 gap-3">
      <button
        v-for="card in commonSuggestions"
        :key="card.title"
        class="group/card flex cursor-pointer items-center gap-3 rounded-3xl bg-sf-bg p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sf-theme active:scale-[0.98]"
        @click="handleSuggest(card)"
      >
        <SfIcon :icon="card.icon" size="4.5" />
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

    <OneKeyIntro v-model="introVisible" :flow="introFlow" @confirm="confirmOneKeyIntro" />

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
