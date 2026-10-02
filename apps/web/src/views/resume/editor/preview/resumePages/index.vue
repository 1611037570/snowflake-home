<script setup>
// 简历分页渲染可复用组件：接收 resumeItem（data/config/ui），渲染分页后的简历页面
// 数据源由 props 传入，不依赖 resume store；供编辑器预览、模板缩略图、全屏查看复用
// 本组件只编排数据、主题、测量、分页和页面输出；编辑器行为由调用方处理。
import { computed, ref } from "vue";
import { getFieldLabel } from "@/components/business/dynamicForm/api";
import { expandConfigModules } from "@/stores/modules/resume/hooks/useConfigTemplate";
import ResumePageShell from "./resumePageShell.vue";
import LayoutMeasureTree from "./render/measure/layoutMeasureTree.vue";
import Column from "./render/column.vue";
import RegionContainer from "@/views/resume/theme/components/regionContainer/index.vue";
import { hasThemeSlogan } from "@/views/resume/theme/components/sloganModule/registry";
import { useResumePages } from "./useResumePages";
import { resolveRegionGap } from "./engine/layout/regionFlows";
import { useResumeTheme } from "@/views/resume/theme/useResumeTheme";
import { provideResumePreviewContext } from "../shared/previewContext";
import { isEmptyResume } from "../../toolbar/modules/progress/useResumeStats";
import { getPreviewText } from "../shared/i18n";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../shared/constants";
import { $t } from "@/locales";

defineOptions({ name: "ResumePages" });

const emit = defineEmits([
  "module-click",
  "module-item-click",
  "module-mouseenter",
  "module-move",
  "module-select",
]);

const props = defineProps({
  // 简历项：{ data, config, ui }
  item: {
    type: Object,
    required: true,
  },
  // 编辑器运行时已展开的字段配置，避免预览重复展开并深拷贝
  expandedFields: {
    type: Array,
    default: undefined,
  },
  // 场景模式：'editor' 编辑器交互预览（默认），'preview' 全屏只读，'thumb' 缩略图只读，'single' 只读单页
  mode: {
    type: String,
    default: "editor",
  },
  // 页面显示设置和编辑态高亮由调用方提供，渲染器不读取编辑器 store。
  showPageNumber: {
    type: Boolean,
    default: false,
  },
  showDebug: {
    type: Boolean,
    default: false,
  },
  moduleClassMap: {
    type: Object,
    default: () => ({}),
  },
  selectedModuleKeys: {
    type: Array,
    default: () => [],
  },
  moveDirectionsByColumn: {
    type: Object,
    default: () => ({}),
  },
});

// 缩略图模式：仅渲染第一页，测量完成后冻结行数据
const isThumb = computed(() => props.mode === "thumb");
// 编辑态标记：直接以 mode 判断编辑场景，仅编辑态开放模块选择交互
const isEdit = computed(() => props.mode === "editor");
// 调试色只用于编辑预览，避免影响缩略图和导出内容
const showLayoutDebug = computed(() => isEdit.value && props.showDebug);

// 根元素 ref：导出时限定为当前实例的分页元素，避免误选其他 ResumePages 实例的页面
const rootRef = ref(null);
const layoutMeasureRef = ref(null);

// ---------- 数据注入（始终基于 props 传入的数据，多实例互不干扰）----------
const dataRef = computed(() => props.item.data);
const ui = computed(() => props.item.ui || {});
// 轻量判空：命中第一处正文文本即结束，避免为判空执行全量字数统计
// 主题自带的顶部标语可独立构成预览内容，不依赖简历数据。
const isEmpty = computed(() => isEmptyResume(dataRef.value) && !hasThemeSlogan(ui.value?.theme?.template));

