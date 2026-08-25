<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Debug from "./debug.vue";
import DownloadButton from "./downloadButton.vue";
import Title from "./title.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const resumeStore = useResumeStore();
const { layout } = storeToRefs(resumeStore);

const layoutList = [
  {
    name: "列表布局",
    value: "list",
    icon: "fluent:layout-column-one-third-left-24-regular",
  },
  {
    name: "三栏布局",
    value: "three",
    icon: "fluent:layout-column-three-24-regular",
  },
  {
    name: "AI布局",
    value: "ai",
    icon: "fluent:layout-column-one-third-right-24-regular",
  },
];
const handleLayoutClick = (item) => {
  resumeStore.setLayout(item.value);
};
const handleBack = () => {
  router.push("/resume/mine");
};
</script>

<template>
  <header class="flex h-12 items-center justify-between border-b border-sf-b bg-sf-primary px-3">
    <!-- 左侧占位 -->
    <div class="flex flex-1 items-center gap-2">
      <SfTooltip :content="$t('router.resume')">
        <div
          @click="handleBack"
          class="flex items-center gap-1.5 rounded-full px-3 py-1 text-sf-theme transition-all hover:bg-sf-theme-3"
        >
          <SfIcon icon="famicons:chevron-back" size="4" />
          <span class="text-sm font-bold tracking-wide">{{ $t("router.resume") }}</span>
          <SfLogo size="5.5" class="animate-pulse" name="resume" />
        </div>
      </SfTooltip>
      <Title />
    </div>

    <!-- 右侧工具栏 -->
    <div class="flex items-center gap-5">
      <!-- 布局切换器 -->
      <div class="flex items-center gap-1 rounded-xl bg-sf-bg p-1">
        <SfTooltip v-for="item in layoutList" :key="item.value" :content="item.name">
          <button
            type="button"
            class="flex-c h-7 w-7 rounded-lg text-sf-text transition-all"
            :class="[layout === item.value ? 'bg-sf-theme-2 text-sf-theme' : 'hover:bg-sf-theme-3']"
            @click="handleLayoutClick(item)"
          >
            <SfIcon :icon="item.icon" size="5.5" />
          </button>
        </SfTooltip>
      </div>
      <!-- 操作按钮组 -->
      <DownloadButton />

      <!-- 分隔线 -->
      <div class="h-5 w-px bg-sf-b"></div>
      <!-- 快捷图标 -->
      <SfDonation />
      <SfLocale />
      <SfTheme />
      <SfSetting />
      <Debug />
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
