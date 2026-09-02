<script setup>
// 简历分页渲染可复用组件：接收 resumeItem（data/config/fixedConfig/ui），渲染分页后的简历页面
// 数据源由 props 传入，不依赖 resume store；供编辑器预览、模板缩略图、全屏查看复用
import { computed, inject, onMounted, onUnmounted, provide, ref, watch } from "vue";
import MeasureContent from "../components/measureContent.vue";
import DiffPopover from "../components/diffPopover.vue";
import ResumeModule from "../modules/index.vue";
import { MODULE_GAP, PAGE_NUMBER_HEIGHT, RESUME_WIDTH, RESUME_HEIGHT } from "../constants";
import { createPreviewProxy } from "../usePreviewData";
import { useResumePages } from "./useResumePages";
import { useResumeTheme } from "./useResumeTheme";
import PreviewSinglePage from "./previewSinglePage.vue";
import { printPDF as exportPdf } from "../pdfExport";
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { printImage as exportImage } from "../imageExport";
const resumeStore = useResumeStore();
const { selectedModule, system } = storeToRefs(resumeStore);

defineOptions({ name: "ResumePages" });

const props = defineProps({
  // 简历项：{ data, config, fixedConfig, ui }
  item: {
    type: Object,
    required: true,
  },
  // 场景模式：'editor' 编辑器交互预览（默认），'preview' 全屏只读，'thumb' 缩略图只读（仅渲染第一页）
  mode: {
    type: String,
    default: "editor",
  },
});

// 缩略图模式：仅渲染第一页，测量完成后冻结行数据
const isThumb = computed(() => props.mode === "thumb");
// 只读模式：不渲染模块操作按钮插槽
const isReadonly = computed(() => props.mode !== "editor");

// 根元素 ref：导出时限定为当前实例的分页元素，避免误选其他 ResumePages 实例的页面
const rootRef = ref(null);
const measureRef = ref(null);
// 仅编辑器模式注册全局导出事件（缩略图/全屏预览不注册），将当前实例根节点 ref 传入纯函数
const printPDF = () => exportPdf(rootRef);
const printImage = () => exportImage(measureRef);
// 初始化过渡遮罩：盖住测量完成前的空页，1 秒后自动取消（仅编辑态展示）
const showInitMask = ref(true);
let maskTimer = undefined;
onMounted(() => {
  maskTimer = window.setTimeout(() => (showInitMask.value = false), 1000);
  if (!isReadonly.value) {
    eventBus.on("resume-print-pdf", printPDF);
    eventBus.on("resume-print-image", printImage);
  }
});
onUnmounted(() => {
  window.clearTimeout(maskTimer);
  if (!isReadonly.value) {
    eventBus.off("resume-print-pdf", printPDF);
    eventBus.off("resume-print-image", printImage);
  }
});

// 实例唯一前缀，避免多实例分页裁剪样式互相干扰
const uid = `rp-${Math.random().toString(36).slice(2, 8)}`;

// ---------- 数据代理（始终基于 props 传入的数据，多实例互不干扰）----------
const dataRef = computed(() => props.item.data);
// 父级已基于同一份数据创建过代理时直接复用，避免同一数据重复建代理树与重复挂 watch；
// 缩略图、全屏预览等数据源不同的实例仍各自创建，保证多实例互不干扰
const parentPreviewData = inject("previewData", null);
const previewData = computed(() => {
  const source = dataRef.value || {};
  if (parentPreviewData?.value?.__source === source) return parentPreviewData.value;
  return createPreviewProxy(source);
});
provide("previewData", previewData);
// 共享测量结果：编辑态实例写入，供智能一页等消费方复用
const sharedModuleList = inject("previewModuleList", null);

// ---------- 主题样式注入（数据源为 item.ui）----------
const ui = computed(() => props.item.ui || {});
const showPageNumber = computed(() => system.value.showPageNumber);
const themeStyles = useResumeTheme(ui);
const { paddingStyle, fontStyle, lineHeightStyle } = themeStyles;

