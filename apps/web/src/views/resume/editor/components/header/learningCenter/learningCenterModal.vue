<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import i18n, { $t } from "@/locales";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import {
  LEARNING_ARTICLES,
  LEARNING_CATEGORIES,
  type LearningArticleContent,
  type LearningCategoryKey,
} from "./data";

const visible = defineModel<boolean>({ default: false });
const search = ref("");
const activeCategory = ref<LearningCategoryKey>("start");
const expandedArticles = ref<string[]>(["workspace"]);
const reader = ref<{
  /** 目录切换时回到阅读区顶部。 */
  setScrollTop: (value: number) => void;
} | null>(null);

// 操作指引按当前语言解析，模块写作直接复用现有帮助文案。
const articles = computed<LearningArticleContent[]>(() => {
  i18n.global.locale.value;
  return LEARNING_ARTICLES.map((article) => {
    const moduleKey = article.moduleKey;
    const module = DEFAULT_MODULE_NAMES.find((item) => item.key === moduleKey);
    return {
      ...article,
      title: moduleKey
        ? module ? translateResumeEditorText(module.name) : $t("customModule")
        : $t(`learningCenter_${article.id}_title`),
      summary: $t(moduleKey ? `moduleHelp_${moduleKey}_description` : `learningCenter_${article.id}_summary`),
      steps: moduleKey ? [] : [1, 2, 3].map((index) => $t(`learningCenter_${article.id}_step${index}`)),
      tip: moduleKey ? "" : $t(`learningCenter_${article.id}_tip`),
      questions: moduleKey ? [1, 2].map((index) => ({
        title: $t(`moduleHelp_${moduleKey}_question${index}`),
        answer: $t(`moduleHelp_${moduleKey}_answer${index}`),
      })) : [],
    };
  });
});

// 搜索覆盖标题、正文、步骤和问答，多词搜索要求每个词都命中。
const hasSearch = computed(() => Boolean(search.value.trim()));
const visibleArticles = computed(() => {
  const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return articles.value.filter((article) => {
    if (!terms.length) return article.category === activeCategory.value;
    const text = [article.title, article.summary, ...article.steps, article.tip,
      ...article.questions.flatMap((question) => [question.title, question.answer]),
      $t(`learningCenter_category_${article.category}`)].join(" ").toLocaleLowerCase();
    return terms.every((term) => text.includes(term));
  });
});
const currentCategory = computed(() =>
  LEARNING_CATEGORIES.find((category) => category.key === activeCategory.value)!,
);
const categoryCount = (key: LearningCategoryKey) =>
  LEARNING_ARTICLES.filter((article) => article.category === key).length;

function selectCategory(key: LearningCategoryKey) {
  activeCategory.value = key;
  search.value = "";
}

// 切换目录或搜索后从首篇开始阅读，滚动状态不影响编辑器。
watch([activeCategory, search], async () => {
  expandedArticles.value = visibleArticles.value[0] ? [visibleArticles.value[0].id] : [];
  await nextTick();
  reader.value?.setScrollTop(0);
});
</script>

