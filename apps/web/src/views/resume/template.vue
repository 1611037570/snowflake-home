<script setup>
import { useResumeStore } from "@/stores";
import { themeTemplateList, themeColors } from "@/stores/modules/resume/uiConfig";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";
import RevealGrid from "@/views/resume/components/revealGrid.vue";

// 全屏预览组件：异步加载，避免首屏打包体积过大
const FullscreenPreview = markRaw(
  defineAsyncComponent(() => import("@/views/resumeEditor/preview/fullscreenPreview.vue")),
);
import { computed, ref } from "vue";

const resumeStore = useResumeStore();

// 深拷贝：套用模板时隔离示例数据，避免与模板预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));
const switchColor = (index) => {
  color.value = themeColors[index].value;
};
const color = ref(themeColors[0].value);
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
      ui: {
        ...xiaoYangResumeItem.ui,
        themeTemplate: style.value,
        themeColor: color.value,
      },
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
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <div class="mt-2 flex w-full min-w-full items-center justify-between px-6">
      <h2 class="text-[20px] font-black text-sf-theme">简历模板 {{ total }} 款</h2>
      <div class="flex gap-3">
        <div
          v-for="(colorItem, index) in themeColors"
          :key="colorItem.value"
          class="h-9 w-9 cursor-pointer rounded-full transition-all duration-200 hover:scale-110"
          :class="{
            'border-2 border-sf-base': color === colorItem.value,
          }"
          :style="{
            backgroundColor: colorItem.value,
          }"
          @click="switchColor(index)"
        ></div>
      </div>
    </div>
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col py-1">
        <!-- 模板列表：布局与逐项入场动画交给 RevealGrid，插槽只决定渲染内容 -->
        <div @click="switchColor">1111111111</div>
        <RevealGrid :items="templates" :interval="120" key-field="id">
          <template #default="{ item: card }">
            <div class="w-[282px]">
              <ResumeCardContainer :item="card.item" @click="useTemplate(card)">
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
            </div>
          </template>
        </RevealGrid>
        <div class="flex flex-1 flex-col items-center justify-end">
          <SfFooter />
        </div>
      </div>
    </SfScrollbar>
    <!-- 全屏预览：复用编辑器全屏组件，按当前模板项数据渲染 -->
    <FullscreenPreview
      :visible="isFullscreen"
      :item="fullscreenItem || {}"
      @close="closeFullscreen"
    />
  </div>
</template>
