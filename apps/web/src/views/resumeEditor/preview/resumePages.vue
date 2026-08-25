<script setup>
// 简历分页渲染可复用组件：接收 resumeItem（data/config/fixedConfig/ui），渲染分页后的简历页面
// 数据源由 props 传入，不依赖 resume store；供编辑器预览、模板缩略图、全屏查看复用
import { computed, provide, ref } from "vue";
import { fontSizeList } from "@/stores/modules/resume/uiConfig";
import MeasureContent from "./components/measureContent.vue";
import ResumeModule from "./modules/index.vue";
import { MODULE_GAP, RESUME_HEIGHT, RESUME_WIDTH } from "./constants";
import { usePreviewData } from "./usePreviewData";
import { useRowInfo } from "./useRowInfo";

defineOptions({ name: "ResumePages" });

const props = defineProps({
  // 简历项：{ data, config, fixedConfig, ui }
  item: {
    type: Object,
    required: true,
  },
  // 编辑态选中的模块 keys（编辑器预览传入，其余场景不传）
  selectedModuleKeys: {
    type: Set,
    default: () => new Set(),
  },
  // 是否显示页码
  showPageIndex: {
    type: Boolean,
    default: false,
  },
});

// 实例唯一前缀，避免多实例分页裁剪样式互相干扰
const uid = `rp-${Math.random().toString(36).slice(2, 8)}`;

// ---------- 数据代理（复用 usePreviewData）----------
const dataRef = computed(() => props.item.data);
const { previewData } = usePreviewData(dataRef);
provide("previewData", previewData);

// ---------- 主题样式注入（数据源为 item.ui）----------
const ui = computed(() => props.item.ui || {});
// 页面容器不留下边距：底部空间由页脚（页码区）控制
const paddingValue = computed(() => (offset = 0) => ({
  paddingTop: `${ui.value.padding + offset}px`,
  paddingLeft: `${ui.value.padding + offset}px`,
  paddingRight: `${ui.value.padding + offset}px`,
}));
const fontSize = computed(() => ui.value.fontSize);
const fontSizeIndex = computed(() => {
  return fontSizeList.findIndex((item) => item.value === fontSize.value);
});
const fontValue = computed(() => (offset = 0) => ({
  fontSize: `${ui.value.fontSize + offset}px`,
}));
const lineHeightValue = computed(() => (offset = 0) => {
  const indexOffset = (fontSizeIndex.value - 2) * 3;
  return { lineHeight: `${ui.value.lineHeight + offset + indexOffset}px` };
});
const themeColor = computed(() => ui.value.color || ui.value.themeColor);
const themeTemplate = computed(() => ui.value.themeTemplate);
provide("paddingValue", paddingValue);
provide("fontValue", fontValue);
provide("lineHeightValue", lineHeightValue);
provide("themeColor", themeColor);
provide("themeTemplate", themeTemplate);

// ---------- 分页（复用 useRowInfo，算法与原 page.vue 一致）----------
const measureRef = ref(null);
const allModules = computed(() => {
  const fixedModules = props.item.fixedConfig?.fields || [];
  const configModules = props.item.config?.fields || [];
  return [...fixedModules, ...configModules];
});
const o = computed(() => {
  return {
    paddingValue: paddingValue.value(),
    fontValue: fontValue.value(),
    lineHeightValue: lineHeightValue.value(),
    // 风格模板：切换时标题/内容的边框、内边距、背景会改变行高，需纳入监听触发重新测量分页
    themeTemplate: themeTemplate.value,
  };
});
const { moduleList } = useRowInfo(measureRef, o);

// 分页逻辑
const pages = computed(() => {
  const padding = ui.value.padding || 0;
  const maxContentHeight = RESUME_HEIGHT - padding - 32; // 减去上内边距和页脚空间（底部无内边距）

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

// 生成每页的可见行裁剪样式（用实例唯一前缀隔离多实例）
const getPageStyle = (pageSlices, pageIndex) => {
  return pageSlices
    .map((slice) => {
      const visibleSelectors = slice.visibleRowIndexes
        .map((idx) => `:nth-child(${idx + 1})`)
        .join(",");
      return `.${uid}-page-${pageIndex} .resume-module-wrapper[data-module="${slice.moduleKey}"] > .resume-row > :not(${visibleSelectors}) { display: none !important; }`;
    })
    .join("\n");
};
</script>

<template>
  <div class="relative flex flex-col">
    <!-- 隐藏的测量容器：用于 useRowInfo 读取行高 -->
    <MeasureContent
      class="absolute -z-10 opacity-0"
      ref="measureRef"
      :style="[paddingValue(), { width: `${RESUME_WIDTH}px` }]"
      :all-modules="allModules"
    />
    <!-- 实际渲染的分页内容 -->
    <div class="relative mb-3 flex flex-col">
      <div
        v-for="(pageSlices, pageIndex) in pages"
        :key="pageIndex"
        class="resume-page-item relative mx-3 flex flex-col rounded-xl bg-white text-black"
        :class="[ui.fontFamily, `${uid}-page-${pageIndex}`]"
        :style="[
          paddingValue(),
          fontValue(),
          lineHeightValue(),
          { width: `${RESUME_WIDTH}px`, height: `${RESUME_HEIGHT}px` },
        ]"
      >
        <div class="flex flex-1 flex-col gap-3">
          <div
            v-for="slice in pageSlices"
            :key="slice.moduleKey"
            class="resume-module-wrapper group relative rounded-xl outline-2 outline-offset-3 outline-dashed"
            :class="[
              selectedModuleKeys.has(slice.moduleKey)
                ? 'outline-sf-theme'
                : 'outline-transparent hover:outline-sf-theme-2',
            ]"
            :data-module="slice.moduleKey"
          >
            <!-- 编辑态操作按钮插槽（编辑器预览传入 ModuleActions） -->
            <slot name="moduleActions" :slice="slice" />
            <ResumeModule :data="props.item.data" :name="slice.moduleKey" />
          </div>
        </div>
        <div v-if="showPageIndex" class="py-3 text-center text-xs opacity-50">
          轻舟简历 · 第 {{ pageIndex + 1 }} 页 · 共 {{ pages.length }} 页
        </div>

        <component :is="'style'">{{ getPageStyle(pageSlices, pageIndex) }}</component>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
