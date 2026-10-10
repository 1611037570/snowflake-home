<script setup>
import { useResumeStore } from "@/stores";
import {
  getResumeThemeTemplate,
  themeTemplateList,
  resolveThemeDecisions,
} from "@/views/resume/theme";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";
import TemplateCategory from "./components/templateCategory.vue";
import TemplatePagination from "./components/templatePagination.vue";
import { resumeTemplateList } from "./data/list";
import { loadResumeTemplateData } from "./data/resumeData";
import { expandConfigModules } from "@/stores/modules/resume/hooks/useConfigTemplate";
import { resolveLayoutColumns, layoutUsesColumns } from "@/domain/resume/theme/layouts";
import { darkThemeColors, lightThemeColors } from "@/configs/modules/theme";
import { useThemeStore } from "@/stores/modules/theme";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";

// 模板页专用全屏预览组件：异步加载，避免首屏打包体积过大
const TemplatePreview = markRaw(defineAsyncComponent(() => import("./templatePreview.vue")));
import { computed, ref, watch } from "vue";

// 每页卡片数量：只加载并渲染当前页，避免整份范本列表一次性进入页面
const TEMPLATE_PAGE_SIZE = 20;
// 样式卡片统一使用的通用范本：不参与分页，进入模板页即加载，保证切到任一分类都有内容
const PREVIEW_BASE_FILE = "xiaoZhou.ts";

const resumeStore = useResumeStore();
// 已加载的范本正文缓存：文件名到简历项的映射，切回旧页不再重新加载
const templateItems = ref({});
const templateLoading = ref(true);
const templatePage = ref(1);

// 按文件名补齐正文缓存：已加载的跳过，未加载的并发读取后写入缓存。
// 范本正文只用于展示，标记非响应式以免整份简历被深层代理包装。
let loadVersion = 0;
const ensureTemplateItems = async (fileNames) => {
  const missing = [...new Set(fileNames)].filter((fileName) => !templateItems.value[fileName]);
  if (!missing.length) return;
  const version = ++loadVersion;
  templateLoading.value = true;
  try {
    const loaded = await Promise.all(missing.map((fileName) => loadResumeTemplateData(fileName)));
    // 期间又切换了分类或页码时丢弃本次结果，由最新一次加载收口加载态
    if (version !== loadVersion) return;
    templateItems.value = {
      ...templateItems.value,
      ...Object.fromEntries(missing.map((fileName, index) => [fileName, markRaw(loaded[index])])),
    };
  } catch {
    ElMessage.error($t("resumeTemplateLoadError"));
  } finally {
    if (version === loadVersion) templateLoading.value = false;
  }
};

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const previewBase = computed(() => templateItems.value[PREVIEW_BASE_FILE]);
// 样式卡片统一沿用通用范本，标语内容由主题组件提供。
const resolveStyleItem = (style) => {
  return {
    data: previewBase.value?.data || {},
    config: previewBase.value?.config || {},
    ui: getResumeThemeTemplate(style.id).item.ui,
  };
};
// 全部模板：小舟提供示例内容，样式模板提供完整 UI。
const templates = computed(() =>
  themeTemplateList.map((style, index) => ({
    fileName: style.id,
    id: style.id,
    name: $t(`resumeTemplateStyle_${style.id}_name`),
    description: $t(`resumeTemplateStyle_${style.id}_description`),
    // 主题分类标签：与内容模板的 design 同一字段名、同一套取值，供设计分类筛选
    design: style.design,
    tags: [],
    type: "style",
    revealIndex: index,
    item: resolveStyleItem(style),
  })),
);

