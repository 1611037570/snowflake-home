<script setup>
import { inject } from "vue";

const props = defineProps({
  // 纯文本内容
  content: {
    type: String,
    default: "",
  },
  // 富文本块数组
  blocks: {
    type: Array,
    default: () => [],
  },
  // 是否按富文本渲染
  html: {
    type: Boolean,
    default: false,
  },
});

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
</script>

<template>
  <template v-if="html">
    <component
      v-for="(block, idx) in blocks"
      :key="idx"
      :is="block.tag"
      v-bind="block.attrs"
      class="break-words whitespace-pre-wrap"
      :style="[fontValue(), lineHeightValue()]"
      :innerHTML="block.html"
    ></component>
  </template>
  <template v-else>{{ content }}</template>
</template>