// ---------- 分页（测量 + 分页算法 + 裁剪样式）----------
const allModules = computed(() => {
  const fixedModules = props.item.fixedConfig?.fields || [];
  const configModules = props.item.config?.fields || [];
  return [...fixedModules, ...configModules];
});
const { measureDone, pages, pageStyleText, moduleClass, moduleList, isSinglePage } = useResumePages(
  {
    measureRef,
    ui,
    themeStyles,
    showPageNumber,
    isThumb,
    selectedModule,
    isReadonly,
    uid,
    allModules,
  },
);
// 单页组件根元素回传：rootRef 限定导出范围，measureRef 供测量与图片导出
const setSingleRoot = (el) => (rootRef.value = el);
const setSingleMeasure = (el) => (measureRef.value = el);
// 编辑态实例把测量结果写入共享 ref，供智能一页复用，避免其重复挂载测量容器
watch(moduleList, (list) => {
  if (!isReadonly.value && sharedModuleList) sharedModuleList.value = list;
});
const containerWidth = {
  width: `${RESUME_WIDTH}px`,
  minWidth: `${RESUME_WIDTH}px`,
  maxWidth: `${RESUME_WIDTH}px`,
};
const containerHeight = {
  height: `${RESUME_HEIGHT}px`,
  minHeight: `${RESUME_HEIGHT}px`,
  maxHeight: `${RESUME_HEIGHT}px`,
};
</script>

<template>
  <div class="relative flex flex-col">
    <!-- 初始化过渡遮罩：盖住测量完成前的空页与分支切换，1 秒后自动取消（仅编辑态展示） -->
    <div
      v-if="showInitMask && !isReadonly"
      class="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm"
    >
      <SfIcon icon="lucide:loader-circle" size="6" class="animate-spin text-sf-theme" />
    </div>
    <!-- 单页快路径：内容放入一页时测量与渲染合一，不再常驻隐藏测量容器与分页裁剪；根元素由组件回传 -->
    <PreviewSinglePage
      v-if="isSinglePage"
      :item="props.item"
      :all-modules="allModules"
      :ui="ui"
      :styles="{ paddingStyle, fontStyle, lineHeightStyle }"
      :show-page-number="showPageNumber"
      :on-root-el="setSingleRoot"
      :on-measure-el="setSingleMeasure"
    />
    <!-- 隐藏的测量容器：用于 useRowInfo 读取行高；多页时存在，缩略图测量完成后销毁 -->
    <div
      v-if="!isSinglePage && !measureDone"
      class="fixed -top-999 -left-999 flex h-auto flex-col bg-white text-black"
      ref="measureRef"
      :class="ui.fontFamily"
      :style="[
        paddingStyle,
        containerWidth,
        {
          minHeight: `${RESUME_HEIGHT}px`,
        },
      ]"
    >
      <MeasureContent :all-modules="allModules" />
      <div
        v-if="showPageNumber"
        class="flex flex-1 items-end justify-center py-3 text-xs opacity-50"
        :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
      >
        轻舟简历
      </div>
    </div>
    <!-- 实际渲染的分页内容 -->
    <div v-if="!isSinglePage" ref="rootRef" class="relative flex flex-col gap-3">
      <div
        v-for="(pageSlices, pageIndex) in pages"
        :key="pageIndex"
        class="resume-page-item relative flex flex-col rounded-3xl bg-white text-black"
        :class="[
          ui.fontFamily,
          `${uid}-page-${pageIndex}`,
          {
            'border border-sf-b hover:border-sf-theme-2': mode === 'editor',
          },
        ]"
        :style="[paddingStyle, fontStyle, lineHeightStyle, containerWidth, containerHeight]"
      >
        <!-- 模块之间的间距由 ui.moduleSpacing 控制，与分页计算保持一致 -->
        <div class="flex flex-1 flex-col" :style="{ gap: `${ui.moduleSpacing}px` }">
          <div
            v-for="slice in pageSlices"
            :key="slice.moduleKey"
            class="resume-module-wrapper group group/module relative rounded-xl"
            :data-module="slice.moduleKey"
            :class="moduleClass(slice)"
          >
            <!-- 编辑态操作按钮插槽（编辑器预览传入 ModuleActions） -->
            <slot v-if="!isReadonly" name="moduleActions" :slice="slice" />
            <ResumeModule :data="props.item.data" :name="slice.moduleKey" />
          </div>
        </div>
        <div
          v-if="showPageNumber"
          class="flex-c py-3 text-xs opacity-50"
          :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
        >
          轻舟简历 · 第 {{ pageIndex + 1 }} 页 · 共 {{ pages.length }} 页
        </div>
      </div>
    </div>
    <DiffPopover v-if="!isReadonly" />
    <component :is="'style'">{{ pageStyleText }}</component>
  </div>
</template>

<style lang="scss" scoped></style>
