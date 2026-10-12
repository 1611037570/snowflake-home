<script setup>
import HistoryNav from "./historyNav.vue";
import Title from "./title.vue";
import LocalBackup from "./localBackup.vue";
import ExportResume from "./exportResume/index.vue";
import ProjectTitle from "../../../components/projectTitle.vue";
import OnlineWriters from "../../../components/onlineWriters.vue";
</script>

<template>
  <header
    class="flex h-12 shrink-0 items-center justify-between border-b border-sf-b bg-sf-primary pr-3 pl-2 md:pr-6 md:pl-3"
  >
    <!-- 左侧占位 -->
    <div class="flex min-w-0 flex-1 items-center">
      <ProjectTitle />
      <div class="mx-3 hidden text-sf-text-3 md:block">/</div>
      <Title class="min-w-0 flex-1 md:flex-initial" />
      <div class="hidden md:flex">
        <LocalBackup />
      </div>
    </div>

    <!-- 在线写作氛围：进入编辑器时抽取一次在线人数，窄屏隐藏避免挤压标题 -->
    <OnlineWriters class="mx-3 hidden shrink-0 lg:block" />

    <!-- 右侧工具栏 -->
    <div class="flex shrink-0 items-center gap-2 md:gap-5">
      <!-- 撤回/前进 -->
      <HistoryNav />
      <ExportResume />

      <!-- 分隔线 -->
      <div class="hidden h-5 w-px bg-sf-b md:block"></div>
      <!-- 快捷图标 -->
      <div class=""><SfTheme /></div>
      <div class=""><SfDonation /></div>
      <div class=""><SfLocale /></div>
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
