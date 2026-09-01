<script setup>
import { computed, inject, ref } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import DOMPurify from "dompurify";

// 富文本字段代理对象：value 为原始 HTML，newValue 为 AI 草稿 HTML
const props = defineProps({
  content: {
    type: Object,
    default: () => ({ value: "", newValue: "" }),
  },
});

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 字段代理兜底，避免 content 未传入时取值报错
const field = computed(() => props.content || { value: "", newValue: "" });
const valueHtml = computed(() => field.value.value ?? "");
const newValueHtml = computed(() => field.value.newValue ?? "");

// 悬停显示旧值，用于对比
const isHovered = ref(false);
const { start: startHideTimer, stop: stopHideTimer } = useTimeoutFn(
  () => {
    isHovered.value = false;
  },
  200,
  { immediate: false },
);

// 仅保留简历预览所需标签和安全链接协议
const sanitizeConfig = {
  ALLOWED_TAGS: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "span"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
};

// 将内容按块拆分，以便分页逻辑可以更细粒度地处理
const splitHtml = (html) => {
  if (!html) return [];
  const template = document.createElement("template");
  template.innerHTML = html;
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
};

// 新增与删除内容分别净化并拆分，悬停时上下对比展示
const newSanitized = computed(() => DOMPurify.sanitize(newValueHtml.value, sanitizeConfig));
const valueSanitized = computed(() => DOMPurify.sanitize(valueHtml.value, sanitizeConfig));
const newBlocks = computed(() => splitHtml(newSanitized.value));
const valueBlocks = computed(() => splitHtml(valueSanitized.value));

const isHtmlContent = (html) => !!html && html !== "<p><br></p>";
const hasContent = computed(
  () => isHtmlContent(newSanitized.value) || isHtmlContent(valueSanitized.value),
);

// 保留修改：将草稿写入原值，字段代理的 value setter 会自动清空草稿
const handleSave = () => {
  if (props.content) {
    props.content.value = newValueHtml.value;
  }
  stopHideTimer();
  isHovered.value = false;
};

// 放弃修改：清空草稿
const handleCancel = () => {
  if (props.content) {
    props.content.newValue = "";
  }
  stopHideTimer();
  isHovered.value = false;
};

const handleMouseEnter = () => {
  stopHideTimer();
  if (valueHtml.value && newValueHtml.value) {
    isHovered.value = true;
  }
};

const handleMouseLeave = () => {
  if (valueHtml.value) {
    startHideTimer();
  }
};
</script>

<template>
  <div
    v-if="hasContent"
    class="relative min-w-0 max-w-full"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="mt-1 w-full"></div>
    <!-- 保留 / 放弃 悬浮操作 -->
    <div
      v-show="isHovered"
      class="absolute bottom-full left-0 z-10 mb-1 flex h-7 items-center gap-x-2"
    >
      <div
        class="flex-c h-full w-[45px] cursor-pointer rounded border-none bg-[#2e7d32] px-1.5 text-[11px] text-white"
        @click.stop="handleSave"
      >
        保留
      </div>
      <div
        class="flex-c h-full w-[45px] cursor-pointer rounded border-none bg-[#999] px-1.5 text-[11px] text-white"
        @click.stop="handleCancel"
      >
        放弃
      </div>
    </div>
    <div v-if="!newValueHtml" class="w-full rounded-xl">
      <component
        v-for="(block, idx) in valueBlocks"
        :key="idx"
        :is="block.tag"
        v-bind="block.attrs"
        class="break-words whitespace-pre-wrap"
        :style="[fontValue(), lineHeightValue()]"
        :innerHTML="block.html"
      ></component>
    </div>
    <div
      v-else-if="!isHovered"
      class="w-full cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]"
    >
      <component
        v-for="(block, idx) in newBlocks"
        :key="idx"
        :is="block.tag"
        v-bind="block.attrs"
        class="break-words whitespace-pre-wrap"
        :style="[fontValue(), lineHeightValue()]"
        :innerHTML="block.html"
      ></component>
    </div>
    <div v-else class="w-full rounded-xl">
      <div class="bg-[#e8f5e9] text-[#2e7d32]">
        <component
          v-for="(block, idx) in newBlocks"
          :key="idx"
          :is="block.tag"
          v-bind="block.attrs"
          class="break-words whitespace-pre-wrap"
          :style="[fontValue(), lineHeightValue()]"
          :innerHTML="block.html"
        ></component>
      </div>
      <div class="bg-[#fef0f0] text-[#d32f2f] line-through">
        <component
          v-for="(block, idx) in valueBlocks"
          :key="idx"
          :is="block.tag"
          v-bind="block.attrs"
          class="break-words whitespace-pre-wrap"
          :style="[fontValue(), lineHeightValue()]"
          :innerHTML="block.html"
        ></component>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
