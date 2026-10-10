<template>
  <div class="minimal-projects w-dwh relative z-10 flex flex-col items-center bg-sf-bg px-6 py-24 lg:px-12" id="project">
    <div
      v-for="(section, idx) in sections"
      :key="idx"
      :class="['minimal-project-group w-full max-w-[1080px]', { 'mb-12': idx !== sections.length - 1 }]"
    >
      <div class="mb-9 flex items-center justify-start">
        <div class="hidden"></div>
        <SmallTitle :title="section.title" />
        <div class="ml-6 h-px flex-1 bg-sf-b"></div>
      </div>
      <div class="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
        <ProjectCard v-for="(item, index) in section.list" :key="index" :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { PROJECT_PAGE } from "@/configs";
import SmallTitle from "../components/smallTitle.vue";
import ProjectCard from "./projectCard.vue";
const list = computed(() => {
  return PROJECT_PAGE.value.filter((item) => !item.hidden && item.url !== "/index");
});
// 项目经历数据
const projectList = [
  {
    name: "**社区",
    desc: "AI驱动的新一代社区平台",
    urlType: "web",
  },
  {
    name: "**工作台",
    desc: '副屏"操作系统"',
    urlType: "web",
  },
];

const sections = computed(() => [
  {
    title: "个人项目",
    list: list.value,
  },
  {
    title: "参与开发",
    list: projectList,
  },
]);
</script>

<style scoped>
/* 用留白、细线和文字层次统一后续区域。 */

.minimal-projects { border-top: 1px solid var(--sf-border); scroll-margin-top: 80px; }
.minimal-project-group :deep(h3) { margin: 0; font-size: 20px; font-weight: 500; letter-spacing: .06em; color: var(--sf-base); }
.minimal-project-group :deep(h3 .sf-icon) { margin-right: 12px; color: var(--sf-text-2); }

</style>
