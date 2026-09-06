<script setup>
// 简历分页渲染可复用组件：接收 resumeItem（data/config/fixedConfig/ui），渲染分页后的简历页面
// 数据源由 props 传入，不依赖 resume store；供编辑器预览、模板缩略图、全屏查看复用
// 本组件只做渲染编排（数据代理/主题注入/测量分页），导出、智能一页等编辑功能由上层 page.vue 注册
import { computed, ref } from "vue";
import MeasureContent from "../components/measureContent.vue";
import PreviewSinglePage from "./previewSinglePage.vue";
import ResumePageShell from "./resumePageShell.vue";
import ModuleSlot from "./moduleSlot.vue";
import { PAGE_NUMBER_HEIGHT, RESUME_CONTAINER_WIDTH, RESUME_HEIGHT } from "../constants";
import { useResumePages } from "./useResumePages";
import { useResumeTheme } from "./useResumeTheme";
import { useResumeStore } from "@/stores";
import { useInitMask } from "./useInitMask";
import { useResumePreviewData } from "./useResumePreviewData";
import { useModuleInteractions } from "./useModuleInteractions";

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
// 编辑态标记：直接以 mode 判断编辑场景，仅编辑态开放模块选择交互
const isEdit = computed(() => props.mode === "editor");

// 初始化过渡遮罩：盖住测量完成前的空页，1 秒后自动取消（仅编辑态展示）
const { showInitMask } = useInitMask(isEdit);

// 根元素 ref：导出时限定为当前实例的分页元素，避免误选其他 ResumePages 实例的页面
const rootRef = ref(null);
const measureRef = ref(null);

// 实例唯一前缀，避免多实例分页裁剪样式互相干扰
const uid = `rp-${Math.random().toString(36).slice(2, 8)}`;

// ---------- 数据代理（始终基于 props 传入的数据，多实例互不干扰）----------
const dataRef = computed(() => props.item.data);
useResumePreviewData(dataRef, isEdit);

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
const { measureDone, pages, pageStyleText, moduleList } = useResumePages({
  measureRef,
  ui,
  showPageNumber,
  isThumb,
  uid,
  allModules,
});

// ---------- 编辑态模块交互（选中高亮 / 草稿接受放弃）----------
const { moduleClassMap } = useModuleInteractions({
  isEdit,
  moduleList,
  selectedModule,
});

// 单页组件根元素回传：rootRef 限定导出范围，measureRef 供测量与图片导出
const setSingleRoot = (el) => (rootRef.value = el);
const setSingleMeasure = (el) => (measureRef.value = el);
// 向上暴露导出范围与测量结果，供上层（page.vue）注册的导出/智能一页功能读取
defineExpose({ rootEl: rootRef, measureEl: measureRef, moduleList });
</script>

<template>
  <div class="relative flex flex-col">
    <!-- 初始化过渡遮罩：盖住测量完成前的空页与分支切换，1 秒后自动取消（仅编辑态展示） -->
    <div
      v-if="showInitMask && isEdit"
      class="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm"
    >
      <SfIcon icon="lucide:loader-circle" :size="26" class="animate-spin text-sf-theme" />
    </div>
    <!-- 缩略图视为单页：仅渲染第一页内容，测量与渲染合一，无需分页裁剪；根元素由组件回传 -->
    <PreviewSinglePage
      v-if="isThumb"
      :all-modules="allModules"
      :ui="ui"
      :styles="{ paddingStyle, fontStyle, lineHeightStyle }"
      :show-page-number="showPageNumber"
      :on-root-el="setSingleRoot"
      :on-measure-el="setSingleMeasure"
    />
    <!-- 隐藏的测量容器：用于 useRowInfo 读取行高；多页时存在，缩略图测量完成后销毁 -->
    <!-- 编辑态页面外壳带 1px 边框会收窄内容宽度，测量容器同步补透明边框，保证测量与真实排版宽度一致 -->
    <template v-else>
      <div
        v-if="!measureDone"
        class="fixed -top-999 -left-999 flex h-auto flex-col bg-white text-black"
        ref="measureRef"
        :class="[ui.fontFamily, { 'border border-transparent': isEdit }]"
        :style="[paddingStyle, RESUME_CONTAINER_WIDTH, { minHeight: `${RESUME_HEIGHT}px` }]"
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
      <div ref="rootRef" class="relative flex flex-col gap-3">
        <ResumePageShell
          v-for="(pageSlices, pageIndex) in pages"
          :key="pageIndex"
          :ui="ui"
          :styles="{ paddingStyle, fontStyle, lineHeightStyle }"
          :show-page-number="showPageNumber"
          :page-index="pageIndex"
          :page-count="pages.length"
          :class="[
            `${uid}-page-${pageIndex}`,
            {
              'border border-sf-b hover:border-sf-theme-2': mode === 'editor',
            },
          ]"
        >
          <ModuleSlot
            v-for="slice in pageSlices"
            :key="slice.moduleKey"
            :module-key="slice.moduleKey"
            :is-edit="isEdit"
            :outline-class="moduleClassMap[slice.moduleKey]"
          />
        </ResumePageShell>
      </div>
      <!-- 每页可见行裁剪样式 -->
      <component :is="'style'">{{ pageStyleText }}</component>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
