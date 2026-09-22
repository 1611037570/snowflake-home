<script setup>
// 简历分页渲染可复用组件：接收 resumeItem（data/config/ui），渲染分页后的简历页面
// 数据源由 props 传入，不依赖 resume store；供编辑器预览、模板缩略图、全屏查看复用
// 本组件只做渲染编排（数据注入/主题注入/测量分页），导出、智能一页等编辑功能由上层 page.vue 注册
import { computed, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import {
  createDataPathContext,
  getFieldLabel,
  isFieldHidden,
} from "@/components/business/dynamicForm/api";
import { expandConfigFields } from "@/stores/modules/resume/hooks/useConfigTemplate";
import ResumePageShell from "./resumePageShell.vue";
import LayoutMeasureTree from "./engine/measure/layoutMeasureTree.vue";
import LayoutColumn from "./engine/render/layoutColumn.vue";
import { useResumePages } from "./useResumePages";
import { useResumeTheme } from "./useResumeTheme";
import { provideResumePreviewContext } from "../previewContext";
import { useResumeStore } from "@/stores";
import { useModuleInteractions } from "./useModuleInteractions";
import { isEmptyResume } from "../../toolbar/modules/progress/useResumeStats";
import { clearPreviewSelection, locateEditor, previewSelectedModule } from "../../useModuleNav";

const resumeStore = useResumeStore();
const { selectedModule, system } = storeToRefs(resumeStore);
defineOptions({ name: "ResumePages" });

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
});

// 缩略图模式：仅渲染第一页，测量完成后冻结行数据
const isThumb = computed(() => props.mode === "thumb");
// 编辑态标记：直接以 mode 判断编辑场景，仅编辑态开放模块选择交互
const isEdit = computed(() => props.mode === "editor");

// 根元素 ref：导出时限定为当前实例的分页元素，避免误选其他 ResumePages 实例的页面
const rootRef = ref(null);
const layoutMeasureRef = ref(null);

// ---------- 数据注入（始终基于 props 传入的数据，多实例互不干扰）----------
const dataRef = computed(() => props.item.data);
// 轻量判空：命中第一处正文文本即结束，避免为判空执行全量字数统计
const isEmpty = computed(() => isEmptyResume(dataRef.value));

// ---------- 主题样式注入（数据源为 item.ui）----------
const ui = computed(() => props.item.ui || {});
// 简历展示语言：供预览标题语言包使用
const previewLang = computed(() => ui.value.language || "zh");
const showPageNumber = computed(() => system.value.showPageNumber);
const themeStyles = useResumeTheme(ui);
const { paddingStyle, fontStyle, lineHeightStyle, fontReadyVersion } = themeStyles;