<template>
  <SfModal
    v-model="visible"
    :title="$t('learningCenterTitle')"
    title-class="justify-start! px-3 pt-3 text-base! font-normal!"
    width="960px"
  >
    <div class="flex flex-col gap-3 px-3 pb-3 text-sf-text">
      <header class="flex flex-col justify-between gap-3 border-b border-sf-b pb-3 sm:flex-row sm:items-center">
        <p class="text-xs leading-6 text-sf-text-3">{{ $t("learningCenterSubtitle") }}</p>
        <SfInput
          v-model="search"
          clearable
          class="w-full! shrink-0 border border-sf-b bg-sf-bg sm:w-72!"
          :placeholder="$t('learningCenterSearch')"
          :aria-label="$t('learningCenterSearch')"
        >
          <template #prefix><SfIcon icon="lucide:search" size="4" /></template>
        </SfInput>
      </header>
      <div class="flex h-[min(58vh,540px)] min-h-0 flex-col gap-3 sm:flex-row">
        <!-- 目录桌面纵向排列，小屏横向滚动，阅读区与目录均使用统一滚动条。 -->
        <aside class="flex shrink-0 flex-col border-b border-sf-b pb-3 sm:w-48 sm:border-r sm:border-b-0 sm:pr-3 sm:pb-0">
          <SfScrollbar class="learning-navigation h-auto! flex-none! sm:h-full! sm:flex-1!" flush>
            <nav class="flex w-max sm:w-full sm:flex-col" :aria-label="$t('learningCenterContents')">
              <button
                v-for="category in LEARNING_CATEGORIES"
                :key="category.key"
                type="button"
                class="flex min-h-12 shrink-0 cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-colors"
                :class="activeCategory === category.key && !hasSearch ? 'bg-sf-theme-2 text-sf-theme' : 'text-sf-text-2 hover:bg-sf-bg'"
                :aria-pressed="activeCategory === category.key && !hasSearch"
                @click="selectCategory(category.key)"
              >
                <SfIcon :icon="category.icon" size="4" class="shrink-0" />
                <span class="min-w-0 flex-1 whitespace-nowrap sm:whitespace-normal">{{ $t(`learningCenter_category_${category.key}`) }}</span>
                <span class="text-xs text-sf-text-3">{{ categoryCount(category.key) }}</span>
              </button>
            </nav>
          </SfScrollbar>
        </aside>
        <SfScrollbar ref="reader" class="learning-reader min-h-0 min-w-0 flex-1" view-class="gap-3 pr-3 pb-3" flush>
          <header class="flex flex-col gap-3 rounded-3xl bg-sf-bg p-6">
            <div class="flex items-center gap-3 text-xs text-sf-text-3">
              <SfIcon :icon="hasSearch ? 'lucide:search' : currentCategory.icon" size="4" />
              <span>{{ hasSearch ? $t('learningCenterSearchResults') : $t('learningCenterContents') }}</span>
              <span class="ml-auto">{{ $t("learningCenterCount", { count: visibleArticles.length }) }}</span>
            </div>
            <h2 class="text-xl leading-6 font-normal">
              {{ hasSearch ? $t('learningCenterSearchResults') : $t(`learningCenter_category_${activeCategory}`) }}
            </h2>
            <p class="text-sm leading-6 text-sf-text-2">
              {{ hasSearch ? $t('learningCenterSearchFor', { query: search.trim() }) : $t(`learningCenter_intro_${activeCategory}`) }}
            </p>
          </header>
          <SfCollapse v-if="visibleArticles.length" v-model="expandedArticles" :border="false" class="flex flex-col gap-3">
            <SfCollapseItem
              v-for="article in visibleArticles"
              :key="article.id"
              :name="article.id"
              class="learning-topic overflow-hidden rounded-2xl border border-sf-b transition-colors hover:border-sf-text-3"
            >
              <template #title>
                <span class="flex min-w-0 flex-1 items-center gap-3 pr-3 text-left">
                  <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-sf-bg text-sf-text-3">
                    <SfIcon icon="mdi:book-open-page-variant" size="3" />
                  </span>
                  <span class="text-sm leading-6 font-normal text-sf-text">{{ article.title }}</span>
                  <span v-if="hasSearch" class="ml-auto hidden shrink-0 text-xs text-sf-text-3 sm:inline">
                    {{ $t(`learningCenter_category_${article.category}`) }}
                  </span>
                </span>
              </template>
              <div class="flex flex-col gap-3 px-3 pb-3">
                <p class="text-sm leading-6 text-sf-text-2">{{ article.summary }}</p>
                <ol v-if="article.steps.length" class="flex flex-col gap-3">
                  <li v-for="(step, index) in article.steps" :key="index" class="flex items-start gap-3">
                    <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-sf-bg text-xs tabular-nums text-sf-text-3">{{ index + 1 }}</span>
                    <p class="text-sm leading-6 text-sf-text-2">{{ step }}</p>
                  </li>
                </ol>
                <dl v-if="article.questions.length" class="flex flex-col gap-3 border-t border-sf-b pt-3">
                  <div v-for="question in article.questions" :key="question.title" class="flex flex-col gap-3">
                    <dt class="text-sm leading-6 text-sf-text">{{ question.title }}</dt>
                    <dd class="text-sm leading-6 text-sf-text-2">{{ question.answer }}</dd>
                  </div>
                </dl>
                <p v-if="article.tip" class="rounded-2xl bg-sf-bg p-3 text-xs leading-6 text-sf-text-3">
                  {{ article.tip }}
                </p>
              </div>
            </SfCollapseItem>
          </SfCollapse>
          <div v-else class="flex flex-col items-center gap-3 py-12 text-center">
            <SfIcon icon="lucide:search" size="9" class="text-sf-text-3" />
            <p class="text-sm text-sf-text-2">{{ $t("learningCenterEmpty") }}</p>
            <SfButton type="bg" @click="search = ''">{{ $t("learningCenterClearSearch") }}</SfButton>
          </div>
        </SfScrollbar>
      </div>
    </div>
  </SfModal>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 内容按文章高度自然撑开，避免统一滚动条的视图高度约束裁切长文。 */
.learning-reader :deep(.el-scrollbar__view),
.learning-navigation :deep(.el-scrollbar__view) {
  height: auto !important;
}

/* 目录与正文共用紧凑规格，长标题允许自然换行。 */
.learning-topic :deep(.el-collapse-item__header) {
  @apply h-auto! min-h-12! px-3 py-3 leading-6!;
}
.learning-topic :deep(.el-collapse-item__content) {
  padding-bottom: 0 !important;
}
</style>
