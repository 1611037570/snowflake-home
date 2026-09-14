<script setup>
import HistoryNav from "./historyNav.vue";
import Title from "./title.vue";
import LocalBackup from "./localBackup.vue";
import ExportResume from "./exportResume/index.vue";
import ProjectTitle from "../../../components/projectTitle.vue";
</script>

<template>
  <header
    class="flex h-12 items-center justify-between rounded-b-3xl border-b border-sf-b bg-sf-primary pr-6 pl-3"
  >
    <!-- 左侧占位 -->
    <div class="flex flex-1 items-center">
      <ProjectTitle />
      <div class="mx-3 text-sf-text-3">/</div>
      <Title />
      <LocalBackup />
    </div>

    <!-- 右侧工具栏 -->
    <div class="flex items-center gap-5">
      <!-- 撤回/前进 -->
      <HistoryNav />
      <ExportResume />

      <!-- 分隔线 -->
      <div class="h-5 w-px bg-sf-b"></div>
      <!-- 快捷图标 -->
      <SfTheme />
      <SfDonation />
      <SfLocale />
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