// ---------- 分页（节点树 + 真实测量 + PagePlan）----------
const allModules = computed(() => {
  // 优先复用编辑器已展开的字段配置，模板缩略图等场景仍按持久化配置展开
  const fields =
    props.expandedFields !== undefined
      ? props.expandedFields
      : expandConfigFields(props.item.config?.fields || [], props.item.data);
  return fields.filter((field) => !isFieldHidden(props.item.data, field));
});
const userHiddenFields = computed(() => {
  const hiddenFields = new Set();
  const userField = allModules.value.find((field) => field.key === "user");
  // 个人字段继承 user 分组上下文解析相对显隐路径
  const userContext = userField?.context?.length
    ? createDataPathContext(userField.context)
    : undefined;
  const collectFields = (fields = []) => {
    fields.forEach((field) => {
      if (field.type === "group") collectFields(field.fields);
      // 字段标识统一由字段或包裹组件声明
      if (field.key && field.checks?.hidden && isFieldHidden(props.item.data, field, userContext)) {
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
const { measureDone, pages, pagePlan, layout, nodeMap, moduleKeys, contentWidth, measureGroups } = useResumePages({
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
  () => new Map(layout.value.regions.flatMap((region) => region.columns.map((column) => [column.id, column]))),
);
const getColumnStyle = (columnId) => {
  const column = columnConfigMap.value.get(columnId);
  if (!column) return { flex: "1 1 0%" };
  if (column.width.mode === "fixed") {
    return { flex: `0 0 ${column.width.value}px`, width: `${column.width.value}px` };
  }
  return { flex: `${column.width.value} ${column.width.value} 0%` };
};
const getColumnGap = (columnId) => columnConfigMap.value.get(columnId)?.gap || 0;
// 预览就绪：空简历直接展示提示页，其余以新引擎完成测量为准。
const previewMeasured = computed(() => isEmpty.value || measureDone.value);
const visiblePages = computed(() => (isThumb.value ? pages.value.slice(0, 1) : pages.value));
// 测量会随内容变化持续触发，静默一段时间后才认定为渲染完成
const SETTLE_DELAY = 200;
const settlePreviewSync = useDebounceFn(() => {
  if (previewMeasured.value) resumeStore.setPreviewSyncing(false);
}, SETTLE_DELAY);
// 预览加载状态交由外壳统一展示，仅编辑态实例上报，避免缩略图/全屏实例覆盖
watch(
  [previewMeasured, measureDone],
  () => {
    if (!isEdit.value) return;
    if (!previewMeasured.value) {
      resumeStore.setPreviewSyncing(true);
      return;
    }
    settlePreviewSync();
  },
  { immediate: true },
);

// ---------- 编辑态模块交互（选中高亮）----------
const { moduleClassMap } = useModuleInteractions({
  isEdit,
  moduleKeys,
  selectedModule,
  activeModuleKey: previewSelectedModule,
});

// 点击预览模块时定位左侧编辑模块，可在系统设置中关闭
const handlePageClick = (event) => {
  if (!system.value.previewClickLocate) return;
  const moduleEl = event.target.closest?.(".resume-module-wrapper");
  const moduleKey = moduleEl?.dataset.module;
  if (moduleKey) locateEditor(moduleKey);
};

// 鼠标进入模块内容时清除查找定位边框
const handleModuleMouseEnter = (key) => {
  clearPreviewSelection(key);
};

// 新引擎测量容器元素回传，分页算法只通过 hook 读取该元素。
const setLayoutMeasureEl = (el) => (layoutMeasureRef.value = el);
// 向上暴露导出范围与测量结果，供上层（page.vue）注册的导出/智能一页功能读取
defineExpose({ rootEl: rootRef, measureEl: rootRef, pages, pagePlan });
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
            <span class="text-lg font-black text-black">当前还没有数据</span>
            <span class="text-sm text-sf-text-2">尝试输入一点内容吧</span>
          </div>
        </div>
      </ResumePageShell>
    </div>
    <!-- 隐藏测量树始终保留，确保内容变化后能重新测量并生成新的页面计划。 -->
    <template v-else>
      <LayoutMeasureTree
        :groups="measureGroups"
        :width="contentWidth"
        :root-class="ui.fontFamily"
        :root-style="{ fontSize: fontStyle.fontSize, lineHeight: lineHeightStyle.lineHeight }"
        :on-measure-el="setLayoutMeasureEl"
      />
      <div
        v-if="pagePlan.status === 'invalid'"
        class="flex min-h-30 flex-col items-center justify-center gap-3 rounded-3xl bg-white p-6 text-center text-sm text-red-600"
      >
        <span class="font-bold">页面布局配置有误</span>
        <span v-for="warning in pagePlan.warnings" :key="warning.message">{{ warning.message }}</span>
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
          @click="handlePageClick"
          :class="[
            {
              'border border-sf-b': mode === 'editor',
            },
          ]"
        >
          <div class="flex min-w-0 flex-col" :style="{ gap: `${layout.regionGap}px` }">
            <template v-for="region in page.regions" :key="region.regionId">
              <div
                v-if="region.columns.some((column) => column.fragments.length > 0)"
                class="flex min-w-0 w-full"
                :style="{ gap: `${layoutColumnGap}px` }"
              >
                <div
                  v-for="column in region.columns"
                  :key="column.columnId"
                  class="min-w-0"
                  :style="getColumnStyle(column.columnId)"
                >
                  <LayoutColumn
                    :column="column"
                    :nodes="nodeMap"
                    :is-edit="isEdit"
                    :module-class-map="moduleClassMap"
                    :gap="getColumnGap(column.columnId)"
                    @mouseenter="handleModuleMouseEnter"
                  />
                </div>
              </div>
            </template>
          </div>
        </ResumePageShell>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
