<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { previewLangList } from "../i18n";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

const langOptions = computed(() =>
  previewLangList.map((item) => ({
    ...item,
    active: item.value === (currentUI.value?.language || "zh"),
  })),
);

// 将选择的语言同步到当前简历界面配置
const handleLangSelect = (item) => {
  if (currentUI.value) currentUI.value.language = item.value;
};
</script>

<template>
  <SfDropdown trigger="hover" placement="bottom-start" :show-arrow="false">
    <SfTooltip content="切换简历语言">
      <SfIcon
        icon="mdi:translate"
        size="5"
        boxSize="7"
        class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      />
    </SfTooltip>
    <template #dropdown>
      <SfList class="w-[140px]" :list="langOptions" :border="false" @onClick="handleLangSelect" />
    </template>
  </SfDropdown>
</template>
