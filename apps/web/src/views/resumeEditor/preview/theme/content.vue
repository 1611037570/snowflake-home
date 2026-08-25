<script setup>
import { computed, inject } from "vue";

const props = defineProps({
  content: {
    type: String,
    default: "",
  },
});

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const themeColor = inject("themeColor");
// 在 setup 中获取注入的引用（inject 不可在 computed getter 内调用），再取响应式值
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");

// 内容块样式：不同风格模板差异化渲染
const blockClass = computed(() => {
  switch (themeTemplate.value) {
    case "modern":
      return "border-l-2 pl-2";
    case "simple":
      return "rounded-md bg-sf-bg px-3 py-1";
    default:
      return "";
  }
});
const blockStyle = computed(() => {
  if (themeTemplate.value === "modern") {
    return { borderColor: themeColor };
  }
  return {};
});

const hasContent = computed(() => {
  if (!props.content) {
    return false;
  }
  if (props.content == "<p><br></p>") {
    return false;
  }
  return true;
});

// 将内容按块拆分，以便分页逻辑可以更细粒度地处理
const splitBlocks = computed(() => {
  if (!props.content) return [];
  const template = document.createElement("template");
  template.innerHTML = props.content;
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
      class="whitespace-pre-wrap"
      :class="blockClass"
      :style="[fontValue(-3), lineHeightValue(-3), blockStyle]"
      :innerHTML="block.html"
    ></component>
  </template>
</template>

<style lang="scss" scoped></style>
