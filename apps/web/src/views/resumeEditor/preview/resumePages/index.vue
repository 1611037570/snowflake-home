<script setup>
// 简历分页渲染可复用组件：接收 resumeItem（data/config/fixedConfig/ui），渲染分页后的简历页面
// 数据源由 props 传入，不依赖 resume store；供编辑器预览、模板缩略图、全屏查看复用
import { computed, provide, ref } from "vue";
import MeasureContent from "../components/measureContent.vue";
import ResumeModule from "../modules/index.vue";
import { RESUME_WIDTH } from "../constants";
import { usePreviewData } from "../usePreviewData";
import { useResumePages } from "./useResumePages";
import { useResumeTheme } from "./useResumeTheme";
import { useResumeStore } from "@/stores";
const resumeStore = useResumeStore();
const { selectedModule } = storeToRefs(resumeStore);

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

// 实例唯一前缀，避免多实例分页裁剪样式互相干扰
const uid = `rp-${Math.random().toString(36).slice(2, 8)}`;

// ---------- 数据代理（复用 usePreviewData）----------
const dataRef = computed(() => props.item.data);
const { previewData } = usePreviewData(dataRef);
provide("previewData", previewData);

// ---------- 主题样式注入（数据源为 item.ui）----------
const ui = computed(() => props.item.ui || {});
const themeStyles = useResumeTheme(ui);
const { paddingValue, fontValue, lineHeightValue } = themeStyles;

// ---------- 分页（测量 + 分页算法 + 裁剪样式）----------
const measureRef = ref(null);
const allModules = computed(() => {
  const fixedModules = props.item.fixedConfig?.fields || [];
  const configModules = props.item.config?.fields || [];
  return [...fixedModules, ...configModules];
});
const { measureDone, pages, moduleClass, getPageStyle } = useResumePages({
  measureRef,
  allModules,
  ui,
  themeStyles,
  isThumb,
  selectedModule: selectedModule.value,
  isReadonly,
  uid,
});
</script>

<template>
  <div class="relative flex flex-col">
    <!-- 隐藏的测量容器：用于 useRowInfo 读取行高；缩略图测量完成后销毁 -->
    <MeasureContent
      v-if="!measureDone"
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
            class="resume-module-wrapper group group/module relative rounded-xl"
            :class="moduleClass(slice)"
            :data-module="slice.moduleKey"
          >
            <!-- 编辑态操作按钮插槽（编辑器预览传入 ModuleActions） -->
            <slot v-if="!isReadonly" name="moduleActions" :slice="slice" />
            <ResumeModule :data="props.item.data" :name="slice.moduleKey" />
          </div>
        </div>
        <div class="py-3 text-center text-xs opacity-50">
          轻舟简历 · 第 {{ pageIndex + 1 }} 页 · 共 {{ pages.length }} 页
        </div>

        <component :is="'style'">{{ getPageStyle(pageSlices, pageIndex) }}</component>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
