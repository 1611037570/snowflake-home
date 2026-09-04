<script setup>
// 单页快路径组件：内容放入一页时测量与渲染合一，不再常驻隐藏测量容器与分页裁剪
// 由 ResumePages 在 thumb 模式挂载；根元素通过回调上报，供测量（useRowInfo）与导出复用
import { useTemplateRef, watch } from "vue";
import ResumeModule from "../modules/index.vue";
import ResumePageShell from "./resumePageShell.vue";

defineOptions({ name: "PreviewSinglePage" });

const props = defineProps({
  // 期望渲染的模块列表（fixed + config）
  allModules: {
    type: Array,
    required: true,
  },
  // 简历 ui（fontFamily / moduleSpacing）
  ui: {
    type: Object,
    default: () => ({}),
  },
  // 主题样式对象：{ paddingStyle, fontStyle, lineHeightStyle }
  styles: {
    type: Object,
    required: true,
  },
  // 是否渲染页码区
  showPageNumber: {
    type: Boolean,
    default: false,
  },
  // 根元素回传：外层包裹（限导出范围）
  onRootEl: Function,
  // 根元素回传：测量页面容器（测量 / 图片导出）
  onMeasureEl: Function,
});

const rootEl = useTemplateRef("rootRef");
// ref 就绪后回传外层根元素（供导出限定范围）
watch(
  rootEl,
  (el) => {
    props.onRootEl?.(el || null);
  },
  { immediate: true },
);
// 页面容器（测量 / 图片导出）由 ResumePageShell 回传
const setMeasureEl = (el) => {
  props.onMeasureEl?.(el || null);
};
</script>

<template>
  <div ref="rootRef" class="relative flex flex-col gap-3">
    <ResumePageShell
      :ui="ui"
      :styles="styles"
      :show-page-number="showPageNumber"
      :page-index="0"
      :page-count="1"
      :on-el="setMeasureEl"
    >
      <div
        v-for="item in allModules"
        :key="item.key"
        class="group group/module relative rounded-xl"
      >
        <!-- 测量包装与测量容器一致：resume-module-wrapper 直接挂在模块根元素上 -->
        <ResumeModule :name="item.key" class="resume-module-wrapper" />
      </div>
    </ResumePageShell>
  </div>
</template>

<style lang="scss" scoped></style>
