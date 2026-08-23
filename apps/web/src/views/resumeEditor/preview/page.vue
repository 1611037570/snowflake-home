<script setup>
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import GeneratingMask from "../components/generatingMask.vue";
import MeasureContent from "./components/measureContent.vue";
import ModuleActions from "./components/moduleActions.vue";
import ResumeModule from "./modules/index.vue";
import { usePdfExport } from "./usePdfExport";
import { useRowInfo } from "./useRowInfo";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig, selectedModuleKeys } =
  storeToRefs(resumeStore);

const paddingValue = inject("paddingValue");
const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
// 测量容器引用
const measureRef = ref(null);

// 合并所有模块字段
const allModules = computed(() => {
  const fixedModules = currentFixedConfig.value.fields;
  const configModules = currentConfig.value.fields;
  return [...fixedModules, ...configModules];
});
const WIDTH = 794;
const HEIGHT = 1123;
const MODULE_GAP = 12;
const o = computed(() => {
  return {
    paddingValue: paddingValue.value(),
    fontValue: fontValue.value(),
    lineHeightValue: lineHeightValue.value(),
  };
});
const { moduleList } = useRowInfo(measureRef, o);

// 点击获取模块信息
const handleModuleClick = (slice) => {
  const key = slice.moduleKey;
  // 存在则删除，不存在则添加 (实现 toggle)
  if (selectedModuleKeys.value.has(key)) {
    selectedModuleKeys.value.delete(key);
  } else {
    selectedModuleKeys.value.add(key);
  }
};

// 分页逻辑
const pages = computed(() => {
  const padding = currentUI.value.padding || 0;
  const maxContentHeight = HEIGHT - padding * 2 - 32; // 减去内边距和页脚空间

  const result = [];
  let currentPage = [];
  let currentHeight = 0;
  // 当前正在累积的行切片（同一模块的连续行）
  let sliceModule = null;
  let sliceRows = [];

  // 把当前切片提交为页上的一个模块块
  const commitSlice = () => {
    if (!sliceModule || sliceRows.length === 0) return;
    currentPage.push({
      moduleKey: sliceModule.moduleKey,
      visibleRowIndexes: sliceRows.map((r) => r.index),
    });
    sliceModule = null;
    sliceRows = [];
  };
  // 翻页：提交切片并把当前页存入结果
  const newPage = () => {
    commitSlice();
    if (currentPage.length > 0) {
      result.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }
  };

  // 展平所有模块的行，逐行贪心装入页面
  const items = moduleList.value.flatMap((group) =>
    group.rows.map((row, index) => ({ group, row, isHead: index === 0 })),
  );

  for (const { group, row, isHead } of items) {
    // 遇到新模块，先提交上一个切片，让 currentPage 如实反映页内内容
    if (sliceModule && sliceModule !== group) commitSlice();

    // 模块间距：模块首行且当前页已有内容时才计一次
    let gap = currentPage.length > 0 && isHead ? MODULE_GAP : 0;

    // 放不下时：当前页已有内容则翻页重试；空页仍放不下（单行超高）则硬塞
    if (currentHeight + gap + row.height > maxContentHeight && currentPage.length > 0) {
      newPage();
      gap = 0; // 新页无内容，不再计间距
    }

    sliceModule = group;
    sliceRows.push(row);
    currentHeight += gap + row.height;
  }

  // 提交最后切片并补录最后一页（无任何内容时保留一个空页）
  newPage();
  if (result.length === 0) result.push(currentPage);

  return result;
});

const getPageStyle = (pageSlices, pageIndex) => {
  return pageSlices
    .map((slice) => {
      const visibleSelectors = slice.visibleRowIndexes
        .map((idx) => `:nth-child(${idx + 1})`)
        .join(",");
      return `.page-${pageIndex} .resume-module-wrapper[data-module="${slice.moduleKey}"] > .resume-row > :not(${visibleSelectors}) { display: none !important; }`;
    })
    .join("\n");
};

// 使用 usePdfExport 提供 PDF 导出能力
const { printPDF } = usePdfExport();

onMounted(() => {
  eventBus.on("resume-print-pdf", printPDF);
});

onUnmounted(() => {
  eventBus.off("resume-print-pdf", printPDF);
});
</script>

<template>
  <!-- 隐藏的测量容器：用于 useRowInfo 读取高度 -->
  <MeasureContent
    class="absolute -z-10 opacity-0"
    ref="measureRef"
    :style="[paddingValue(), { width: `${WIDTH}px` }]"
    :all-modules="allModules"
  />
  <GeneratingMask />
  <div class="relative mb-3 flex flex-col">
    <!-- 实际渲染的分页内容 -->
    <div
      v-for="(pageSlices, pageIndex) in pages"
      :key="pageIndex"
      class="resume-page-item relative mx-3 flex flex-col rounded-xl bg-white text-black"
      :class="[currentUI.fontFamily, `page-${pageIndex}`]"
      :style="[
        paddingValue(),
        fontValue(),
        lineHeightValue(),
        { width: `${WIDTH}px`, height: `${HEIGHT}px` },
      ]"
    >
      <div class="flex flex-1 flex-col gap-3">
        <div
          v-for="slice in pageSlices"
          :key="slice.moduleKey"
          class="resume-module-wrapper group relative rounded-xl hover:outline-2 hover:outline-gray-300 hover:outline-dashed"
          :class="{
            'rounded-xl bg-sf-theme-2/10 outline-2 outline-sf-theme-2 outline-dashed hover:outline-sf-theme-2':
              selectedModuleKeys.has(slice.moduleKey),
          }"
          :data-module="slice.moduleKey"
        >
          <!-- 操作按钮 -->
          <ModuleActions
            :selected="selectedModuleKeys.has(slice.moduleKey)"
            :name="slice.moduleKey"
            @select="handleModuleClick(slice)"
          />
          <ResumeModule :data="currentData" :name="slice.moduleKey" />
        </div>
      </div>
      <div class="pt-3 text-center text-xs opacity-50">
        第 {{ pageIndex + 1 }} 页，共 {{ pages.length }} 页
      </div>

      <component :is="'style'">{{ getPageStyle(pageSlices, pageIndex) }}</component>
    </div>
  </div>
</template>

<style scoped></style>
