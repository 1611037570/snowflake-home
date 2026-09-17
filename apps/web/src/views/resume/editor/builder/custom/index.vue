<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  dateStyleList,
  fontFamilyList,
  infoPositionList,
  uiParamRanges,
  userInfoLayoutList,
  userInfoModeList,
  defaultPadding,
  defaultFontSize,
  defaultTitleFontSize,
  defaultLineHeight,
  defaultParagraphSpacing,
  defaultModuleSpacing,
  defaultFontFamily,
  defaultThemeColor,
  defaultUserInfoMode,
  defaultUserInfoLayout,
  defaultAvatarPosition,
  defaultInfoPosition,
  defaultDateStyle,
  defaultFooter,
} from "@/stores/modules/resume/uiConfig";
import { storeToRefs } from "pinia";
import ConfigGroup from "./configGroup.vue";
import ConfigItem from "./configItem.vue";
import DesignPreset from "./designPreset.vue";
import ConfigLabel from "./configLabel.vue";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 个人信息展示模式
const userInfoMode = computed({
  get: () => currentUI.value?.userInfoMode,
  set: (value) => {
    currentUI.value.userInfoMode = value;
  },
});

// 个人信息布局（网格/弹性）
const userInfoLayout = computed({
  get: () => currentUI.value?.userInfoLayout,
  set: (value) => {
    currentUI.value.userInfoLayout = value;
  },
});

// 头像位置（左/居中/右）
const avatarPosition = computed({
  get: () => currentUI.value?.avatarPosition,
  set: (value) => {
    currentUI.value.avatarPosition = value;
  },
});

// 信息位置（左/居中/右），独立于头像位置
const infoPosition = computed({
  get: () => currentUI.value?.infoPosition,
  set: (value) => {
    currentUI.value.infoPosition = value;
  },
});

// 日期样式（点号/中文）
const dateStyle = computed({
  get: () => currentUI.value?.dateStyle,
  set: (value) => {
    currentUI.value.dateStyle = value;
  },
});

// 自定义页尾文案
const footer = computed({
  get: () => currentUI.value?.footer ?? "",
  set: (value) => {
    currentUI.value.footer = value;
  },
});
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="flex w-full flex-col gap-3">
      <!-- 一键设计预设：折叠面板默认折叠 -->
      <DesignPreset />

      <ConfigGroup title="个人信息">
        <!-- 展示模式切换：图标 / 文字 -->
        <ConfigLabel label="展示模式" v-model="userInfoMode" :default-value="defaultUserInfoMode" />
        <div class="flex gap-3">
          <SfButton
            class="flex-1"
            @click="userInfoMode = mode.value"
            border
            v-for="mode in userInfoModeList"
            :type="userInfoMode === mode.value ? 'theme' : 'bg'"
            :key="mode.value"
            >{{ mode.name }}</SfButton
          >
        </div>
        <!-- 布局方式切换：网格 / 弹性 -->
        <ConfigLabel
          label="布局方式"
          v-model="userInfoLayout"
          :default-value="defaultUserInfoLayout"
        />
        <div class="flex gap-3">
          <SfButton
            class="flex-1"
            @click="userInfoLayout = mode.value"
            border
            v-for="mode in userInfoLayoutList"
            :type="userInfoLayout === mode.value ? 'theme' : 'bg'"
            :key="mode.value"
            >{{ mode.name }}</SfButton
          >
        </div>
        <!-- 头像位置切换：左 / 居中 / 右 -->
        <ConfigLabel
          label="头像位置"
          v-model="avatarPosition"
          :default-value="defaultAvatarPosition"
        />
        <div class="flex gap-3">
          <SfButton
            class="flex-1"
            @click="avatarPosition = mode.value"
            border
            v-for="mode in avatarPositionList"
            :type="avatarPosition === mode.value ? 'theme' : 'bg'"
            :key="mode.value"
            >{{ mode.name }}</SfButton
          >
        </div>
        <!-- 信息位置切换：左 / 居中 / 右，与头像位置各管各的 -->
        <ConfigLabel label="信息位置" v-model="infoPosition" :default-value="defaultInfoPosition" />
        <div class="flex gap-3">
          <SfButton
            class="flex-1"
            @click="infoPosition = mode.value"
            border
            v-for="mode in infoPositionList"
            :type="infoPosition === mode.value ? 'theme' : 'bg'"
            :key="mode.value"
            >{{ mode.name }}</SfButton
          >
        </div>
      </ConfigGroup>

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
          label="模块上下间距"
          v-model="currentUI.moduleSpacing"
          :min="uiParamRanges.moduleSpacing.min"
          :max="uiParamRanges.moduleSpacing.max"
          :step="uiParamRanges.moduleSpacing.step"
          :default-value="defaultModuleSpacing"
          tip="各模块之间的间隔"
        />
        <ConfigItem
          label="模块段落间距"
          v-model="currentUI.paragraphSpacing"
          :min="uiParamRanges.paragraphSpacing.min"
          :max="uiParamRanges.paragraphSpacing.max"
          :step="uiParamRanges.paragraphSpacing.step"
          :default-value="defaultParagraphSpacing"
          tip="同一模块内各条内容之间的间隔"
        />
      </ConfigGroup>

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
      <ConfigGroup title="页脚设置">
        <!-- 自定义页尾品牌名：留空时展示默认「轻舟简历」 -->
        <ConfigLabel
          label="自定义页尾"
          v-model="footer"
          :default-value="defaultFooter"
          tip="仅自定义开头的品牌名，页码部分固定展示，留空恢复「轻舟简历」"
        />
        <SfInput v-model="footer" placeholder="例如：我的简历" clearable />
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
