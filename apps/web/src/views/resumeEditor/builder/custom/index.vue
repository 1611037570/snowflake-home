<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import {
  fontFamilyList,
  themeColors,
  uiParamRanges,
  userInfoModeList,
  defaultPadding,
  defaultFontSize,
  defaultLineHeight,
  defaultModuleSpacing,
} from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import ConfigItem from "./configItem.vue";
import DesignPreset from "./designPreset.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 主题色预设色板，供取色器快捷选择
const predefineColors = themeColors.map((item) => item.value);

// 用户信息展示模式
const userInfoMode = computed({
  get: () => currentUI.value?.userInfoMode,
  set: (value) => {
    currentUI.value.userInfoMode = value;
  },
});
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <!-- 一键设计预设：折叠面板默认折叠 -->
    <DesignPreset />
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
      :min="uiParamRanges.padding.min"
      :max="uiParamRanges.padding.max"
      :step="uiParamRanges.padding.step"
      :default-value="defaultPadding"
      tip="页面四周的留白距离"
    />
    <ConfigItem
      label="字体大小"
      v-model="currentUI.fontSize"
      :min="uiParamRanges.fontSize.min"
      :max="uiParamRanges.fontSize.max"
      :step="uiParamRanges.fontSize.step"
      :default-value="defaultFontSize"
      tip="正文的基础字号"
    />
    <ConfigItem
      label="行间距"
      v-model="currentUI.lineHeight"
      :min="uiParamRanges.lineHeight.min"
      :max="uiParamRanges.lineHeight.max"
      :step="uiParamRanges.lineHeight.step"
      :default-value="defaultLineHeight"
      tip="行与行之间的距离（字号倍数），数值越大行距越大"
    />
    <ConfigItem
      label="模块间距"
      v-model="currentUI.moduleSpacing"
      :min="uiParamRanges.moduleSpacing.min"
      :max="uiParamRanges.moduleSpacing.max"
      :step="uiParamRanges.moduleSpacing.step"
      :default-value="defaultModuleSpacing"
      tip="各模块之间的间隔"
    />
    <!-- 用户信息 -->
    <div class="flex flex-col gap-4">
      <div class="text-base font-bold text-sf-text">用户信息</div>
      <!-- 展示模式切换：图标 / 文字 -->
      <div class="flex gap-4">
        <div
          v-for="mode in userInfoModeList"
          :key="mode.value"
          class="hover:bg-sf-hover flex-1 cursor-pointer rounded-md border border-sf-b py-2 text-center text-sm transition-all"
          :class="{
            'border-sf-theme-2 bg-sf-theme text-sf-base': userInfoMode === mode.value,
          }"
          @click="userInfoMode = mode.value"
        >
          {{ mode.name }}
        </div>
      </div>
    </div>
    <!-- 主题色 -->
    <div class="mb-6 flex flex-col">
      <div class="mb-4 flex items-center justify-between">
        <div class="text-base font-bold text-sf-text">主题色</div>
        <!-- 自定义取色器 -->
        <el-color-picker v-model="currentUI.themeColor" size="large" :predefine="predefineColors" />
      </div>
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
