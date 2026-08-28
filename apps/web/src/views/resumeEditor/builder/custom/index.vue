<script setup>
import { useResumeStore } from "@/stores";
import { fontFamilyList, themeColors } from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import ConfigItem from "./configItem.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 行高强制不低于字号减8px，避免行高过小导致文字重叠
watch(
  () => [currentUI.value?.fontSize, currentUI.value?.lineHeight],
  ([fontSize, lineHeight]) => {
    if (fontSize == null || lineHeight == null) return;
    const minLineHeight = fontSize;
    if (lineHeight < minLineHeight) currentUI.value.lineHeight = minLineHeight;
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <div>
      <div class="mb-4 text-base font-bold text-sf-text">字体</div>
      <div class="flex gap-4">
        <div
          v-for="item in fontFamilyList"
          :key="item.value"
          class="hover:bg-sf-hover flex-1 cursor-pointer rounded-md border border-sf-b py-2 text-center text-sm transition-all"
          :class="{
            'border-sf-theme-2 bg-sf-theme text-sf-base': currentUI.fontFamily === item.value,
          }"
          @click="currentUI.fontFamily = item.value"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <ConfigItem label="页边距" v-model="currentUI.padding" :min="2" :max="48" :step="1" />
    <ConfigItem label="字体大小" v-model="currentUI.fontSize" :min="8" :max="24" :step="1" />
    <ConfigItem
      label="行间距"
      v-model="currentUI.lineHeight"
      :min="8"
      :max="48"
      :step="1"
      tip="最小不能小于字体"
    />
    <ConfigItem label="模块间距" v-model="currentUI.moduleSpacing" :min="2" :max="24" :step="1" />
    <!-- 主题色 -->
    <div class="mb-6 flex flex-col">
      <div class="mb-4 text-base font-bold text-sf-text">主题色</div>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="colorItem in themeColors"
          :key="colorItem.value"
          class="h-8 w-8 cursor-pointer rounded-full transition-all duration-200 hover:scale-110"
          :class="{
            'border-2 border-sf-base': currentUI.themeColor === colorItem.value,
          }"
          :style="{
            backgroundColor: colorItem.value,
          }"
          @click="currentUI.themeColor = colorItem.value"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
