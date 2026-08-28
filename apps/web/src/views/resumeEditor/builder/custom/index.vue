<script setup>
import { useResumeStore } from "@/stores";
import { fontFamilyList, themeColors } from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import ConfigItem from "./configItem.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
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
    <ConfigItem
      label="页边距"
      v-model="currentUI.padding"
      :min="2"
      :max="48"
      :step="1"
      tip="页面四周的留白距离"
    />
    <ConfigItem
      label="字体大小"
      v-model="currentUI.fontSize"
      :min="10"
      :max="24"
      :step="2"
      tip="正文的基础字号"
    />
    <ConfigItem
      label="行间距"
      v-model="currentUI.lineHeight"
      :min="1"
      :max="2"
      :step="0.1"
      tip="行与行之间的距离（字号倍数），数值越大行距越大"
    />
    <ConfigItem
      label="模块间距"
      v-model="currentUI.moduleSpacing"
      :min="2"
      :max="48"
      :step="1"
      tip="各模块之间的间隔"
    />
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
