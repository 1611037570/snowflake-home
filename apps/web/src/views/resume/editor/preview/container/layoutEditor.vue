<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useEventListener } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import { isFieldHidden } from "@/components/business/dynamicForm/api";
import {
  defaultLeftColumnWidth,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  uiParamRanges,
} from "@/stores/modules/resume/config/uiConfig";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../constants";
import { getPreviewTitle } from "../i18n";
import { buildLayoutNodes } from "../resumePages/engine/adapter/buildLayoutNodes";
import { createResumeLayout } from "../resumePages/engine/layout/createResumeLayout";
import { resolveColumnWidths } from "../resumePages/engine/layout/resolveColumnWidths";

const resumeStore = useResumeStore();
const { currentUI, currentData, runtimeFields } = storeToRefs(resumeStore);
const { setPageLayout, swapModuleOrder } = resumeStore;

// 面板数值参数：标签、绑定字段、默认值与单位集中维护，滑块与缩略图共用
const paramList = [
  { label: "上下页边距", key: "paddingVertical", defaultValue: defaultPaddingVertical, unit: "px" },
  {
    label: "左右页边距",
    key: "paddingHorizontal",
    defaultValue: defaultPaddingHorizontal,
    unit: "px",
  },
  { label: "左栏宽度", key: "leftColumnWidth", defaultValue: defaultLeftColumnWidth, unit: "%" },
  { label: "模块上下间距", key: "moduleSpacing", defaultValue: defaultModuleSpacing, unit: "px" },
  {
    label: "模块段落间距",
    key: "paragraphSpacing",
    defaultValue: defaultParagraphSpacing,
    unit: "px",
  },
  { label: "行间距", key: "lineHeight", defaultValue: defaultLineHeight, unit: "倍" },
];
const findParam = (key) => paramList.find((item) => item.key === key);
const paddingVerticalParam = findParam("paddingVertical");
const paddingHorizontalParam = findParam("paddingHorizontal");
// 缩略图下方保留间距类参数
const spacingParams = ["moduleSpacing", "paragraphSpacing", "lineHeight"].map(findParam);

// 读取数值型参数：统一转为数值，字段缺失时回退默认值，避免参与缩略图换算出现 NaN
const getNumberValue = (key) => {
  const value = Number(currentUI.value?.[key]);
  return Number.isFinite(value) ? value : (findParam(key)?.defaultValue ?? 0);
};
// 写入参数：数值型统一使用数值类型
const setParam = (key, value) => {
  if (!currentUI.value) return;
  currentUI.value[key] = Number(value);
};

// 缩略图尺寸：真实页面按固定宽度等比缩放，边距与间距同步换算
const MINI_PAGE_WIDTH = 180;
const miniScale = MINI_PAGE_WIDTH / RESUME_WIDTH;
const miniPageHeight = Math.round(RESUME_HEIGHT * miniScale);
const scaled = (value) => (Math.max(0, Number(value) || 0) * miniScale).toFixed(2);