// ---------- 主题样式注入（数据源为 item.ui）----------
// 简历展示语言：供预览标题语言包使用
const previewLang = computed(() => ui.value.content?.language || "zh");
const showPageNumber = computed(() => props.showPageNumber);
const themeStyles = useResumeTheme(ui);
const { paddingStyle, fontStyle, lineHeightStyle, fontReadyVersion } = themeStyles;
// 页面四周留白：测量树里的正文容器用它内缩，位置与真实页面一致
const pagePadding = computed(() => ({
  top: Number(ui.value.page?.padding?.vertical) || 0,
  right: Number(ui.value.page?.padding?.horizontal) || 0,
  bottom: Number(ui.value.page?.padding?.vertical) || 0,
  left: Number(ui.value.page?.padding?.horizontal) || 0,
}));
// 纸张边框宽度：页面盒子内圈描边，测量树同样内缩，长度口径与引擎一致
const pageBorderWidth = computed(() => Math.max(0, Number(ui.value.page?.border?.width) || 0));
const measureTreeStyle = computed(() => ({
  ...fontStyle.value,
  ...lineHeightStyle.value,
  backgroundColor: ui.value.page?.background || "#ffffff",
  color: ui.value.page?.background?.toLowerCase() === "#000000" ? "#ffffff" : "#000000",
  minHeight: `${RESUME_HEIGHT}px`,
  // 纹理层用负层级绘制：宿主需要建立独立层叠上下文，纹理才压在底色之上、正文之下
  isolation: "isolate",
}));
// 测量树页尾沿用旧版单页长图文案格式。
const measureFooterText = computed(() => {
  const defaultFooter = getPreviewText("footer", previewLang.value, { page: 1, total: 1 });
  const customBrand = ui.value.page?.footer?.trim();
  if (!customBrand) return defaultFooter;
  return defaultFooter.replace(getPreviewText("brand", previewLang.value), customBrand);
});

// ---------- 分页（节点树 + 真实测量 + PagePlan）----------
const allModules = computed(() => {
  // 优先复用编辑器已展开的字段配置，模板缩略图等场景仍按持久化配置展开
  const fields =
    props.expandedFields !== undefined
      ? props.expandedFields
      : expandConfigModules(props.item.config?.modules || [], props.item.data);
  // 模块隐藏直接读数据节点，不经动态表单的 checks 协议
  return fields.filter((field) => props.item.data?.[field.key]?.ui?.hidden !== true);
});
const userHiddenFields = computed(() => {
  const hiddenFields = new Set();
  // 个人字段隐藏状态直接读数据节点，不经动态表单的 checks 协议
  const userUi = props.item.data?.user?.ui;
  const userField = allModules.value.find((field) => field.key === "user");
  const collectFields = (fields = []) => {
    fields.forEach((field) => {
      if (field.type === "group") collectFields(field.fields);
      // 字段标识统一由字段或包裹组件声明
      if (field.key && userUi?.[field.key]?.hidden === true) {
        hiddenFields.add(field.key);
      }
    });
  };
  collectFields(userField?.fields);
  return hiddenFields;
});
const userFieldOrder = computed(() => {
  const order = [];
  const userField = allModules.value.find((field) => field.key === "user");
  const collectFields = (fields = []) => {
    fields.forEach((field) => {
      if (field.type === "group") {
        collectFields(field.fields);
      } else if (field.key) {
        order.push(field.key);
      }
    });
  };
  collectFields(userField?.fields);
  return order;
});
const userFieldLabels = computed(() => {
  const labels = new Map();
  const userField = allModules.value.find((field) => field.key === "user");
  const collectFields = (fields = []) => {
    fields.forEach((field) => {
      if (field.type === "group") collectFields(field.fields);
      // 字段名称由字段或包裹组件声明
      const label = getFieldLabel(field);
      if (field.key && label) labels.set(field.key, label);
    });
  };
  collectFields(userField?.fields);
  return labels;
});
// 预览模块统一从上下文读取运行时数据。
provideResumePreviewContext({
  data: dataRef,
  lang: previewLang,
  ui,
  theme: themeStyles,
  userHiddenFields,
  userFieldOrder,
  userFieldLabels,
});
const {
  measureDone,
  pages,
  pagePlan,
  layout,
  nodeMap,
  moduleKeys,
  fullBleedTopRegionId,
  contentWidth,
  columnWidths,
  measureGroups,
} = useResumePages({
  measureRef: layoutMeasureRef,
  data: dataRef,
  ui,
  showPageNumber,
  isThumb,
  fontReadyVersion,
  allModules,
});
const layoutColumnGap = computed(() => layout.value.columnGap || 0);
const columnConfigMap = computed(
  () =>
    new Map(
      layout.value.regions.flatMap((region) => region.columns.map((column) => [column.id, column])),
    ),
);
// 栏宽由引擎解析后下发，渲染与测量使用同一份数值，避免两处各算一遍
const getColumnStyle = (columnId) => {
  const width = columnWidths.value.get(columnId);
  if (width === undefined) return { flex: "1 1 0%" };
  return { flex: `0 0 ${width}px`, width: `${width}px` };
};
const getColumnGap = (columnId) => columnConfigMap.value.get(columnId)?.gap || 0;
// 首页顶端通栏区域由布局和区域组件共同声明。
const pageTopRegionId = (page) => page.pageIndex === 0 ? fullBleedTopRegionId.value : null;
const getRegionTopGap = (page, regionId) => {
  const visibleRegions = page.regions.filter((region) =>
    region.columns.some((column) => column.fragments.length > 0),
  );
  const index = visibleRegions.findIndex((region) => region.regionId === regionId);
  if (index <= 0) return 0;
  const previousId = visibleRegions[index - 1].regionId;
  const previousRegion = layout.value.regions.find((region) => region.id === previousId);
  const currentRegion = layout.value.regions.find((region) => region.id === regionId);
  return resolveRegionGap(previousRegion, currentRegion, layout.value.regionGap);
};
// 首页标语占据纸张全宽，后续区域在自身外侧保留左右页边距。
const getRegionStyle = (page, regionId) => ({
  gap: `${layoutColumnGap.value}px`,
  marginTop: `${getRegionTopGap(page, regionId)}px`,
  ...(pageTopRegionId(page) && regionId !== pageTopRegionId(page)
    ? {
        width: "auto",
        marginLeft: `${pagePadding.value.left}px`,
        marginRight: `${pagePadding.value.right}px`,
      }
    : {}),
});

