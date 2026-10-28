<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import i18n from "@/locales";
import sections from "virtual:resume-public-sections";
import { publicExamples } from "./catalog";
import { renderPublicContent } from "./content";
import { resolveSiteConfig } from "../../../../site.config";

const route = useRoute();
// 列表与详情共享构建期提取的公开范本段落，不读取用户本地简历。
const html = computed(() => {
  const page = resolveSiteConfig(route.path);
  if (page?.route !== route.path || !page.content) return "";
  const example = publicExamples.find((item) => item.path === route.path);
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
