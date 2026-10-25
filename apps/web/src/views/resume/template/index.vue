<script setup>
import { useResumeStore } from "@/stores";
import { trackResumeAction } from "@/hooks";
import { createResumeStyleUi, resumeStyleTemplateList } from "@/views/resume/theme";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";
import ResumePreviewSkeleton from "@/views/resume/components/resumePreviewSkeleton.vue";
import ListScroll from "@/views/resume/components/listScroll.vue";
import AiResumeGenerator from "@/views/resume/components/aiResumeGenerator.vue";
import TemplateCategory from "./components/templateCategory.vue";
import { resumeTemplateList } from "./data/list";
import { loadResumeTemplateData } from "./data/resumeData";
import { expandConfigModules } from "@/stores/modules/resume/hooks/useConfigTemplate";
import { darkThemeColors, lightThemeColors } from "@/configs/modules/theme";
import { useThemeStore } from "@/stores/modules/theme";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";

// 模板页专用全屏预览组件：异步加载，避免首屏打包体积过大
const TemplatePreview = markRaw(defineAsyncComponent(() => import("./templatePreview.vue")));
import { computed, nextTick, ref, watch } from "vue";

// 范本每批卡片数量：触底追加一批，避免整份范本列表一次性进入页面。
const TEMPLATE_BATCH_SIZE = 20;
// 样式缩略图需要各自测量分页，首批及触底批次减少同时挂载的数量。
const STYLE_BATCH_SIZE = 8;
// 样式卡片统一使用的通用范本：进入模板页即加载，保证任一分类都有内容。
const PREVIEW_BASE_FILE = "xiaoZhou.ts";
// 推荐分类前四张卡片的固定顺序，其余推荐模板沿用主题清单顺序。
const recommendedTemplateIds = ["blueAngleHeader", "blueProfileBand", "default", "minimal"];

const resumeStore = useResumeStore();
const aiGenerator = ref(null);
// 已加载的范本正文缓存：文件名到简历项的映射，切回旧分类不再重新加载。
const templateItems = ref({});
const templateLoading = ref(true);
// 加载失败后停止自动触底重试，分类或筛选变化时重新尝试。
const templateLoadFailed = ref(false);
const visibleCount = ref(TEMPLATE_BATCH_SIZE);

// 按文件名补齐正文缓存：已加载的跳过，未加载的并发读取后写入缓存。
// 范本正文只用于展示，标记非响应式以免整份简历被深层代理包装。
let loadVersion = 0;
const ensureTemplateItems = async (fileNames) => {
  const version = ++loadVersion;
  templateLoadFailed.value = false;
  const missing = [...new Set(fileNames)].filter((fileName) => !templateItems.value[fileName]);
  if (!missing.length) {
    templateLoading.value = false;
    return true;
  }
  templateLoading.value = true;
  try {
    const loaded = await Promise.all(missing.map((fileName) => loadResumeTemplateData(fileName)));
    // 分类或筛选变化后丢弃过期结果，避免旧批次追加到新列表。
    if (version !== loadVersion) return false;
    templateItems.value = {
      ...templateItems.value,
      ...Object.fromEntries(missing.map((fileName, index) => [fileName, markRaw(loaded[index])])),
    };
    return true;
  } catch {
    if (version === loadVersion) {
      templateLoadFailed.value = true;
      ElMessage.error($t("resumeTemplateLoadError"));
    }
    return false;
  } finally {
    if (version === loadVersion) templateLoading.value = false;
  }
};

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const previewBase = computed(() => templateItems.value[PREVIEW_BASE_FILE]);
// 样式卡片统一沿用通用范本，标语内容由主题组件提供；界面配置由样式模板清单提供。
const resolveStyleItem = (style) => ({
  data: previewBase.value?.data || {},
  config: previewBase.value?.config || {},
  ui: style.ui,
});
// 全部模板：小舟提供示例内容，每张样式卡片对应一份独立主题预设。
const templates = computed(() =>
  resumeStyleTemplateList.map((style, index) => ({
    fileName: style.id,
    id: style.id,
    name: $t(`resumeTemplateStyle_${style.localeId}_name`),
    description: $t(`resumeTemplateStyle_${style.localeId}_description`),
    // 设计分类标签：与内容模板的 design 同一字段名、同一套取值，供设计分类筛选
    design: style.design,
    tags: [],
    type: "style",
    revealIndex: index,
    item: resolveStyleItem(style),
  })),
);

