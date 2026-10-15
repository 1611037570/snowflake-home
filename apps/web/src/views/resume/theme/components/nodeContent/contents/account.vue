<script setup lang="ts">
import ItemTitle from "@/views/resume/editor/preview/components/itemTitle.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { safeContentUrl as safeUrl } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";
import { useNodeContent, type NodeContentProps } from "@/views/resume/editor/preview/resumePages/render/nodeContentContract";

const props = withDefaults(defineProps<NodeContentProps>(), {
  blockRange: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }),
});
const { item } = useNodeContent(props);
const { theme: { linkUnderline } } = useResumePreviewContext();
</script>

<template>
  <div class="flex max-w-full min-w-0 items-center">
    <!-- 与教育经历一致：有效链接包住显示名称，悬停时为名称加下划线。 -->
    <a
      v-if="item.name && safeUrl(item.url)"
      :href="safeUrl(item.url)"
      target="_blank"
      rel="noopener noreferrer"
      class="account-name-link shrink-0 whitespace-nowrap hover:underline"
      :class="{ underline: linkUnderline }"
    >
      <ItemTitle :name="item.name" class="inline-block" />
    </a>
    <span v-else-if="item.name" class="account-name-link shrink-0 whitespace-nowrap hover:underline">
      <ItemTitle :name="item.name" class="inline-block" />
    </span>
    <!-- 链接需要 flex-1 + overflow-hidden 的包裹层，窄栏内才能截断溢出 -->
    <div v-else class="flex min-w-0 flex-1 items-center overflow-hidden">
      <a
        :href="safeUrl(item.url)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block max-w-full truncate whitespace-nowrap hover:underline"
        :class="{ underline: linkUnderline }"
      >
        <ResumeField
          :model-value="item.url"
          class="flex max-w-full items-center truncate whitespace-nowrap hover:underline"
          boxClass="truncate"
          :class="{ underline: linkUnderline }"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
/* 名称经过标题组件的块级包裹，悬停时直接给实际文字加下划线。 */
.account-name-link:hover :deep([data-resume-plain-text]),
.account-name-link.underline :deep([data-resume-plain-text]) {
  text-decoration: underline;
}

/* 地址链接沿用教育经历预览的悬停规则。 */
:deep(a:hover) {
  text-decoration: underline;
}
</style>