const templateFilters = ref({});
// 一级分类：example 展示简历范本，template 展示简历模板
const currentTopCategory = ref("example");
// 范本索引先按筛选条件过滤，正文留到确定当前页之后再加载
const filteredResumeIndexes = computed(() =>
  resumeTemplateList.filter((template) =>
    Object.entries(templateFilters.value).every(([key, value]) => {
      if (!value) return true;
      const values = template[key];
      // 按选项取值精确匹配：不限行业/不限职位的范本只在选中「不限行业」「不限职位」时出现
      return !Array.isArray(values) || values.includes(value);
    }),
  ),
);
// 简历模板按 design 字段筛选：与范本的场景、行业、职位筛选互不干扰
const filteredStyleTemplates = computed(() =>
  templates.value.filter((template) =>
    Object.entries(templateFilters.value).every(([key, value]) => {
      if (!value) return true;
      const values = template[key];
      return !Array.isArray(values) || values.includes("all") || values.includes(value);
    }),
  ),
);
// 当前一级分类的总条数与总页数，不足一页时按一页处理
const currentTotal = computed(() =>
  currentTopCategory.value === "template"
    ? filteredStyleTemplates.value.length
    : filteredResumeIndexes.value.length,
);
const pageCount = computed(() => Math.max(1, Math.ceil(currentTotal.value / TEMPLATE_PAGE_SIZE)));
const pageStart = computed(() => (templatePage.value - 1) * TEMPLATE_PAGE_SIZE);
// 筛选后条数变少时回退到最后一页，避免停在空白页
watch(pageCount, (count) => {
  if (templatePage.value > count) templatePage.value = count;
});
const pagedResumeIndexes = computed(() =>
  filteredResumeIndexes.value.slice(pageStart.value, pageStart.value + TEMPLATE_PAGE_SIZE),
);
// 当前页的范本卡片：正文尚未加载完成的条目先不进列表，避免出现空卡片
const pagedResumeTemplates = computed(() =>
  pagedResumeIndexes.value
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
const pagedStyleTemplates = computed(() =>
  filteredStyleTemplates.value.slice(pageStart.value, pageStart.value + TEMPLATE_PAGE_SIZE),
);
const displayedTemplates = computed(() =>
  currentTopCategory.value === "template" ? pagedStyleTemplates.value : pagedResumeTemplates.value,
);
// 当前页需要的正文：简历模板共用通用范本，只保证它已加载即可，不必加载当页范本
const pageFileNames = computed(() =>
  currentTopCategory.value === "template"
    ? [PREVIEW_BASE_FILE]
    : [...pagedResumeIndexes.value.map((template) => template.fileName), PREVIEW_BASE_FILE],
);
watch(pageFileNames, (fileNames) => ensureTemplateItems(fileNames), { immediate: true });
// 分类、筛选或翻页变化时重建揭示列表，避免新旧卡片在 TransitionGroup 中同时出现。
const templateGridKey = computed(
  () =>
    `${currentTopCategory.value}-${templatePage.value}-${JSON.stringify(templateFilters.value)}`,
);
const scrollbarRef = ref(null);
const setTemplatePage = (page) => {
  templatePage.value = page;
  // 翻页后回到列表顶部，避免停留在上一页的滚动位置
  scrollbarRef.value?.setScrollTop(0);
};
const setTemplateFilters = (value) => {
  templateFilters.value = value;
  templatePage.value = 1;
};
const setCurrentTopCategory = (value) => {
  currentTopCategory.value = value;
  templatePage.value = 1;
};

// 套用模板：携带风格，深拷贝数据后新增简历并进入编辑
const useTemplate = (card) => {
  // 内容与模块清单以卡片为准，主题组件自行提供标语内容。
  const source = card.item?.config?.modules ? card.item : previewBase.value;
  if (!source) return;
  const ui = deepClone(card.item.ui);
  const moduleKeys = expandConfigModules(source.config?.modules || [], source.data)
    .map((field) => field.key)
    .filter(Boolean);
  // 版式由主题定义决定，不写入简历 ui；仅双栏布局生成栏内模块顺序。
  const { layoutType } = resolveThemeDecisions(ui.theme?.template);
  ui.layout.columns = layoutUsesColumns(layoutType)
    ? resolveLayoutColumns(layoutType, moduleKeys, ui.layout.columns)
    : null;
  resumeStore.addResume({
    data: deepClone(source.data),
    config: deepClone(source.config),
    ui,
  });
};
const useContentTemplate = (card) => {
  resumeStore.addResume(deepClone(card.item));
};
const useTemplateCard = (card) => {
  if (card.type === "style") useTemplate(card);
  else useContentTemplate(card);
};

// 全屏预览：记录当前展开的模板卡片，visible 由其是否存在派生
const fullscreenCard = ref(null);
const fullscreenType = ref("style");
const isFullscreen = computed(() => !!fullscreenCard.value);
const openFullscreen = (card, type = "style") => {
  fullscreenCard.value = card;
  fullscreenType.value = type;
};
const closeFullscreen = () => {
  fullscreenCard.value = null;
};
const useFullscreenTemplate = () => {
  if (fullscreenCard.value) {
    if (fullscreenType.value === "content") useContentTemplate(fullscreenCard.value);
    else useTemplate(fullscreenCard.value);
  }
  closeFullscreen();
};

const setPreviewSize = (size) => {
  gridClass.value = size;
};
const gridClass = ref("default");
// 卡片只定义宽度，高度由 A4 比例（794:1123）自动派生：宽度是唯一旋钮
const cardSizeClass = computed(() =>
  gridClass.value === "small" ? "w-[380px] aspect-[794/1123]" : "w-[240px] aspect-[794/1123]",
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
    <SfScrollbar ref="scrollbarRef" class="flex-1">
      <div class="flex h-full flex-col px-3 py-2 sm:px-6">
        <TemplateCategory
          @change="setTemplateFilters"
          @category-change="setCurrentTopCategory"
          @size-change="setPreviewSize"
        />
        <div
          v-if="templateLoading"
          class="flex h-36 items-center justify-center text-sm text-sf-text-2"
        >
          {{ $t("resumeTemplateLoading") }}
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
              class="group relative flex cursor-pointer flex-col overflow-hidden rounded-[4px] border border-sf-b bg-sf-primary transition-all duration-200 hover:scale-102 hover:border-sf-theme"
              @click="openFullscreen(card, card.type)"
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
                  <SfButton @click.stop="openFullscreen(card, card.type)">
                    {{ $t("resumeTemplatePreview") }}
                  </SfButton>
                  <SfButton @click.stop="useTemplateCard(card)">
                    {{ $t("resumeTemplateUse") }}
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
        <TemplatePagination
          :page="templatePage"
          :page-count="pageCount"
          :total="currentTotal"
          @change="setTemplatePage"
        />
        <div class="flex flex-1 flex-col items-center justify-end">
          <SfFooter />
        </div>
      </div>
    </SfScrollbar>
    <!-- 模板页专用全屏预览：左侧展示简历，右侧展示模板文字信息 -->
    <TemplatePreview
      :visible="isFullscreen"
      :item="fullscreenCard?.item || {}"
      single-page
      :eyebrow-text="
        $t(fullscreenType === 'content' ? 'resumeTemplateContent' : 'resumeTemplateStyle')
      "
      :title="fullscreenCard?.name || $t('resumeTemplateTitle')"
      :description="fullscreenCard?.description || ''"
      :tags="fullscreenCard?.tags || []"
      :primary-action-text="$t('resumeTemplateUseThis')"
      :secondary-action-text="$t('resumeTemplateBackToList')"
      @close="closeFullscreen"
      @action="useFullscreenTemplate"
    />
  </div>
</template>
