<script setup>
import { computed, inject, ref } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import DOMPurify from "dompurify";
import DiffContent from "./diffContent.vue";

// 字段代理对象：v-model 绑定，包含 value 与 newValue
const model = defineModel();

const props = defineProps({
  // value 显示覆盖，用于时间等格式化场景
  displayValue: {
    type: String,
    default: "",
  },
  // 是否按富文本 HTML 渲染
  html: {
    type: Boolean,
    default: false,
  },
});

// 字段代理兜底，避免未传入时取值报错
const field = computed(() => model.value || { value: "", newValue: "" });
const valueContent = computed(() => {
  if (
    props.displayValue !== "" &&
    props.displayValue !== undefined &&
    props.displayValue !== null
  ) {
    return props.displayValue;
  }
  return field.value.value ?? "";
});
const newValueContent = computed(() => field.value.newValue ?? "");

// 悬停状态与悬浮方向
const isHovered = ref(false);
const dropdownDirection = ref("up");
const rootRef = ref(null);
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

// 新增与删除内容分别净化并拆分
const newSanitized = computed(() =>
  props.html ? DOMPurify.sanitize(newValueContent.value, sanitizeConfig) : newValueContent.value,
);
const valueSanitized = computed(() =>
  props.html ? DOMPurify.sanitize(valueContent.value, sanitizeConfig) : valueContent.value,
);
const newBlocks = computed(() => (props.html ? splitHtml(newSanitized.value) : []));
const valueBlocks = computed(() => (props.html ? splitHtml(valueSanitized.value) : []));

// 文档流统一渲染：有草稿显示新增，否则显示原值
const documentContent = computed(() => newValueContent.value || valueContent.value);
const documentClass = computed(() =>
  newValueContent.value ? "cursor-pointer rounded-xl bg-[#e8f5e9] text-[#2e7d32]" : "",
);
const documentBlocks = computed(() => {
  if (!props.html) return [];
  return newValueContent.value ? newBlocks.value : valueBlocks.value;
});

const isHtmlContent = (html) => !!html && html !== "<p><br></p>";
const hasContent = computed(() => {
  if (props.html) {
    return isHtmlContent(newSanitized.value) || isHtmlContent(valueSanitized.value);
  }
  return !!(newValueContent.value || valueContent.value);
});

// 保留修改：将草稿写入原值，字段代理的 value setter 会自动清空草稿
const handleSave = () => {
  field.value.value = newValueContent.value;
  stopHideTimer();
  isHovered.value = false;
};

// 放弃修改：清空草稿
const handleCancel = () => {
  field.value.newValue = "";
  stopHideTimer();
  isHovered.value = false;
};

const handleMouseEnter = () => {
  stopHideTimer();
  if (valueContent.value && newValueContent.value) {
    isHovered.value = true;
    // 字段靠近页面顶部时向下浮，否则向上浮，避免溢出页面边界
    const page = rootRef.value?.closest(".resume-page-item");
    if (rootRef.value && page) {
      const elTop = rootRef.value.getBoundingClientRect().top - page.getBoundingClientRect().top;
      dropdownDirection.value = elTop < page.getBoundingClientRect().height / 2 ? "down" : "up";
    }
  }
};

const handleMouseLeave = () => {
  if (valueContent.value) {
    startHideTimer();
  }
};
</script>

<template>
  <div
    v-if="hasContent"
    ref="rootRef"
    class="relative max-w-full min-w-0 break-words"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 悬浮对比层：浮在字段上方，不占文档流 -->
    <div
      v-show="isHovered && newValueContent"
      class="absolute left-0 z-10 flex max-h-[240px] w-max max-w-[320px] min-w-[180px] flex-col rounded-xl border border-sf-b bg-sf-page p-2 shadow-lg"
      :class="dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'"
    >
      <div class="min-h-0 flex-1 overflow-y-auto">
        <div class="rounded bg-[#e8f5e9] px-1 text-[#2e7d32]">
          <DiffContent :content="newValueContent" :blocks="newBlocks" :html="html" />
        </div>
        <div class="mt-1 rounded bg-[#fef0f0] px-1 text-[#d32f2f] line-through">
          <DiffContent :content="valueContent" :blocks="valueBlocks" :html="html" />
        </div>
      </div>
      <div class="mt-1 flex shrink-0 items-center gap-x-2">
        <div
          class="flex-c h-7 w-[45px] cursor-pointer rounded border-none bg-[#2e7d32] px-1.5 text-[11px] text-white"
          @click.stop="handleSave"
        >
          保留
        </div>
        <div
          class="flex-c h-7 w-[45px] cursor-pointer rounded border-none bg-[#999] px-1.5 text-[11px] text-white"
          @click.stop="handleCancel"
        >
          放弃
        </div>
      </div>
    </div>
    <!-- 文档流：有草稿显示新增内容，否则显示原值 -->
    <div class="w-full" :class="documentClass">
      <DiffContent :content="documentContent" :blocks="documentBlocks" :html="html" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
