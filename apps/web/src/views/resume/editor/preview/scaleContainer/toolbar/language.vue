<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { getPreviewTitle, previewLangList } from "../../shared/i18n";

const resumeStore = useResumeStore();
const { currentUI, currentData } = storeToRefs(resumeStore);

const langOptions = computed(() =>
  previewLangList.map((item) => ({
    ...item,
    active: item.value === (currentUI.value?.content?.language || "zh"),
  })),
);

// 同步未自定义的模块标题：标题仍等于切换前语言的默认标题，说明用户没改过，可跟随语言更新
const syncModuleTitles = (prevLang, nextLang) => {
  const data = currentData.value;
  if (!data || prevLang === nextLang) return;
  Object.keys(data).forEach((key) => {
    // 个人信息标题不在预览区展示，不参与语言同步
    if (key === "user") return;
    const moduleUI = data[key]?.ui;
    const currentTitle = moduleUI?.title;
    const nextTitle = getPreviewTitle(key, nextLang);
    // 自定义模块无语言字典、标题为空或用户自定义过的模块保持原样
    if (!nextTitle || !currentTitle) return;
    if (currentTitle !== getPreviewTitle(key, prevLang)) return;
    moduleUI.title = nextTitle;
  });
};

// 将选择的语言同步到当前简历界面配置，并同步未自定义的模块标题
const handleLangSelect = (item) => {
  if (!currentUI.value) return;
  const prevLang = currentUI.value.content.language || "zh";
  currentUI.value.content.language = item.value;
  syncModuleTitles(prevLang, item.value);
};
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <span
      class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[11px] text-sf-text-2 transition-colors hover:bg-sf-bg"
    >
      <SfIcon icon="mdi:translate" size="4" />
      <span class="whitespace-nowrap">{{ $t("resumeLanguage") }}</span>
    </span>
    <template #dropdown>
      <SfList class="w-[140px]" :list="langOptions" :border="false" @onClick="handleLangSelect" />
    </template>
  </SfDropdown>
</template>
