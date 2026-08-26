<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Debug from "./debug.vue";
import Title from "./title.vue";
import { useRouter } from "vue-router";
const router = useRouter();

const resumeStore = useResumeStore();
const { layout } = storeToRefs(resumeStore);

const layoutList = [
  {
    name: "编辑+预览布局",
    value: "list",
    icon: "fluent:layout-column-one-third-left-24-regular",
  },
  {
    name: "编辑+预览+AI布局",
    value: "three",
    icon: "fluent:layout-column-three-24-regular",
  },
  {
    name: "预览+AI布局",
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
  <header
    class="flex h-12 items-center justify-between border-b border-sf-b bg-sf-primary pr-6 pl-3"
  >
    <!-- 左侧占位 -->
    <div class="flex flex-1 items-center gap-2">
      <div
        @click="handleBack"
        class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sf-theme transition-all hover:bg-sf-theme-3"
      >
        <SfLogo size="5.5" class="animate-pulse" name="resume" />

        <span class="text-sm font-bold tracking-wide">{{ $t("router.resume") }}</span>
      </div>
      <div class="mr-2 text-sf-text-3">/</div>
      <Title />
    </div>

    <!-- 右侧工具栏 -->
    <div class="flex items-center gap-5">
      <!-- 布局切换器 -->
      <div class="flex items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1">
        <SfTooltip v-for="item in layoutList" :key="item.value" :content="item.name">
          <SfIcon
            :icon="item.icon"
            size="5"
            boxSize="7"
            class="rounded-full"
            :class="[
              layout === item.value ? 'bg-sf-theme text-sf-theme-text' : 'hover:bg-sf-theme-2',
            ]"
            @click="handleLayoutClick(item)"
          />
        </SfTooltip>
      </div>

      <!-- 分隔线 -->
      <div class="h-5 w-px bg-sf-b"></div>
      <!-- 快捷图标 -->
      <SfTheme />
      <SfDonation />
      <SfLocale />
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
