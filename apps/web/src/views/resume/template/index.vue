<script setup>
import { useResumeStore } from "@/stores";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";
import TemplateCategory from "./components/templateCategory.vue";
import { resumeTemplateHotList } from "./data";
import { xiaoZhouResumeItem } from "./data/characters/xiaoZhou";

// 模板页专用全屏预览组件：异步加载，避免首屏打包体积过大
const TemplatePreview = markRaw(defineAsyncComponent(() => import("./templatePreview.vue")));
import { computed, ref } from "vue";

const resumeStore = useResumeStore();

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));
// 全部模板：小舟提供示例内容，样式模板提供完整 UI。
const templates = computed(() =>
  themeTemplateList.map((style, index) => ({
    id: style.id,
    name: style.name,
    description: style.description,
    tags: [],
    type: "style",
    revealIndex: index,
    item: {
      data: xiaoZhouResumeItem.data,
      config: xiaoZhouResumeItem.config,
      ui: style.item.ui,
    },
  })),
);

const templateFilters = ref({});
const currentCategory = ref("scene");
const filteredResumeTemplates = computed(() =>
  resumeTemplateHotList
    .filter((template) =>
      Object.entries(templateFilters.value).every(([key, value]) => {
        if (!value) return true;
        const values = template[key];
        return !Array.isArray(values) || values.includes("all") || values.includes(value);
      }),
    )
    .map((template) => ({ ...template, type: "content" })),
);
const displayedTemplates = computed(() =>
  currentCategory.value === "style" ? templates.value : filteredResumeTemplates.value,
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
  resumeStore.addResume({
    data: deepClone(xiaoZhouResumeItem.data),
    config: deepClone(xiaoZhouResumeItem.config),
    ui: deepClone(card.item.ui),
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
      <div class="flex h-full flex-col py-2">
        <TemplateCategory
          @change="setTemplateFilters"
          @category-change="setCurrentCategory"
          @size-change="setPreviewSize"
        />
        <RevealGrid
          :key="templateGridKey"
          :items="displayedTemplates"
          :size="gridClass"
          :interval="120"
          key-field="id"
        >
          <template #default="{ item: card }">
            <ResumeCardContainer
              :item="card.item"
              :size="gridClass"
              @click="useTemplateCard(card)"
            >
              <div class="flex flex-col">
                <div class="truncate text-base font-black text-black">
                  {{ card.name }}
                </div>
                <div class="mt-3 line-clamp-2 text-sm text-sf-text-2">
                  {{ card.description }}
                </div>
                <div v-if="card.tags.length" class="mt-3 flex flex-wrap gap-3 text-sm text-sf-text-2">
                  <span v-for="tag in card.tags" :key="tag">{{ tag }}</span>
                </div>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <SfButton class="flex-1" @click.stop="openFullscreen(card, card.type)">
                    预览
                  </SfButton>
                  <SfButton class="flex-1">使用模板</SfButton>
                </div>
              </div>
            </ResumeCardContainer>
          </template>
          <template #empty>
            <div class="flex h-36 items-center justify-center text-sm text-sf-text-2">
              暂无匹配模板
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
      :eyebrow-text="fullscreenType === 'content' ? '内容模板' : '样式模板'"
      :title="fullscreenCard?.name || '简历模板'"
      :description="fullscreenCard?.description || ''"
      :tags="fullscreenCard?.tags || []"
      @close="closeFullscreen"
      @action="useFullscreenTemplate"
    />
  </div>
</template>
