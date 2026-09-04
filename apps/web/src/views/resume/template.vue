<script setup>
import { useResumeStore } from "@/stores";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";
// 全屏预览组件：异步加载，避免首屏打包体积过大
const FullscreenPreview = markRaw(defineAsyncComponent(() => import("@/views/resumeEditor/preview/fullscreenPreview.vue")));
import { computed, ref } from "vue";

const resumeStore = useResumeStore();

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));

// 全部模板：遍历风格模板，统一使用小羊示例数据预览，仅覆盖风格
const templates = computed(() =>
  themeTemplateList.map((style, index) => ({
    id: style.value,
    name: style.name,
    value: style.value,
    revealIndex: index,
    item: {
      data: xiaoYangResumeItem.data,
      config: xiaoYangResumeItem.config,
      fixedConfig: xiaoYangResumeItem.fixedConfig,
      ui: { ...xiaoYangResumeItem.ui, themeTemplate: style.value },
    },
  })),
);

const total = computed(() => templates.value.length);

// 套用模板：携带风格，深拷贝数据后新增简历并进入编辑
const useTemplate = (card) => {
  resumeStore.addResume({
    data: deepClone(xiaoYangResumeItem.data),
    config: deepClone(xiaoYangResumeItem.config),
    fixedConfig: deepClone(xiaoYangResumeItem.fixedConfig),
    ui: { ...xiaoYangResumeItem.ui, themeTemplate: card.value },
  });
};

// 全屏预览：记录当前展开的模板项，visible 由其是否存在派生
const fullscreenItem = ref(null);
const isFullscreen = computed(() => !!fullscreenItem.value);
const openFullscreen = (card) => {
  fullscreenItem.value = card.item;
};
const closeFullscreen = () => {
  fullscreenItem.value = null;
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="relative z-4 mx-auto flex w-full max-w-[1164px] flex-col gap-4 py-4">
      <!-- 标题 -->
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-[20px] font-black text-sf-theme">简历模板</h2>
          <p class="mt-1 text-sm text-sf-text-2">
            全部模板均使用小羊示例数据预览，选择喜欢的风格即可套用并进入编辑
          </p>
        </div>
        <span class="shrink-0 text-xs text-sf-text-3">共 {{ total }} 款</span>
      </div>

      <!-- 模板列表：布局与逐项入场动画交给 RevealGrid，插槽只决定渲染内容 -->
      <RevealGrid :items="templates" :interval="120" key-field="id">
        <template #default="{ item: card }">
          <div class="w-[282px]">
            <ResumeCardContainer :item="card.item" @click="useTemplate(card)">
              <!-- 全屏预览按钮：仅预览不套用，阻止冒泡避免触发卡片 click -->
              <template #action>
                <SfTooltip content="全屏预览">
                  <SfIcon
                    icon="lucide:maximize"
                    size="4"
                    boxSize="7"
                    class="rounded-full bg-sf-bg-2 text-sf-text-2 hover:bg-sf-theme hover:text-sf-theme-text"
                    @click.stop="openFullscreen(card)"
                  />
                </SfTooltip>
              </template>
              <div class="mt-3 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="truncate text-base font-black text-sf-text">{{ card.name }}</div>
                  <div class="mt-1 truncate text-sm text-sf-text-2">点击套用该风格</div>
                </div>
                <span
                  class="shrink-0 rounded-lg bg-sf-theme-2 px-2.5 py-1 text-xs font-black text-sf-theme"
                  >使用</span
                >
              </div>
            </ResumeCardContainer>
          </div>
        </template>
      </RevealGrid>
    </div>
    <!-- 全屏预览：复用编辑器全屏组件，按当前模板项数据渲染 -->
    <FullscreenPreview :visible="isFullscreen" :item="fullscreenItem || {}" @close="closeFullscreen" />
  </SfScrollbar>
</template>
