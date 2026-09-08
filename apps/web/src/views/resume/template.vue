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
// 切换主题色并同步模板预览。
const switchColor = (value) => {
  color.value = value;
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

// 切换大小：切换模板预览大小
const switchSize = (size) => {
  gridClass.value = size;
};
const gridClass = ref("default");
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <div class="mt-2 flex w-full min-w-full items-center justify-between px-6">
      <h2 class="text-[20px] font-black text-sf-theme">简历模板 {{ total }} 款</h2>
      <div class="flex items-center gap-6">
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
        <div class="h-6 w-px bg-sf-b"></div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-bold text-sf-text-2">主题色</span>
          <button
            v-for="colorItem in themeColors"
            :key="colorItem.value"
            class="h-9 w-9 cursor-pointer rounded-full transition-all duration-200 hover:scale-110"
            :class="{
              'ring-2 ring-sf-theme ring-offset-3': color === colorItem.value,
            }"
            :style="{
              backgroundColor: colorItem.value,
            }"
            type="button"
            :aria-label="`切换为${colorItem.name}主题色`"
            @click="switchColor(colorItem.value)"
          ></button>
        </div>
      </div>
    </div>
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col py-2">
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
    <!-- 全屏预览：复用编辑器全屏组件，按当前模板项数据渲染 -->
    <FullscreenPreview
      :visible="isFullscreen"
      :item="fullscreenItem || {}"
      @close="closeFullscreen"
    />
  </div>
</template>
