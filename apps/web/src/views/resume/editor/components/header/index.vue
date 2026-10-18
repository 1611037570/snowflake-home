<script setup>
import HistoryNav from "./historyNav.vue";
import Title from "./title.vue";
import LocalBackup from "./localBackup.vue";
import ExportResume from "./exportResume/index.vue";
import ProjectTitle from "../../../components/projectTitle.vue";
</script>

<template>
  <!-- 文件栏：结构、高度与配色维持原样，仅把在线人数移到右侧工具轨 -->
  <header
    class="flex h-12 shrink-0 items-center justify-between border-b border-sf-b bg-sf-primary pr-3 pl-2 md:pr-6 md:pl-3"
  >
    <div class="flex min-w-0 flex-1 items-center md:gap-3">
      <ProjectTitle />
      <!-- 顶部两处分隔统一使用相同的竖线尺寸与颜色。 -->
      <div class="hidden h-5 w-px shrink-0 bg-sf-b md:block"></div>
      <Title class="min-w-0 flex-1 md:flex-initial" />
      <div class="hidden md:flex">
        <LocalBackup />
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-3">
      <HistoryNav />
      <ExportResume />
      <div class="hidden h-5 w-px shrink-0 bg-sf-b md:block"></div>
      <div><SfTheme /></div>
      <div><SfLocale /></div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
