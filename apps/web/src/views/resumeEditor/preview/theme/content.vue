<script setup>
import { computed, inject } from "vue";
import DOMPurify from "dompurify";

const props = defineProps({
  content: {
    type: String,
    default: "",
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

const sanitizedContent = computed(() => DOMPurify.sanitize(props.content, sanitizeConfig));

const hasContent = computed(() => {
  if (!sanitizedContent.value) {
    return false;
  }
  if (sanitizedContent.value == "<p><br></p>") {
    return false;
  }
  return true;
});

// 将内容按块拆分，以便分页逻辑可以更细粒度地处理
const splitBlocks = computed(() => {
  if (!sanitizedContent.value) return [];
  const template = document.createElement("template");
  template.innerHTML = sanitizedContent.value;
  return Array.from(template.content.childNodes)
    .map((node) => {
      if (node.nodeType === 3 && node.textContent.trim()) {
        return {
          tag: "span",
          attrs: {},
          html: node.textContent,
        };
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
});
</script>

<template>
  <template v-if="hasContent">
    <div class="mt-1 w-full"></div>
    <component
      v-for="(block, idx) in splitBlocks"
      :key="idx"
      :is="block.tag"
      v-bind="block.attrs"
      class="break-words whitespace-pre-wrap"
      :style="[fontValue(), lineHeightValue()]"
      :innerHTML="block.html"
    ></component>
  </template>
</template>

<style lang="scss" scoped></style>