const templateFilters = ref({});
// 一级分类：example 展示简历范本，template 展示简历模板；默认停在简历模板
const currentTopCategory = ref("template");
const currentBatchSize = computed(() =>
  currentTopCategory.value === "template" ? STYLE_BATCH_SIZE : TEMPLATE_BATCH_SIZE,
);
// 两类模板共用筛选规则；布局和类型分别匹配样式主题的 design 标签。
const matchesTemplateFilters = (template, allowAllDesign = false) =>
  Object.entries(templateFilters.value).every(([key, value]) => {
    if (!value) return true;
    const values = key === "layout" || key === "tier" ? template.design : template[key];
    return (
      !Array.isArray(values) || (allowAllDesign && values.includes("all")) || values.includes(value)
    );
  });
// 范本索引先按筛选条件过滤，正文仅加载当前已展示的批次。
const filteredResumeIndexes = computed(() =>
  resumeTemplateList.filter((template) => matchesTemplateFilters(template)),
);
// 简历模板按 design 字段筛选：与范本的场景、行业、职位筛选互不干扰
const filteredStyleTemplates = computed(() => {
  const filtered = templates.value.filter((template) => matchesTemplateFilters(template, true));
  if (templateFilters.value.tier !== "recommended") return filtered;
  const rank = (id) => {
    const index = recommendedTemplateIds.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return filtered.sort((left, right) => rank(left.id) - rank(right.id));
});
// 当前分类的总条数，用于判断是否仍有可追加的卡片。
const currentTotal = computed(() =>
  currentTopCategory.value === "template"
    ? filteredStyleTemplates.value.length
    : filteredResumeIndexes.value.length,
);
const hasMore = computed(() => visibleCount.value < currentTotal.value);
const visibleResumeIndexes = computed(() =>
  filteredResumeIndexes.value.slice(0, visibleCount.value),
);
// 已加载批次的范本卡片：正文就绪后再追加，避免出现空卡片。
const visibleResumeTemplates = computed(() =>
  visibleResumeIndexes.value
    .filter((template) => templateItems.value[template.fileName])
    .map((template) => ({
      ...template,
      item: templateItems.value[template.fileName],
      name: $t(`resumeTemplateContent_${template.fileName}_name`),
      description: $t(`resumeTemplateContent_${template.fileName}_description`),
      tags: template.tags.map((_, index) =>
        $t(`resumeTemplateContent_${template.fileName}_tag_${index + 1}`),
      ),
      type: "content",
    })),
);
const visibleStyleTemplates = computed(() =>
  filteredStyleTemplates.value.slice(0, visibleCount.value),
);
const displayedTemplates = computed(() =>
  currentTopCategory.value === "template"
    ? visibleStyleTemplates.value
    : visibleResumeTemplates.value,
);
// 当前批次需要的正文：样式模板共用通用范本，无需额外加载其他范本。
const visibleFileNames = computed(() =>
  currentTopCategory.value === "template"
    ? [PREVIEW_BASE_FILE]
    : [...visibleResumeIndexes.value.map((template) => template.fileName), PREVIEW_BASE_FILE],
);
watch(visibleFileNames, (fileNames) => ensureTemplateItems(fileNames), { immediate: true });
// 仅分类或筛选变化时重建列表，追加批次保留已有卡片与滚动位置。
const templateGridKey = computed(
  () => `${currentTopCategory.value}-${JSON.stringify(templateFilters.value)}`,
);
const resetTemplateList = () => {
  visibleCount.value = currentBatchSize.value;
};
const setTemplateFilters = (value) => {
  templateFilters.value = value;
  resetTemplateList();
};
const setCurrentTopCategory = (value) => {
  currentTopCategory.value = value;
  resetTemplateList();
};

// 下一批正文就绪后再追加卡片，触底判断和状态提示由共用列表组件维护。
const loadNextTemplates = async () => {
  if (templateLoading.value || templateLoadFailed.value || !hasMore.value) return false;
  const listKey = templateGridKey.value;
  const nextCount = Math.min(visibleCount.value + currentBatchSize.value, currentTotal.value);
  const files =
    currentTopCategory.value === "template"
      ? [PREVIEW_BASE_FILE]
      : [
          ...filteredResumeIndexes.value.slice(0, nextCount).map((item) => item.fileName),
          PREVIEW_BASE_FILE,
        ];
  const loaded = await ensureTemplateItems(files);
  // 等待期间分类或筛选改变时，不将旧批次数量写入新列表。
  if (!loaded || listKey !== templateGridKey.value) return false;
  visibleCount.value = nextCount;
  await nextTick();
  return true;
};

// 样式卡片使用预览范本的内容，并以主题预设生成独立的简历配置。
const createStyleResumeItem = (card) => {
  // 内容与模块清单以卡片为准，主题组件自行提供标语内容。
  const source = card.item?.config?.modules ? card.item : previewBase.value;
  if (!source) return null;
  const moduleKeys = expandConfigModules(source.config?.modules || [], source.data)
    .map((field) => field.key)
    .filter(Boolean);
  return {
    data: deepClone(source.data), // 与预览隔离的简历内容
    config: deepClone(source.config), // 与预览隔离的模块配置
    ui: createResumeStyleUi(card.item.ui, moduleKeys), // 当前主题的完整界面配置
  };
};
// 使用模板与 AI 生成共用同一份模板数据，避免两个入口套用不同样式。
const resolveTemplateResumeItem = (card) =>
  card.type === "style" ? createStyleResumeItem(card) : deepClone(card.item);
// 列表按钮与全屏预览按钮共用一次新建和埋点流程。
const useTemplateCard = (card) => {
  const item = resolveTemplateResumeItem(card);
  if (item && resumeStore.addResume(item)) {
    trackResumeAction({ eventType: "create", fileType: "none" });
  }
};
// AI 生成器以当前卡片作为样式来源，生成内容后仍走模板页创建流程。
const openAiGenerator = (card) => {
  const item = resolveTemplateResumeItem(card);
  if (item) aiGenerator.value?.open(item);
};
const handleAiGenerated = (item) => {
  if (resumeStore.addResume(item)) {
    trackResumeAction({ eventType: "create", fileType: "none" });
  }
};

// 全屏预览：记录当前展开的模板卡片，visible 由其是否存在派生
const fullscreenCard = ref(null);
const isFullscreen = computed(() => !!fullscreenCard.value);
const openFullscreen = (card) => {
  fullscreenCard.value = card;
};
const closeFullscreen = () => {
  fullscreenCard.value = null;
};
const useFullscreenTemplate = () => {
  if (fullscreenCard.value) useTemplateCard(fullscreenCard.value);
  closeFullscreen();
};
// 全屏预览中的 AI 入口先退出预览，再打开共享生成组件。
const useFullscreenAiGenerate = () => {
  const card = fullscreenCard.value;
  closeFullscreen();
  if (card) nextTick(() => openAiGenerator(card));
};

const setPreviewSize = (size) => {
  gridClass.value = size;
};
const gridClass = ref("default");
// 卡片只定义宽度，高度由 A4 比例（794:1123）自动派生：宽度是唯一旋钮
// 宽度已扣除外框描边，卡片用 content-box：缩略图可用区正好是 A4，页面不会露出空隙
const cardSizeClass = computed(() =>
  gridClass.value === "small" ? "w-[378px] aspect-[794/1123]" : "w-[236px] aspect-[794/1123]",
);
// 缩略图只消费简历内容与配置，不把卡片上的筛选信息传进渲染链路
const getThumbItem = (item) => ({ data: item?.data, config: item?.config, ui: item?.ui });
// 标签彩虹配色：亮色模式取浅色主题色、暗色模式取饱和主题色，标签按顺序循环取用
const { isDark } = storeToRefs(useThemeStore());
const tagColorList = computed(() =>
  (isDark.value ? darkThemeColors : lightThemeColors).map((color) => color.value),
);
const getTagStyle = (index) => ({
  background: tagColorList.value[index % tagColorList.value.length],
});
// 浅色底配深色文字、饱和底配白字，两种模式下都保持可读
const tagTextClass = computed(() => (isDark.value ? "text-sf-theme-text" : "text-sf-text"));
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <ListScroll
      class="flex-1"
      flush
      content-class="px-3 py-2 sm:px-6"
      :loading="templateLoading"
      :has-more="hasMore"
      :count="displayedTemplates.length"
      :load-more="loadNextTemplates"
      :reset-key="templateGridKey"
    >
      <!-- 页面主题与真实条目数在可见内容中说明，和 SEO 文案使用同一份清单。 -->
      <header class="mb-3">
        <h1 class="text-lg font-bold text-sf-text">{{ $t("resumeTemplateTitle") }}</h1>
        <p class="mt-3 text-sm text-sf-text-2">
          {{ $t("resumeTemplateSeoIntro", { examples: resumeTemplateList.length, templates: resumeStyleTemplateList.length }) }}
        </p>
      </header>
      <TemplateCategory
        @change="setTemplateFilters"
        @category-change="setCurrentTopCategory"
        @size-change="setPreviewSize"
      />
      <!-- 首批范本未就绪时按真实卡片尺寸占位，避免筛选栏下方整片空白。 -->
      <div
        v-if="templateLoading && (!displayedTemplates.length || !previewBase)"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        role="status"
        aria-busy="true"
        :aria-label="$t('resumeTemplateLoading')"
      >
        <div v-for="index in 8" :key="index" class="flex justify-center">
          <div
            :class="cardSizeClass"
            class="relative box-content overflow-hidden rounded-[4px] border border-sf-b bg-sf-primary"
          >
            <ResumePreviewSkeleton />
            <div
              class="absolute inset-x-0 bottom-0 flex flex-col gap-3 border-t border-sf-b bg-sf-primary p-3"
            >
              <div class="h-3 w-1/2 animate-pulse rounded bg-sf-bg" />
              <div class="h-3 w-5/6 animate-pulse rounded bg-sf-bg" />
            </div>
          </div>
        </div>
      </div>
      <!-- 模板页关闭逐项揭示：卡片一次性铺满，避免列表高度持续增长带动滚动 -->
      <RevealGrid
        v-else
        :key="templateGridKey"
        :items="displayedTemplates"
        :size="gridClass"
        :reveal="false"
        key-field="fileName"
      >
        <template #default="{ item: card }">
          <!-- 卡片外壳由模板页自己维护，缩略图仍复用懒加载预览组件 -->
          <div
            :class="cardSizeClass"
            class="group relative box-content flex cursor-pointer flex-col overflow-hidden rounded-[4px] border border-sf-b bg-sf-primary transition-all duration-200 hover:scale-102 hover:border-sf-theme"
            @click="openFullscreen(card)"
          >
            <!-- 缩略图铺满整卡，信息层浮在它的下半部分之上 -->
            <div class="absolute inset-0">
              <ThumbPreview :item="getThumbItem(card.item)" />
            </div>
            <!-- 信息层之外的剩余空间：hover 遮罩与按钮在这里垂直居中，不会被信息层压住 -->
            <div class="relative min-h-0 flex-1">
              <!-- 悬浮遮罩：淡白蒙层不加模糊，简历内容仍可见，承载预览与使用按钮 -->
              <div
                class="invisible absolute inset-0 flex items-center justify-center gap-3 bg-sf-transparent-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
              >
                <SfButton @click.stop="openFullscreen(card)">
                  {{ $t("resumeTemplatePreview") }}
                </SfButton>
                <SfButton @click.stop="useTemplateCard(card)">
                  {{ $t("resumeTemplateUse") }}
                </SfButton>
                <SfButton plain icon="lucide:wand-sparkles" @click.stop="openAiGenerator(card)">
                  {{ $t("resumeAiGenerateAction") }}
                </SfButton>
              </div>
            </div>
            <!-- 信息层悬浮在卡片底部：纯色背景、高度随内容，标签默认显示 -->
            <div class="relative flex flex-col gap-1 border-t border-sf-b bg-sf-primary px-3 py-3">
              <div class="truncate text-base font-black text-sf-text">
                {{ card.name }}
              </div>
              <div class="line-clamp-2 text-sm text-sf-text-2">
                {{ card.description }}
              </div>
              <!-- 标签按顺序取用配置里的彩虹色，尺寸收紧到与信息层同一档 -->
              <div v-if="card.tags.length" class="flex flex-wrap gap-x-3 gap-y-1">
                <span
                  v-for="(tag, index) in card.tags"
                  :key="tag"
                  class="rounded-md px-3 py-1 text-xs"
                  :class="tagTextClass"
                  :style="getTagStyle(index)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </template>
        <template #empty>
          <div class="flex h-36 items-center justify-center text-sm text-sf-text-2">
            {{ $t("resumeTemplateEmpty") }}
          </div>
        </template>
      </RevealGrid>
    </ListScroll>
    <!-- 模板页专用全屏预览：左侧展示简历，右侧展示模板文字信息 -->
    <TemplatePreview
      :visible="isFullscreen"
      :item="fullscreenCard?.item || {}"
      single-page
      :eyebrow-text="
        $t(fullscreenCard?.type === 'content' ? 'resumeTemplateContent' : 'resumeTemplateStyle')
      "
      :title="fullscreenCard?.name || $t('resumeTemplateTitle')"
      :description="fullscreenCard?.description || ''"
      :tags="fullscreenCard?.tags || []"
      :primary-action-text="$t('resumeTemplateUseThis')"
      :ai-action-text="$t('resumeAiGenerateAction')"
      :secondary-action-text="$t('resumeTemplateBackToList')"
      @close="closeFullscreen"
      @action="useFullscreenTemplate"
      @ai-action="useFullscreenAiGenerate"
    />
    <AiResumeGenerator ref="aiGenerator" @generated="handleAiGenerated" />
  </div>
</template>
