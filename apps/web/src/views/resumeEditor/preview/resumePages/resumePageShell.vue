<script setup>
// 简历页面外壳：页面容器样式 + 页码页脚，多页渲染与缩略图单页共用
// 仅排版展示，不感知分页/测量逻辑；根元素回传供缩略图测量与导出使用
import { provide, useTemplateRef, watch } from "vue";
import {
  PAGE_NUMBER_HEIGHT,
  RESUME_CONTAINER_HEIGHT,
  RESUME_CONTAINER_WIDTH,
} from "../constants";

const props = defineProps({
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
  // 当前页码（页脚文案）
  pageIndex: {
    type: Number,
    default: 0,
  },
  // 总页数（页脚文案）
  pageCount: {
    type: Number,
    default: 1,
  },
  // 根元素回传回调（缩略图测量 / 图片导出需要）
  onEl: Function,
  // diff 参与级别：none 原值无交互；full 渲染草稿+高亮+悬浮交互，仅编辑态实际分页内容传入
  diffMode: {
    type: String,
    default: "none",
  },
});

// 向子树覆盖注入 diff 档位：实际分页内容提为 full，测量容器与缩略图沿用根级档位
provide("diffMode", props.diffMode);

const rootEl = useTemplateRef("rootRef");
// ref 就绪或变化后回传根元素
watch(
  rootEl,
  (el) => {
    props.onEl?.(el || null);
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="rootRef"
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
      <slot />
    </div>
    <!-- 页码区固定不伸缩：内容超高时只触发分页，不压缩页脚，保证页码位置恒定 -->
    <div
      v-if="showPageNumber"
      class="flex-c shrink-0 py-3 text-xs opacity-50"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      轻舟简历 · 第 {{ pageIndex + 1 }} 页 · 共 {{ pageCount }} 页
    </div>
  </div>
</template>

<style lang="scss" scoped></style>