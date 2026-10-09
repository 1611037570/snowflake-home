<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import ResumePages from "../resumePages/index.vue";
import ExportSuccessModal from "../resumePages/export/exportSuccessModal.vue";
import { useResumeExport } from "../resumePages/export/useResumeExport";
import { useSmartOnePage } from "./useSmartOnePage";
import { useModuleInteractions } from "./useModuleInteractions";
import {
  clearPreviewSelection,
  jumpPreview,
  locateEditor,
  previewSelectedModule,
} from "../../hooks/useModuleNav";
import eventBus from "@/utils/modules/eventBus";
import { layoutUsesColumns, resolveLayoutColumns } from "@/views/resume/theme/layouts";
import { resolveThemeDecisions } from "@/views/resume/theme";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, runtimeConfig, runtimeFields, selectedModule, system } =
  storeToRefs(resumeStore);

const exportSuccessModalRef = ref(null);

// 组装可复用组件所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  // 编辑态优先使用运行时配置，使字段拖拽顺序立即同步到预览。
  config: runtimeConfig.value ?? currentConfig.value,
  ui: currentUI.value,
}));

// 导出成功：触发导出成功弹窗（由 exportSuccessModal 内部管理弹窗与投递逻辑）
const onExportSuccess = () => {
  exportSuccessModalRef.value?.open();
};
// ---------- 编辑功能注册（导出 / 智能一页）----------
// 依赖预览实例的测量结果与导出范围，经组件实例 expose 代理读取，读取时始终取最新值
// 导出和编辑交互只读取页面渲染器暴露的节点、布局与分页结果。
const pagesRef = ref(null);
const isEdit = computed(() => true);
const previewRootRef = computed(() => pagesRef.value?.rootEl ?? null);
const previewMeasureRef = computed(() => pagesRef.value?.measureEl ?? null);
const previewPagePlan = computed(() => pagesRef.value?.pagePlan ?? { pages: [] });
const previewModuleKeys = computed(() => pagesRef.value?.moduleKeys ?? []);
const previewMeasured = computed(() => pagesRef.value?.previewMeasured ?? false);
const measureDone = computed(() => pagesRef.value?.measureDone ?? false);
const moduleKeys = computed(() => previewModuleKeys.value);
const selectedModuleKeys = computed(() => selectedModule.value.map((module) => module.key));
const { moduleClassMap } = useModuleInteractions({
  isEdit,
  moduleKeys,
  selectedModule,
  activeModuleKey: previewSelectedModule,
});

// 栏内移动方向由已生成的分页顺序计算，交互结果由编辑器模式写回配置。
const columnMoveContext = computed(() => {
  const orderByColumn = new Map();
  previewPagePlan.value.pages?.forEach((page) => {
    page.regions.forEach((region) => {
      region.columns.forEach((column) => {
        let order = orderByColumn.get(column.columnId);
        if (!order) {
          order = [];
          orderByColumn.set(column.columnId, order);
        }
        column.fragments.forEach((fragment) => {
          if (fragment.fragment === "middle" || fragment.fragment === "last") return;
          if (!order.includes(fragment.sourceModuleKey)) order.push(fragment.sourceModuleKey);
        });
      });
    });
  });
  const directions = {};
  orderByColumn.forEach((order, columnId) => {
    const list = {};
    order.forEach((moduleKey, index) => {
      const previous = index > 0 ? order[index - 1] : null;
      list[moduleKey] =
        moduleKey === "user"
          ? { up: false, down: false }
          : { up: previous !== null && previous !== "user", down: index < order.length - 1 };
    });
    directions[columnId] = list;
  });
  return { orderByColumn, directions };
});

// 页面测量状态由编辑器模式同步到简历 store。
// ResumePages 已同时处理空简历与主题内置标语，编辑器只读取它给出的最终就绪状态。
const previewReady = computed(() => previewMeasured.value);
const settlePreviewSync = useDebounceFn(() => {
  if (previewReady.value) resumeStore.setPreviewSyncing(false);
}, 200);
watch(
  [previewReady, measureDone],
  () => {
    if (!previewReady.value) {
      resumeStore.setPreviewSyncing(true);
      return;
    }
    settlePreviewSync();
  },
  { immediate: true },
);

