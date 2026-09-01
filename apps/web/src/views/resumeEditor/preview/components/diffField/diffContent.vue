<script setup>
import { inject } from "vue";

const props = defineProps({
  // 纯文本内容
  content: {
    type: String,
    default: "",
  },
  // 富文本块数组，非空时按富文本渲染
  blocks: {
    type: Array,
    default: () => [],
  },
});

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
</script>

<template>
  <template v-if="blocks.length">
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
