<script setup>
import { useResumeStore } from "@/stores";
import { getResumeThemeTemplate, themeTemplateList } from "@/views/resume/theme";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";
import TemplateCategory from "./components/templateCategory.vue";
import { resumeTemplateList } from "./data/list";
import { loadResumeTemplates } from "./data/resumeData";
import { expandConfigModules } from "@/stores/modules/resume/hooks/useConfigTemplate";
import { resolveLayoutColumns } from "../editor/preview/resumePages/engine/layout/layoutTemplates";
import { $t } from "@/locales";

// 模板页专用全屏预览组件：异步加载，避免首屏打包体积过大
const TemplatePreview = markRaw(defineAsyncComponent(() => import("./templatePreview.vue")));
import { computed, onMounted, ref } from "vue";

const resumeStore = useResumeStore();
const resumeTemplates = ref([]);
const templateLoading = ref(true);

// 模板页进入时按索引懒加载范本正文，供卡片缩略图和预览共用。
onMounted(async () => {
  try {
    resumeTemplates.value = await loadResumeTemplates(resumeTemplateList);
  } catch {
    ElMessage.error($t("resumeTemplateLoadError"));
  } finally {
    templateLoading.value = false;
  }
});

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const previewBase = computed(
  () => resumeTemplates.value.find((template) => template.fileName === "xiaoZhou.ts")?.item,
);
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
const currentCategory = ref("scene");
const filteredResumeTemplates = computed(() =>
  resumeTemplates.value
    .filter((template) =>
      Object.entries(templateFilters.value).every(([key, value]) => {
        if (!value) return true;
        const values = template[key];
        return !Array.isArray(values) || values.includes("all") || values.includes(value);
      }),
    )
    .map((template) => ({
      ...template,
      name: $t(`resumeTemplateContent_${template.fileName}_name`),
      description: $t(`resumeTemplateContent_${template.fileName}_description`),
      tags: template.tags.map((_, index) =>
        $t(`resumeTemplateContent_${template.fileName}_tag_${index + 1}`),
      ),
      type: "content",
    })),
);
// 分类筛选对两种模板同时生效：样式模板同样按 design 字段参与设计分类筛选
const filteredStyleTemplates = computed(() =>
  templates.value.filter((template) =>
    Object.entries(templateFilters.value).every(([key, value]) => {
      if (!value) return true;
      const values = template[key];
      return !Array.isArray(values) || values.includes("all") || values.includes(value);
    }),
  ),
);
const displayedTemplates = computed(() =>
  currentCategory.value === "style" ? filteredStyleTemplates.value : filteredResumeTemplates.value,
);
// 分类或筛选变化时重建揭示列表，避免新旧卡片在 TransitionGroup 中同时出现。
const templateGridKey = computed(
  () => `${currentCategory.value}-${JSON.stringify(templateFilters.value)}`,
);
const setTemplateFilters = (value) => {
  templateFilters.value = value;
};
const setCurrentCategory = (value) => {
  currentCategory.value = value;
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
  // 主题栏位声明的派生求职信息也参与栏位解析。
  if ([...(ui.layout.columns?.left || []), ...(ui.layout.columns?.right || [])].includes("userFacts")) {
    moduleKeys.push("userFacts");
  }
  // 仅双栏布局生成栏内模块顺序，顶部通栏单栏沿用简历模块顺序。
  ui.layout.columns =
    ui.layout.type === "twoColumn" || ui.layout.type === "topUserTwoColumn"
      ? resolveLayoutColumns(ui.layout.type, moduleKeys, ui.layout.columns)
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
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col px-3 py-2 sm:px-6">
        <TemplateCategory
          @change="setTemplateFilters"
          @category-change="setCurrentCategory"
          @size-change="setPreviewSize"
        />
        <div
          v-if="templateLoading"
          class="flex h-36 items-center justify-center text-sm text-sf-text-2"
        >
          {{ $t("resumeTemplateLoading") }}
        </div>
        <RevealGrid
          v-else
          :key="templateGridKey"
          :items="displayedTemplates"
          :size="gridClass"
          :interval="120"
          key-field="fileName"
        >
          <template #default="{ item: card }">
            <ResumeCardContainer :item="card.item" :size="gridClass" @click="useTemplateCard(card)">
              <div class="flex flex-col">
                <div class="truncate text-base font-black text-black">
                  {{ card.name }}
                </div>
                <div class="mt-3 line-clamp-2 text-sm text-sf-text-2">
                  {{ card.description }}
                </div>
                <div
                  v-if="card.tags.length"
                  class="mt-3 flex flex-wrap gap-3 text-sm text-sf-text-2"
                >
                  <span v-for="tag in card.tags" :key="tag">{{ tag }}</span>
                </div>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <SfButton class="flex-1" @click.stop="openFullscreen(card, card.type)">
                    {{ $t("resumeTemplatePreview") }}
                  </SfButton>
                  <SfButton class="flex-1">{{ $t("resumeTemplateUse") }}</SfButton>
                </div>
              </div>
            </ResumeCardContainer>
          </template>
          <template #empty>
            <div class="flex h-36 items-center justify-center text-sm text-sf-text-2">
              {{ $t("resumeTemplateEmpty") }}
            </div>
          </template>
        </RevealGrid>
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
