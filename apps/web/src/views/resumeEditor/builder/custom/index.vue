<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  fontFamilyList,
  themeColors,
  uiParamRanges,
  userInfoModeList,
  defaultPadding,
  defaultFontSize,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultFontFamily,
  defaultThemeColor,
  defaultUserInfoMode,
  defaultAvatarPosition,
} from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import ConfigGroup from "./configGroup.vue";
import ConfigItem from "./configItem.vue";
import DesignPreset from "./designPreset.vue";
import ConfigLabel from "./configLabel.vue";

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

// 头像位置（左/居中/右）
const avatarPosition = computed({
  get: () => currentUI.value?.avatarPosition,
  set: (value) => {
    currentUI.value.avatarPosition = value;
  },
});
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="flex w-full flex-col gap-3">
      <!-- 一键设计预设：折叠面板默认折叠 -->
      <DesignPreset />
      <ConfigGroup title="页面布局">
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
          label="模块间距"
          v-model="currentUI.moduleSpacing"
          :min="uiParamRanges.moduleSpacing.min"
          :max="uiParamRanges.moduleSpacing.max"
          :step="uiParamRanges.moduleSpacing.step"
          :default-value="defaultModuleSpacing"
          tip="各模块之间的间隔"
        />
      </ConfigGroup>
      <ConfigGroup title="文字排版">
        <!-- 字体类型选择 -->
        <ConfigLabel
          label="字体类型"
          v-model="currentUI.fontFamily"
          :default-value="defaultFontFamily"
        />
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
      </ConfigGroup>

      <ConfigGroup title="主题配色">
        <!-- 主题色自定义取色器 -->
        <ConfigLabel
          label="主题色"
          v-model="currentUI.themeColor"
          :default-value="defaultThemeColor"
        />
        <div class="flex items-center justify-between">
          <el-color-picker
            v-model="currentUI.themeColor"
            size="large"
            :predefine="predefineColors"
          />
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
      </ConfigGroup>
      <ConfigGroup title="用户信息">
        <!-- 展示模式切换：图标 / 文字 -->
        <ConfigLabel label="展示模式" v-model="userInfoMode" :default-value="defaultUserInfoMode" />
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
        <!-- 头像位置切换：左 / 居中 / 右 -->
        <ConfigLabel
          label="头像位置"
          v-model="avatarPosition"
          :default-value="defaultAvatarPosition"
        />
        <div class="flex gap-4">
          <div
            v-for="item in avatarPositionList"
            :key="item.value"
            class="hover:bg-sf-hover flex-1 cursor-pointer rounded-md border border-sf-b py-2 text-center text-sm transition-all"
            :class="{
              'border-sf-theme-2 bg-sf-theme text-sf-base': avatarPosition === item.value,
            }"
            @click="avatarPosition = item.value"
          >
            {{ item.name }}
          </div>
        </div>
      </ConfigGroup>
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