// 参与排版的模块：按适配器实际产出节点判断模块是否有内容，与预览口径一致
const activeModuleKeys = computed(() => {
  const moduleKeys = (runtimeFields.value || [])
    .filter((field) => field?.key && !isFieldHidden(currentData.value, field))
    .map((field) => field.key);
  const nodes = buildLayoutNodes({
    moduleKeys,
    data: currentData.value || {},
    ui: currentUI.value || {},
  });
  return [...new Set(nodes.map((node) => node.sourceModuleKey))];
});
// 当前生效布局：优先显式布局，否则按主题模板推导，与预览排版同源
const layout = computed(() =>
  createResumeLayout({
    ui: currentUI.value || {},
    moduleKeys: activeModuleKeys.value,
    paddingVertical: getNumberValue("paddingVertical"),
    paddingHorizontal: getNumberValue("paddingHorizontal"),
    gap: getNumberValue("moduleSpacing"),
    leftColumnWidth: getNumberValue("leftColumnWidth"),
  }),
);
const columnWidths = computed(() =>
  resolveColumnWidths(layout.value, RESUME_WIDTH - getNumberValue("paddingHorizontal") * 2),
);
// 模块全局顺序：栏内顺序与预览渲染一致，由简历配置顺序决定，而不是栏位自身的键顺序
const moduleOrderMap = computed(
  () => new Map(activeModuleKeys.value.map((key, index) => [key, index])),
);
// 缩略图结构：按区域与栏位还原当前布局，仅展示有内容的模块
const miniRegions = computed(() =>
  layout.value.regions.map((region) => ({
    id: region.id,
    columns: region.columns.map((column) => ({
      id: column.id,
      width: columnWidths.value.get(column.id) || 1,
      moduleKeys: column.moduleKeys
        .filter((key) => moduleOrderMap.value.has(key))
        .sort((left, right) => moduleOrderMap.value.get(left) - moduleOrderMap.value.get(right)),
    })),
  })),
);
// 模块标题：优先模块 ui.title，其次语言包默认标题
const moduleTitle = (moduleKey) =>
  currentData.value?.[moduleKey]?.ui?.title ||
  getPreviewTitle(moduleKey, currentUI.value?.language || "zh");

// ---------- 左右页边距与上下页边距之外的栏宽拖拽 ----------
let dividerTrack = null;
const draggingDivider = ref(false);
// 拖拽分隔线：以栏位区域为基准，按指针水平位置换算左栏占比
const handleDividerDown = (event) => {
  const track = event.currentTarget?.parentElement;
  if (!track) return;
  const rect = track.getBoundingClientRect();
  dividerTrack = { left: rect.left, width: rect.width };
  draggingDivider.value = true;
  event.preventDefault();
};
// 左栏宽度：限制在参数范围内；显式布局下同步左右栏比例，避免只改了模板参数
const setLeftWidth = (percent) => {
  const range = uiParamRanges.leftColumnWidth;
  const next = Math.round(Math.min(range.max, Math.max(range.min, Number(percent) || range.min)));
  setParam("leftColumnWidth", next);
  const pageLayout = currentUI.value?.pageLayout;
  if (!pageLayout?.regions) return;
  setPageLayout({
    ...pageLayout,
    regions: pageLayout.regions.map((region) => ({
      ...region,
      columns: region.columns.map((column, index) =>
        region.columns.length === 2
          ? { ...column, width: { mode: "ratio", value: index === 0 ? next : 100 - next } }
          : column,
      ),
    })),
  });
};
useEventListener(window, "pointermove", (event) => {
  if (!draggingDivider.value || !dividerTrack?.width) return;
  setLeftWidth(((event.clientX - dividerTrack.left) / dividerTrack.width) * 100);
});
useEventListener(window, "pointerup", () => {
  draggingDivider.value = false;
});
// 双栏分隔线位置：按解析后的栏宽与栏间距定位，与页面实际分栏边界一致
const getDividerLeft = (region) => {
  const [first, second] = region.columns;
  if (!first || !second) return "50%";
  const gap = Number(layout.value.columnGap) || 0;
  const total = first.width + second.width + gap;
  if (!total) return "50%";
  return `${((first.width + gap / 2) / total) * 100}%`;
};

// ---------- 缩略图内模块拖拽排序（与预览区上下移、左右移使用同一套操作）----------
const draggingKey = ref("");
const dropColumnId = ref("");
const dropModuleKey = ref("");
const handleDragStart = (event, moduleKey) => {
  draggingKey.value = moduleKey;
  dropColumnId.value = "";
  dropModuleKey.value = "";
  event.dataTransfer.effectAllowed = "move";
  // 部分浏览器需要写入数据才会触发拖拽
  event.dataTransfer.setData("text/plain", moduleKey);
};
const resetDrag = () => {
  draggingKey.value = "";
  dropColumnId.value = "";
  dropModuleKey.value = "";
};
// 记录放置目标：命中模块时记录模块，落在栏位空白处时只记录栏
const markDropTarget = (columnId, moduleKey = "") => {
  if (!draggingKey.value) return;
  dropColumnId.value = columnId;
  dropModuleKey.value = moduleKey;
};
const findColumnId = (moduleKey) =>
  layout.value.regions
    .flatMap((region) => region.columns)
    .find((column) => column.moduleKeys.includes(moduleKey))?.id || "";
