<script setup>
import { computed, inject } from "vue";
import DOMPurify from "dompurify";

const props = defineProps({
  // 纯文本内容
  content: {
    type: String,
    default: "",
  },
  // 是否按富文本渲染
  html: {
    type: Boolean,
    default: false,
  },
});

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 仅保留简历预览所需标签和安全链接协议
const sanitizeConfig = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "span"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
};

// 将 HTML 按块拆分，便于分页逻辑细粒度处理
const splitHtml = (html) => {
  if (!html) return [];
  const template = document.createElement("template");
  template.innerHTML = html;
  return Array.from(template.content.childNodes)
    .map((node) => {
      if (node.nodeType === 3 && node.textContent.trim()) {
        return { tag: "span", attrs: {}, html: node.textContent };
      }
      if (node.nodeType !== 1) return null;
      return {
        tag: node.tagName.toLowerCase(),
        attrs: Object.fromEntries(
          Array.from(node.attributes).map(({ name, value }) => [name, value]),
        ),
        html: node.innerHTML,
      };
    })
    .filter((block) => block && block.html.trim());
};

const blocks = computed(() =>
  props.html ? splitHtml(DOMPurify.sanitize(props.content, sanitizeConfig)) : [],
);
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
