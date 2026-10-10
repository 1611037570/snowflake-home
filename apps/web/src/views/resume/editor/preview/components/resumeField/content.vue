<script setup lang="ts">
import { computed, useAttrs, type PropType } from "vue";
import { useResumePreviewContext } from "../../shared/previewContext";
import { parseRichText, type RichTextBlock } from "../../resumePages/engine/adapter/richTextParser";

// 透传属性已在组件内部逐块合并，关闭自动继承，避免多根节点无法继承导致 class 被丢弃并告警
defineOptions({ inheritAttrs: false });

// 上层透传（class 高亮与悬浮监听），与各块原始属性合并渲染
const attrs = useAttrs();

const props = defineProps({
  // 文本内容
  content: {
    type: String,
    default: "",
  },
  // 引擎已清洗并解析的正文块，避免分页渲染重复处理
  blocks: {
    type: Array as PropType<RichTextBlock[]>,
    default: undefined,
  },
  // 是否按富文本渲染
  html: {
    type: Boolean,
    default: false,
  },
});

// 行高随各字段实际字号自动缩放；字号由外层包装继承，避免强制基础字号覆盖 name 等字段的加大字号
// 行高样式继承自预览容器；外部未注入时回退空样式，避免渲染抛错
const {
  theme: { lineHeightValue, textAlign },
} = useResumePreviewContext();
// 文本对齐：仅两端对齐时覆盖富文本块的默认排版，纯文本字段不受影响
const textAlignStyle = computed(() =>
  textAlign?.value === "justify" ? { textAlign: "justify" } : {},
);

// 原始正文统一解析；引擎切片直接消费已有块结构。
const blocks = computed(() => props.blocks ?? (props.html
  ? parseRichText(props.content).blocks.filter((block) => block.html.trim())
  : []));
// 合并透传属性与块原始属性，class/监听一并落到每个块上。
const mergeAttrs = (blockAttrs: Record<string, string>) => ({ ...blockAttrs, ...attrs });
</script>

<template>
  <template v-if="html">
    <component
      v-for="(block, idx) in blocks"
      :key="idx"
      :is="block.tag"
      v-bind="mergeAttrs(block.attrs)"
      class="break-words whitespace-pre-wrap"
      :style="[lineHeightValue(), textAlignStyle]"
      :innerHTML="block.html"
    ></component>
  </template>
  <template v-else>
    <!-- 标记纯文本字段，供导出按预览行数保留换行行为。 -->
    <span data-resume-plain-text :style="[lineHeightValue()]" v-bind="$attrs">{{ content }}</span>
  </template>
</template>
