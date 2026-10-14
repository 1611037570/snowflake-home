<script setup lang="ts">
import { computed } from "vue";
import { createContentBlocks } from "@/views/resume/editor/preview/resumePages/engine/contentBlocks";
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import FieldContent from "@/views/resume/editor/preview/components/resumeField/content.vue";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item, richTextHtml, richTextBlocks, showItemHeader, isBlockVisible, contentSpacingStyle } = useNodeContent(props);

// 熟练程度与成绩拼接为条目头的次要信息，缺省时自动跳过
const levelMeta = computed(() => {
  const parts = [item.value.level, item.value.score].filter(
    (part) => typeof part === "string" && part.trim() !== "",
  );
  return parts.join(" · ") || null;
});
// 可见块统一登记顺序：语言名称行在前，描述正文在后，缺描述时自动重编号
const blocks = computed(() => createContentBlocks([
  "title",
  ...(richTextHtml.value ? ["body"] : []),
]));
</script>

<template>
  <!-- 块一：语言名称与熟练程度、成绩 -->
  <div
    v-if="showItemHeader && isBlockVisible(blocks.indexOf('title'))"
    class="flex flex-wrap items-center justify-between gap-3"
  >
    <div class="min-w-0 flex-1">
      <ItemTitle :name="item.name" :emphasis="props.dateRail === true" />
    </div>
    <span v-if="levelMeta" class="inline max-w-full min-w-0 break-all">
      <ResumeField :model-value="levelMeta" />
    </span>
  </div>

  <!-- 块二：语言描述作为单个块，内部段落由字符区间切分，保证块序与测量层一致 -->
  <div v-if="richTextHtml && isBlockVisible(blocks.indexOf('body'))" data-layout-text-block :style="contentSpacingStyle()">
    <FieldContent :blocks="richTextBlocks" html />
  </div>
</template>
