<script setup>
import { useResumeStore } from "@/stores";
import {
  fontFamilyList,
  fontSizeList,
  lineHeightList,
  paddingList,
  themeColors,
} from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import ConfigItem from "./configItem.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="flex flex-col gap-6">
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
        leftLabel="窄"
        rightLabel="宽"
        :list="paddingList"
        v-model="currentUI.padding"
      />
      <ConfigItem
        label="字体大小"
        leftLabel="小"
        rightLabel="大"
        :list="fontSizeList"
        v-model="currentUI.fontSize"
      />
      <ConfigItem
        label="行间距"
        leftLabel="密"
        rightLabel="疏"
        :list="lineHeightList"
        v-model="currentUI.lineHeight"
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
  </div>
</template>

<style lang="scss" scoped></style>
