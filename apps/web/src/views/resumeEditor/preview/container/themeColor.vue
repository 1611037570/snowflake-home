<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
</script>

<template>
  <SfDropdown trigger="hover" placement="bottom-start" :show-arrow="false">
    <SfTooltip :content="`主题颜色`">
      <div
        class="box-border h-7 w-7 cursor-pointer rounded-full border-3 border-sf-b bg-sf-theme-2"
        :style="{ backgroundColor: currentUI.themeColor }"
      ></div>
    </SfTooltip>
    <template #dropdown>
      <div class="rounded-3xl border border-sf-b bg-sf-primary p-3">
        <ThemeColorPicker v-model="currentUI.themeColor" />
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
