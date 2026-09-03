<script setup>
// 单页快路径组件：内容放入一页时测量与渲染合一，不再常驻隐藏测量容器与分页裁剪
// 由 ResumePages 在 isSinglePage 时挂载；根元素通过回调上报，供测量（useRowInfo）与导出复用
import { useTemplateRef, watch } from "vue";
import ResumeModule from "../modules/index.vue";
import { PAGE_NUMBER_HEIGHT, RESUME_CONTAINER_HEIGHT, RESUME_CONTAINER_WIDTH } from "../constants";

defineOptions({ name: "PreviewSinglePage" });

const props = defineProps({
  // 简历数据：{ data, ... }，供 ResumeModule 透传
  item: {
    type: Object,
    required: true,
  },
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
const measureEl = useTemplateRef("measureRef");
// ref 就绪后回传父级（measureRef 供 useRowInfo 测量、rootRef 供导出限定范围）
watch(
  [rootEl, measureEl],
  ([r, m]) => {
    props.onRootEl?.(r || null);
    props.onMeasureEl?.(m || null);
  },
  { immediate: true },
);
</script>

<template>
  <div ref="rootRef" class="relative flex flex-col gap-3">
    <div
      ref="measureRef"
      class="resume-page-item relative flex flex-col rounded-3xl bg-white text-black"
      :class="[ui.fontFamily]"
      :style="[
        styles.paddingStyle,
        styles.fontStyle,
        styles.lineHeightStyle,
        RESUME_CONTAINER_WIDTH,
        RESUME_CONTAINER_HEIGHT,
      ]"
    >
      <!-- 模块之间的间距由 ui.moduleSpacing 控制，与分页计算保持一致 -->
      <div class="flex flex-1 flex-col" :style="{ gap: `${ui.moduleSpacing}px` }">
        <div
          v-for="item in allModules"
          :key="item.key"
          class="group group/module relative rounded-xl"
        >
          <!-- 测量包装与测量容器一致：resume-module-wrapper 直接挂在模块根元素上 -->
          <ResumeModule :data="props.item.data" :name="item.key" class="resume-module-wrapper" />
        </div>
      </div>
      <div
        v-if="showPageNumber"
        class="flex-c py-3 text-xs opacity-50"
        :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
      >
        轻舟简历 · 第 1 页 · 共 1 页
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
