<script setup>
import { computed, inject, useAttrs } from "vue";
import DOMPurify from "dompurify";

// 上层透传（class 高亮与悬浮监听），与各块原始属性合并渲染
const attrs = useAttrs();

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

// 行高随各字段实际字号自动缩放；字号由外层包装继承，避免强制基础字号覆盖 name 等字段的加大字号
// Teleport 浮层（DiffPopover）脱离简历 provide 上下文时回退空样式，避免 inject 为 undefined 导致渲染抛错
const lineHeightValue = inject("lineHeightValue", () => ({}));

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

// 合并透传属性与块原始属性，class/监听一并落到每个块上
const mergeAttrs = (blockAttrs) => ({ ...blockAttrs, ...attrs });

// 按原始内容缓存清洗拆分结果，避免同一内容重复执行 sanitize 与 HTML 解析
const parseCache = new Map();
const CACHE_MAX = 100;
const parseContent = (content) => {
  const cached = parseCache.get(content);
  if (cached) return cached;
  const result = {
    blocks: splitHtml(DOMPurify.sanitize(content, sanitizeConfig)),
    // 字数延迟到实际展示统计时再计算
    textLength: null,
  };
  parseCache.set(content, result);
  // 防止缓存无界增长，超出上限时淘汰最旧条目
  if (parseCache.size > CACHE_MAX) {
    parseCache.delete(parseCache.keys().next().value);
  }
  return result;
};

// 清洗拆分结果统一入口：仅 html 内容才解析，纯文本不触发
const parsed = computed(() => (props.html ? parseContent(props.content) : null));
const blocks = computed(() => parsed.value?.blocks || []);

// 可见文本字数：惰性计算，仅展示统计时解析一次并复用缓存
const charCount = computed(() => {
  if (!props.html) return props.content.length;
  const entry = parsed.value;
  if (entry.textLength === null) {
    const tmp = document.createElement("div");
    tmp.innerHTML = entry.blocks.map((b) => b.html).join("");
    // 回写缓存，后续评估直接复用
    entry.textLength = tmp.textContent?.length || 0;
  }
  return entry.textLength;
});
</script>

<template>
  <template v-if="html">
    <component
      v-for="(block, idx) in blocks"
      :key="idx"
      :is="block.tag"
      v-bind="mergeAttrs(block.attrs)"
      class="break-words whitespace-pre-wrap"
      :style="[lineHeightValue()]"
      :innerHTML="block.html"
    ></component>
  </template>
  <template v-else>
    <span :style="[lineHeightValue()]" v-bind="$attrs">{{ content }}</span>
  </template>
  <!-- 字数统计：由使用方通过 showCount 控制展示 -->
  <div v-if="showCount" class="mt-1 w-full text-right text-xs">共 {{ charCount }} 字</div>
</template>