const handleModuleClick = ({ moduleKey }) => {
  if (system.value.previewClickLocate) locateEditor(moduleKey);
};
const handleModuleItemClick = ({ moduleKey, itemIndex }) => {
  if (!system.value.previewClickLocate) return;
  locateEditor(moduleKey, itemIndex == null ? undefined : { itemIndex });
};
const handleModuleMouseEnter = (moduleKey) => clearPreviewSelection(moduleKey);
const handleModuleSelect = (moduleKey) => {
  if (selectedModuleKeys.value.includes(moduleKey)) {
    resumeStore.unselectModule(moduleKey);
  } else {
    resumeStore.selectModule(moduleKey);
  }
};
const handleLocatePreviewModule = (moduleKey) => jumpPreview(moduleKey);
onMounted(() => eventBus.on("resume-locate-preview-module", handleLocatePreviewModule));
onUnmounted(() => eventBus.off("resume-locate-preview-module", handleLocatePreviewModule));

// 版式由主题定义决定，简历 ui 里不再保存 layout.type
const layoutType = computed(() => resolveThemeDecisions(currentUI.value?.theme?.template).layoutType);
const moveModuleAcrossColumn = (moduleKey, columnId, direction) => {
  const columns = resolveLayoutColumns(
    layoutType.value,
    previewModuleKeys.value,
    currentUI.value.layout.columns,
  );
  const sourceSide = columnId === "left" ? "left" : "right";
  const targetSide = direction === "left" ? "left" : "right";
  if (sourceSide === targetSide) return;
  const source = columns[sourceSide];
  const target = columns[targetSide];
  const index = source.indexOf(moduleKey);
  if (index < 0) return;
  source.splice(index, 1);
  target.push(moduleKey);
  resumeStore.setLayoutColumns(columns);
};
const handleModuleMove = ({ moduleKey, direction, columnId }) => {
  if (direction === "left" || direction === "right") {
    moveModuleAcrossColumn(moduleKey, columnId, direction);
    return;
  }
  if (direction !== "up" && direction !== "down") return;
  const order = columnMoveContext.value.orderByColumn.get(columnId) ?? [];
  const index = order.indexOf(moduleKey);
  if (index < 0) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= order.length) return;
  // 单栏布局按简历模块顺序移动，使上下操作同步到预览。
  if (!layoutUsesColumns(layoutType.value)) {
    resumeStore.swapModuleOrder(moduleKey, order[target]);
    return;
  }
  const columns = resolveLayoutColumns(
    layoutType.value,
    previewModuleKeys.value,
    currentUI.value.layout.columns,
  );
  const side = columnId === "left" ? "left" : "right";
  // 按模块标识定位栏内位置，避免未渲染模块导致预览下标错位。
  const sourceIndex = columns[side].indexOf(moduleKey);
  const targetIndex = columns[side].indexOf(order[target]);
  if (sourceIndex < 0 || targetIndex < 0) return;
  [columns[side][sourceIndex], columns[side][targetIndex]] = [
    columns[side][targetIndex],
    columns[side][sourceIndex],
  ];
  resumeStore.setLayoutColumns(columns);
};
useResumeExport({
  isEdit,
  rootRef: previewRootRef,
  measureRef: previewMeasureRef,
  pagePlan: previewPagePlan,
  previewReady,
  onExportSuccess,
});
useSmartOnePage({
  ui: currentUI,
  pagePlan: previewPagePlan,
  previewReady,
  currentUI,
  isEdit,
});
</script>

<template>
  <ResumePages
    ref="pagesRef"
    :item="resumeItem"
    :expanded-fields="runtimeFields"
    :show-page-number="system.showPageNumber"
    :show-debug="system.showDebug"
    :module-class-map="moduleClassMap"
    :selected-module-keys="selectedModuleKeys"
    :move-directions-by-column="columnMoveContext.directions"
    @module-click="handleModuleClick"
    @module-item-click="handleModuleItemClick"
    @module-mouseenter="handleModuleMouseEnter"
    @module-move="handleModuleMove"
    @module-select="handleModuleSelect"
  />
  <!-- 导出成功弹窗（含投递简历入口）由该组件统一管理 -->
  <ExportSuccessModal ref="exportSuccessModalRef" />
</template>

<style scoped></style>
