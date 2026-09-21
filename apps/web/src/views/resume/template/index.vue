<script setup>
import { useResumeStore } from "@/stores";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";
import TemplateCategory from "./components/templateCategory.vue";
import { resumeTemplateHotList } from "./data";
import { xiaoZhouResumeItem } from "./data/items/xiaoZhou";

// 模板页专用全屏预览组件：异步加载，避免首屏打包体积过大
const TemplatePreview = markRaw(defineAsyncComponent(() => import("./templatePreview.vue")));
import { computed, ref } from "vue";

const resumeStore = useResumeStore();

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));
// 全部模板：遍历风格模板，统一使用小舟示例数据预览，仅覆盖风格
const templates = computed(() =>
  themeTemplateList.map((style, index) => ({
    id: style.value,
    name: style.name,
    value: style.value,
    revealIndex: index,
    item: {
      data: xiaoZhouResumeItem.data,
      config: xiaoZhouResumeItem.config,
      ui: {
        ...xiaoZhouResumeItem.ui,
        themeTemplate: style.value,
      },
    },
  })),
);

const total = computed(() => templates.value.length);
const templateFilters = ref({});
const filteredResumeTemplates = computed(() =>
  resumeTemplateHotList.filter((template) =>
    Object.entries(templateFilters.value).every(([key, value]) => {
      if (!value) return true;
      const values = template[key];
      return !Array.isArray(values) || values.includes("all") || values.includes(value);
    }),
  ),
);
const setTemplateFilters = (value) => {
  templateFilters.value = value;
};

// 套用模板：携带风格，深拷贝数据后新增简历并进入编辑
const useTemplate = (card) => {
  resumeStore.addResume({
    data: deepClone(xiaoZhouResumeItem.data),
    config: deepClone(xiaoZhouResumeItem.config),
    ui: { ...xiaoZhouResumeItem.ui, themeTemplate: card.value },
  });
};
const useContentTemplate = (card) => {
  resumeStore.addResume(deepClone(card.item));
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

// 切换大小：切换模板预览大小
const switchSize = (size) => {
  gridClass.value = size;
};
const gridClass = ref("default");
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col py-2">
        <TemplateCategory @change="setTemplateFilters" />
        <RevealGrid :items="filteredResumeTemplates" :size="gridClass" :interval="120" key-field="id">
          <template #default="{ item: card }">
            <ResumeCardContainer
              :item="card.item"
              :size="gridClass"
              @click="useContentTemplate(card)"
            >
              <div class="flex flex-col">
                <div class="truncate text-base font-black text-black">
                  {{ card.name }}
                </div>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <SfButton class="flex-1" @click.stop="openFullscreen(card, 'content')">
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
        <div class="mt-6 mb-6 flex w-full min-w-full items-center justify-between">
          <h2 class="text-[20px] font-black text-sf-theme">简历模板 {{ total }} 款</h2>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-sf-text-2">预览尺寸</span>
            <div class="flex items-center gap-3">
              <SfButton
                :plain="gridClass !== 'small'"
                :round="false"
                @click="switchSize('small')"
              >
                大图
              </SfButton>
              <SfButton
                :plain="gridClass !== 'default'"
                :round="false"
                @click="switchSize('default')"
              >
                小图
              </SfButton>
            </div>
          </div>
        </div>
        <RevealGrid :items="templates" :size="gridClass" :interval="120" key-field="id">
          <template #default="{ item: card }">
            <ResumeCardContainer :item="card.item" :size="gridClass" @click="useTemplate(card)">
              <div class="flex flex-col">
                <div class="truncate text-base font-black text-black">
                  {{ card.name }}
                </div>
                <div class="mt-3 flex items-center justify-between gap-2">
                  <SfButton class="flex-1" @click.stop="openFullscreen(card)">预览</SfButton>
                  <SfButton class="flex-1">使用模板</SfButton>
                </div>
              </div>
            </ResumeCardContainer>
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
      :title="fullscreenCard?.name || '简历模板'"
      @close="closeFullscreen"
      @action="useFullscreenTemplate"
    />
  </div>
</template>
