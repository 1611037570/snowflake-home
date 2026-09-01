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
  // 是否展示内容字数统计
  showCount: {
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

// 可见文本字数：富文本剥离标签后按渲染文本计数
const charCount = computed(() => {
  if (!props.html) return props.content.length;
  const tmp = document.createElement("div");
  tmp.innerHTML = blocks.value.map((b) => b.html).join("");
  return tmp.textContent?.length || 0;
});
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
  <template v-else>
    <span :style="[fontValue(), lineHeightValue()]">{{ content }}</span>
  </template>
  <!-- 字数统计：由使用方通过 showCount 控制展示 -->
  <div v-if="showCount" class="mt-1 w-full text-right text-xs">共 {{ charCount }} 字</div>
</template>
