<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import {
  dateStyleList,
  fontFamilyList,
  titleIconList,
  uiParamRanges,
  defaultFontSize,
  defaultTitleFontSize,
  defaultLineHeight,
  defaultFontFamily,
  defaultThemeColor,
  defaultDateStyle,
  defaultTitleIcon,
} from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import ConfigGroup from "./configGroup.vue";
import ConfigItem from "./configItem.vue";
import DesignPreset from "./designPreset.vue";
import ConfigLabel from "./configLabel.vue";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 日期样式（点号/中文）
const dateStyle = computed({
  get: () => currentUI.value?.dateStyle,
  set: (value) => {
    currentUI.value.dateStyle = value;
  },
});

// 标题图标（关闭/开启）
const titleIcon = computed({
  get: () => currentUI.value?.titleIcon,
  set: (value) => {
    currentUI.value.titleIcon = value;
  },
});
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="flex w-full flex-col gap-3">
      <!-- 一键设计预设：折叠面板默认折叠 -->
      <DesignPreset />

      <ConfigGroup title="文字排版">
        <!-- 字体类型选择 -->
        <ConfigLabel
          label="字体类型"
          v-model="currentUI.fontFamily"
          :default-value="defaultFontFamily"
        />
        <SfSelect v-model="currentUI.fontFamily" :list="fontFamilyList" />

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
          label="模块标题字号"
          v-model="currentUI.titleFontSize"
          :min="uiParamRanges.titleFontSize.min"
          :max="uiParamRanges.titleFontSize.max"
          :step="uiParamRanges.titleFontSize.step"
          :default-value="defaultTitleFontSize"
          tip="各模块标题文字的大小"
        />
        <!-- 标题图标切换：关闭 / 开启 -->
        <ConfigLabel label="标题图标" v-model="titleIcon" :default-value="defaultTitleIcon" />
        <div class="flex gap-3">
          <SfButton
            class="flex-1"
            @click="titleIcon = mode.value"
            border
            v-for="mode in titleIconList"
            :type="titleIcon === mode.value ? 'theme' : 'bg'"
            :key="mode.name"
            >{{ mode.name }}</SfButton
          >
        </div>
        <ConfigItem
          label="行间距"
          v-model="currentUI.lineHeight"
          :min="uiParamRanges.lineHeight.min"
          :max="uiParamRanges.lineHeight.max"
          :step="uiParamRanges.lineHeight.step"
          :default-value="defaultLineHeight"
          tip="行与行之间的距离（字号倍数），数值越大行距越大"
        />
        <!-- 日期样式切换：点号 / 中文 -->
        <ConfigLabel label="日期样式" v-model="dateStyle" :default-value="defaultDateStyle" />
        <div class="flex gap-3">
          <SfButton
            class="flex-1"
            @click="dateStyle = mode.value"
            border
            v-for="mode in dateStyleList"
            :type="dateStyle === mode.value ? 'theme' : 'bg'"
            :key="mode.value"
            >{{ mode.name }}</SfButton
          >
        </div>
      </ConfigGroup>

      <ConfigGroup title="主题配色">
        <!-- 主题色自定义取色器 -->
        <ConfigLabel
          label="主题色"
          v-model="currentUI.themeColor"
          :default-value="defaultThemeColor"
        />
        <ThemeColorPicker v-model="currentUI.themeColor" />
      </ConfigGroup>
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