// 预览就绪：空简历直接展示提示页，其余以新引擎完成测量为准。
const previewMeasured = computed(() => isEmpty.value || measureDone.value);
const visiblePages = computed(() => (isThumb.value ? pages.value.slice(0, 1) : pages.value));

// 点击事件只向外报告模块信息，由编辑器模式决定是否定位字段。
const handlePageClick = (event) => {
  const moduleEl = event.target.closest?.(".resume-module-wrapper");
  const moduleKey = moduleEl?.dataset.module;
  // 派生信息点击后定位到其来源的个人信息模块。
  if (moduleKey) emit("module-click", { moduleKey: moduleKey === "userFacts" ? "user" : moduleKey });
};

const handleSubmoduleClick = ({ moduleKey, itemIndex }) => {
  emit("module-item-click", { moduleKey, itemIndex });
};
const handleModuleMouseEnter = (key) => emit("module-mouseenter", key);
const handleModuleMove = (payload, columnId) => emit("module-move", { ...payload, columnId });

// 新引擎测量容器元素回传，分页算法只通过 hook 读取该元素。
const setLayoutMeasureEl = (el) => (layoutMeasureRef.value = el);
// 长图导出使用带页面留白和页尾的测量树；空简历回退到提示页。
const imageExportRef = computed(() => (isEmpty.value ? rootRef.value : layoutMeasureRef.value));
// 向上暴露分页根节点与长图导出源，供上层（page.vue）注册导出功能读取。
defineExpose({
  rootEl: rootRef,
  measureEl: imageExportRef,
  pages,
  pagePlan,
  layout,
  moduleKeys,
  measureDone,
  previewMeasured,
});
</script>

