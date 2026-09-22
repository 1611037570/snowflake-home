<script setup>
// 隐藏测量容器：为 useRowInfo 提供未被分页裁剪的行高来源
// 编辑态数据源取编辑停顿后刷新的内容快照，打字期间引用不变，避免测量树反复重渲染并触发重新测量
import { computed, useTemplateRef, watch } from "vue";
import { useResumeStore } from "@/stores";
import MeasureContent from "../components/measureContent.vue";
import { PAGE_NUMBER_HEIGHT, RESUME_CONTAINER_WIDTH, RESUME_HEIGHT } from "../constants";
import { provideResumePreviewContext, useResumePreviewContext } from "../previewContext";

defineOptions({ name: "ResumeMeasureTree" });

const props = defineProps({
  // 期望渲染的模块列表（fixed + config）
  allModules: {
    type: Array,
    required: true,
  },
  // 简历 ui（fontFamily）
  ui: {
    type: Object,
    default: () => ({}),
  },
  // 页面内容内边距样式
  paddingStyle: {
    type: Object,
    default: () => ({}),
  },
  // 是否渲染页码区
  showPageNumber: {
    type: Boolean,
    default: false,
  },
  // 页码区展示的品牌文案
  brandText: {
    type: String,
    default: "",
  },
  // 编辑态标记：补透明边框，保证测量宽度与真实排版一致
  isEdit: {
    type: Boolean,
    default: false,
  },
  // 容器元素回传（供测量逻辑读取行高）
  onMeasureEl: Function,
});

const resumeStore = useResumeStore();
// 上层注入的实时数据，作为只读场景与快照未就绪时的数据源
const previewContext = useResumePreviewContext();
const liveData = previewContext.data;

// 测量树数据源：编辑态用编辑停顿后刷新的内容快照，其余场景数据静态直接用实时数据
const previewData = computed(() =>
  props.isEdit ? resumeStore.contentSnapshot || liveData.value : liveData.value,
);
// 测量树仅替换数据快照，其余主题与字段配置继续复用当前预览上下文。
provideResumePreviewContext({ ...previewContext, data: previewData });

const measureEl = useTemplateRef("measureRef");
// 容器就绪后回传元素，供测量逻辑读取行高
watch(
  measureEl,
  (el) => {
    props.onMeasureEl?.(el || null);
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="measureRef"
    class="fixed -top-999 -left-999 flex h-auto flex-col bg-white text-black"
    :class="[ui.fontFamily, { 'border border-transparent': isEdit }]"
    :style="[paddingStyle, RESUME_CONTAINER_WIDTH, { minHeight: `${RESUME_HEIGHT}px` }]"
  >
    <MeasureContent :all-modules="allModules" />
    <div
      v-if="showPageNumber"
      class="flex flex-1 items-end justify-center py-3 text-xs opacity-50"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      {{ brandText }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