// 跨栏拖拽：把当前布局物化为显式 pageLayout，并把模块移入目标栏
const moveModuleToColumn = (moduleKey, columnId) => {
  const current = layout.value;
  if (!current?.regions) return;
  const regions = current.regions.map((region) => ({
    ...region,
    columns: region.columns.map((column) => ({ ...column, moduleKeys: [...column.moduleKeys] })),
  }));
  const target = regions
    .flatMap((region) => region.columns)
    .find((column) => column.id === columnId);
  if (!target) return;
  regions.forEach((region) => {
    region.columns.forEach((column) => {
      column.moduleKeys = column.moduleKeys.filter((key) => key !== moduleKey);
    });
  });
  if (!target.moduleKeys.includes(moduleKey)) target.moduleKeys.push(moduleKey);
  setPageLayout({ ...current, regions });
};
// 放置处理：同栏交换配置顺序，跨栏先换栏再按落点交换；个人信息由 store 规则拒绝交换
const handleDrop = () => {
  const fromKey = draggingKey.value;
  const columnId = dropColumnId.value;
  const targetKey = dropModuleKey.value;
  resetDrag();
  if (!fromKey || !columnId) return;
  const fromColumnId = findColumnId(fromKey);
  if (!fromColumnId) return;
  if (fromColumnId !== columnId) moveModuleToColumn(fromKey, columnId);
  if (targetKey && targetKey !== fromKey) swapModuleOrder(fromKey, targetKey);
};
// 模块块样式：个人信息与普通模块区分，拖拽中与放置目标高亮
const blockClass = (moduleKey, columnId) => [
  moduleKey === "user" ? "bg-sf-theme-2 text-sf-theme" : "bg-sf-bg-2 text-sf-text-2",
  moduleKey === "user" ? "h-7" : "h-5",
  draggingKey.value === moduleKey ? "opacity-50" : "",
  draggingKey.value &&
  draggingKey.value !== moduleKey &&
  dropColumnId.value === columnId &&
  dropModuleKey.value === moduleKey
    ? "ring-1 ring-sf-theme"
    : "",
];
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false" :hide-on-click="false">
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:layout-template" size="5" />
      <span>版式</span>
    </span>
    <template #dropdown>
      <div class="flex w-[264px] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="flex items-center justify-between text-xs font-bold text-sf-text">
          <span>页面版式</span>
          <span class="font-normal text-sf-text-2">拖拽模块可调整顺序</span>
        </div>

        <!-- 缩略图上方：调整上下页边距 -->
        <div class="flex items-center gap-3">
          <span class="flex shrink-0 items-center gap-1 text-xs text-sf-text-2">
            <span>{{ paddingVerticalParam.label }}</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="3.5"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="setParam(paddingVerticalParam.key, paddingVerticalParam.defaultValue)"
            />
          </span>
          <SfSlider
            :model-value="getNumberValue(paddingVerticalParam.key)"
            @update:model-value="(value) => setParam(paddingVerticalParam.key, value)"
            :min="uiParamRanges[paddingVerticalParam.key].min"
            :max="uiParamRanges[paddingVerticalParam.key].max"
            :step="uiParamRanges[paddingVerticalParam.key].step"
            size="small"
          />
          <span class="w-8 shrink-0 text-right text-xs text-sf-text-2"
            >{{ getNumberValue(paddingVerticalParam.key) }}{{ paddingVerticalParam.unit }}</span
          >
        </div>

        <div class="flex items-stretch gap-3">
          <!-- 页面缩略图：模块块可直接拖拽排序，双栏时可拖拽中间分隔线 -->
          <div
            class="relative shrink-0 overflow-hidden rounded-lg border border-sf-b bg-sf-bg"
            :style="{
              width: `${MINI_PAGE_WIDTH}px`,
              height: `${miniPageHeight}px`,
              padding: `${scaled(getNumberValue(paddingVerticalParam.key))}px ${scaled(
                getNumberValue(paddingHorizontalParam.key),
              )}px`,
            }"
          >
            <div class="flex h-full w-full flex-col" :style="{ gap: `${scaled(layout.regionGap)}px` }">
              <div
                v-for="region in miniRegions"
                :key="region.id"
                class="relative flex w-full"
                :style="{ gap: `${scaled(layout.columnGap)}px` }"
              >
                <div
                  v-for="column in region.columns"
                  :key="column.id"
                  class="flex min-w-0 flex-col rounded-sm"
                  :class="{ 'bg-sf-bg-3': dropColumnId === column.id && !dropModuleKey }"
                  :style="{
                    flexGrow: column.width,
                    flexBasis: 0,
                    gap: `${scaled(getNumberValue('moduleSpacing'))}px`,
                  }"
                  @dragover.prevent="markDropTarget(column.id)"
                  @drop.prevent="handleDrop"
                >
                  <div
                    v-for="moduleKey in column.moduleKeys"
                    :key="moduleKey"
                    draggable="true"
                    class="flex shrink-0 cursor-grab items-center overflow-hidden rounded-sm border border-sf-b px-1 text-[9px] leading-none select-none"
                    :class="blockClass(moduleKey, column.id)"
                    @dragstart="handleDragStart($event, moduleKey)"
                    @dragend="resetDrag"
                    @dragover.stop.prevent="markDropTarget(column.id, moduleKey)"
                    @drop.stop.prevent="handleDrop"
                  >
                    <span class="truncate">{{ moduleTitle(moduleKey) }}</span>
                  </div>
                </div>
                <!-- 双栏分隔线：拖拽调整左右栏宽度占比 -->
                <div
                  v-if="region.columns.length === 2"
                  class="absolute inset-y-0 z-10 w-3 -translate-x-1/2 cursor-col-resize"
                  :style="{ left: getDividerLeft(region) }"
                  @pointerdown="handleDividerDown"
                >
                  <div class="mx-auto h-full w-px bg-sf-theme"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 缩略图右侧：调整左右页边距 -->
          <div class="flex w-12 shrink-0 flex-col items-center gap-1">
            <span class="text-[10px] text-sf-text-2">{{ paddingHorizontalParam.label }}</span>
            <span class="text-[10px] text-sf-text-2"
              >{{ getNumberValue(paddingHorizontalParam.key) }}{{ paddingHorizontalParam.unit }}</span
            >
            <div class="flex min-h-0 flex-1 items-center justify-center">
              <SfSlider
                vertical
                class="flex-none!"
                :height="`${miniPageHeight - 48}px`"
                :model-value="getNumberValue(paddingHorizontalParam.key)"
                @update:model-value="(value) => setParam(paddingHorizontalParam.key, value)"
                :min="uiParamRanges[paddingHorizontalParam.key].min"
                :max="uiParamRanges[paddingHorizontalParam.key].max"
                :step="uiParamRanges[paddingHorizontalParam.key].step"
                size="small"
              />
            </div>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="3.5"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="setParam(paddingHorizontalParam.key, paddingHorizontalParam.defaultValue)"
            />
          </div>
        </div>

        <!-- 缩略图下方：模块间距类参数 -->
        <div v-for="item in spacingParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-xs text-sf-text-2">
            <span class="flex items-center gap-1">
              <span>{{ item.label }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="3.5"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="setParam(item.key, item.defaultValue)"
              />
            </span>
            <span>{{ getNumberValue(item.key) }}{{ item.unit }}</span>
          </div>
          <SfSlider
            :model-value="getNumberValue(item.key)"
            @update:model-value="(value) => setParam(item.key, value)"
            :min="uiParamRanges[item.key].min"
            :max="uiParamRanges[item.key].max"
            :step="uiParamRanges[item.key].step"
            size="small"
          />
        </div>
      </div>
    </template>
  </SfDropdown>
</template>