<template>
  <div class="relative flex flex-col">
    <!-- 空简历使用提示页，保留标准页面尺寸与主题样式。 -->
    <div v-if="isEmpty" ref="rootRef" class="relative flex flex-col">
      <ResumePageShell
        :ui="ui"
        :styles="{ paddingStyle, fontStyle, lineHeightStyle }"
        :show-page-number="showPageNumber"
        :page-index="0"
        :page-count="1"
        :on-el="setSingleMeasure"
      >
        <div class="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div class="flex h-15 w-15 items-center justify-center rounded-full bg-sf-theme-2">
            <SfIcon icon="lucide:file-text" size="7" class="text-sf-theme" />
          </div>
          <div class="flex flex-col gap-3">
            <span class="text-lg font-black text-black">{{ $t("emptyResumeTitle") }}</span>
            <span class="text-sm text-sf-text-2">{{ $t("emptyResumeTip") }}</span>
          </div>
        </div>
      </ResumePageShell>
    </div>
    <!-- 隐藏测量树始终保留，确保内容变化后能重新测量并生成新的页面计划。 -->
    <template v-else>
      <!-- 测量树挂到 body：预览区整体带 transform: scale()，它会给 fixed 建立包含块，
           放在里面会导致测量结果被缩放，必须移出缩放区，尺寸才是固定布局像素 -->
      <Teleport to="body">
        <LayoutMeasureTree
          :groups="measureGroups"
          :top-region-id="fullBleedTopRegionId"
          :width="RESUME_WIDTH"
          :root-class="ui.font?.family"
          :root-style="measureTreeStyle"
          :page-padding="pagePadding"
          :page-border-width="pageBorderWidth"
          :show-page-number="showPageNumber"
          :footer-text="measureFooterText"
          :on-measure-el="setLayoutMeasureEl"
        />
      </Teleport>
      <div
        v-if="pagePlan.status === 'invalid'"
        class="flex min-h-30 flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center text-sm text-red-600"
      >
        <span class="font-bold">页面布局配置有误</span>
        <span v-for="warning in pagePlan.warnings" :key="warning.message">{{
          warning.message
        }}</span>
      </div>
      <!-- 实际渲染的分页内容，页面只消费 PagePlan 中的分片。 -->
      <div v-else ref="rootRef" class="relative flex flex-col gap-3">
        <ResumePageShell
          v-for="page in visiblePages"
          class="cursor-pointer"
          :key="page.pageIndex"
          :ui="ui"
          :styles="{ paddingStyle, fontStyle, lineHeightStyle }"
          :show-page-number="showPageNumber"
          :page-index="page.pageIndex"
          :page-count="visiblePages.length"
          :has-top-region="Boolean(pageTopRegionId(page))"
          @click="handlePageClick"
          :class="[
            {
              // 用 outline 绘制编辑器页边线：不占内容盒，保证测量宽度与真实渲染一致
              'outline outline-1 -outline-offset-1 outline-sf-b': mode === 'editor',
            },
          ]"
        >
          <!-- 正文区域铺满页面剩余高度，两栏因此都能拿到完整高度 -->
          <div class="flex min-h-0 min-w-0 flex-1 flex-col">
            <template v-for="region in page.regions" :key="region.regionId">
              <RegionContainer
                v-if="region.columns.some((column) => column.fragments.length > 0)"
                :region-id="region.regionId"
                class="flex w-full min-w-0"
                :style="getRegionStyle(page, region.regionId)"
              >
                <!-- 栏自身作为定位基准，主题的背景层用绝对定位铺满栏内 -->
                <div
                  v-for="(column, columnIndex) in region.columns"
                  :key="column.columnId"
                  class="relative min-w-0"
                  :style="getColumnStyle(column.columnId)"
                >
                  <Column
                    :column="column"
                    :page-index="page.pageIndex"
                    :nodes="nodeMap"
                    :is-edit="isEdit"
                    :show-debug="showLayoutDebug"
                    :module-class-map="props.moduleClassMap"
                    :selected-module-keys="props.selectedModuleKeys"
                    :gap="getColumnGap(column.columnId)"
                    :move-directions="props.moveDirectionsByColumn[column.columnId]"
                    :can-move-left="columnIndex > 0"
                    :can-move-right="columnIndex < region.columns.length - 1"
                    @mouseenter="handleModuleMouseEnter"
                    @click="handleSubmoduleClick"
                    @select="emit('module-select', $event)"
                    @move="(payload) => handleModuleMove(payload, column.columnId)"
                  />
                </div>
              </RegionContainer>
            </template>
          </div>
        </ResumePageShell>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
