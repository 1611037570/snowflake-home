<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import i18n from "@/locales";
import sections from "virtual:resume-public-sections";
import { publicExamples } from "./catalog";
import { renderPublicContent } from "./content";

const route = useRoute();
// 仅范本详情展示提取的公开段落，不向其他页面追加介绍区域。
const html = computed(() => {
  const example = publicExamples.find((item) => item.path === route.path);
  if (!example) return "";
  return renderPublicContent(
    route.path,
    example ? sections[example.slug] : [],
    String(i18n.global.locale.value).startsWith("en"),
  );
});
</script>

<template>
  <!-- 内容中的文本与链接由公共渲染函数统一转义。 -->
  <div v-html="html" />
</template>
