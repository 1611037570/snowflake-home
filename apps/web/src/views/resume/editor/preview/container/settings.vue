<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  dateStyleList,
  defaultAvatarPosition,
  defaultDateStyle,
  defaultInfoPosition,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  defaultTitleIcon,
  defaultUserInfoLayout,
  defaultUserInfoMode,
  infoPositionList,
  titleIconList,
  uiParamRanges,
  userInfoLayoutList,
  userInfoModeList,
} from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 页面布局数值参数：标签、绑定字段、默认值与单位集中维护，模板统一渲染
const layoutParams = [
  { label: "上下页边距", key: "paddingVertical", defaultValue: defaultPaddingVertical, unit: "px" },
  {
    label: "左右页边距",
    key: "paddingHorizontal",
    defaultValue: defaultPaddingHorizontal,
    unit: "px",
  },
  { label: "模块上下间距", key: "moduleSpacing", defaultValue: defaultModuleSpacing, unit: "px" },
  {
    label: "模块段落间距",
    key: "paragraphSpacing",
    defaultValue: defaultParagraphSpacing,
    unit: "px",
  },
  // 行间距为字号倍数，单位与其它像素值不同
  { label: "行间距", key: "lineHeight", defaultValue: defaultLineHeight, unit: "倍" },
];

// 个人信息选项参数：左侧标签加重置按钮，右侧按选项按钮组渲染
const userInfoParams = [
  {
    label: "展示模式",
    key: "userInfoMode",
    defaultValue: defaultUserInfoMode,
    list: userInfoModeList,
  },
  {
    label: "布局方式",
    key: "userInfoLayout",
    defaultValue: defaultUserInfoLayout,
    list: userInfoLayoutList,
  },
  {
    label: "头像位置",
    key: "avatarPosition",
    defaultValue: defaultAvatarPosition,
    list: avatarPositionList,
  },
  {
    label: "信息位置",
    key: "infoPosition",
    defaultValue: defaultInfoPosition,
    list: infoPositionList,
  },
];

// 读取参数当前值
const getValue = (key) => currentUI.value?.[key];

// 读取数值型参数：统一转为数值，避免字符串参与滑块内部计算
const getNumberValue = (key) => Number(currentUI.value?.[key]);

// 写入参数：数值型统一使用数值类型
const setParam = (key, value) => {
  if (!currentUI.value) return;
  currentUI.value[key] = typeof value === "number" ? Number(value) : value;
};

// 一键设计预设：点击整仓套用字体、间距与配色，取值均在 uiParamRanges 范围内
const PRESETS = [
  {
    name: "极简留白",
    desc: "大留白 + 宽松行距，适合内容较少的简历",
    themeColor: "#40a9ff",
    ui: {
      paddingVertical: 48,
      paddingHorizontal: 48,
      fontSize: 15,
      lineHeight: 1.5,
      moduleSpacing: 24,
      themeColor: "#40a9ff",
      userInfoMode: "text",
    },
  },
  {
    name: "紧凑商务",
    desc: "小边距 + 紧凑排版，一页纸友好",
    themeColor: "#ff4d4f",
    ui: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 14,
      lineHeight: 1.15,
      moduleSpacing: 8,
      themeColor: "#ff4d4f",
      userInfoMode: "icon",
    },
  },
];

// 套用预设：合并进当前 UI 配置，保留其它自定义项
const applyPreset = (preset) => {
  currentUI.value = { ...currentUI.value, ...preset.ui };
  ElMessage.success(`已应用「${preset.name}」设计方案`);
};

// 标题图标（关闭/开启）
const titleIcon = computed({
  get: () => currentUI.value?.titleIcon,
  set: (value) => {
    currentUI.value.titleIcon = value;
  },
});

// 日期样式（点号/中文）
const dateStyle = computed({
  get: () => currentUI.value?.dateStyle,
  set: (value) => {
    currentUI.value.dateStyle = value;
  },
});
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <SfTooltip content="页面设置">
      <SfIcon
        icon="lucide:settings-2"
        size="5"
        boxSize="7"
        class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      />
    </SfTooltip>
    <template #dropdown>
      <div
        class="flex max-h-[70vh] w-[240px] flex-col gap-3 overflow-y-auto rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <div class="text-xs font-bold text-sf-text">页面布局</div>
        <div v-for="item in layoutParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span class="flex items-center gap-1">
              <span>{{ item.label }}</span>
              <SfTooltip content="恢复默认值">
                <SfIcon
                  icon="material-symbols:restart-alt"
                  size="4"
                  class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                  @click="setParam(item.key, item.defaultValue)"
                />
              </SfTooltip>
            </span>
            <span>{{ getNumberValue(item.key) }}{{ item.unit }}</span>
          </div>
          <SfSlider
            :model-value="getNumberValue(item.key)"
            @update:model-value="(value) => setParam(item.key, value)"
            :min="uiParamRanges[item.key].min"
            :max="uiParamRanges[item.key].max"
            :step="uiParamRanges[item.key].step"
            size="small"
          />
        </div>

        <div class="text-xs font-bold text-sf-text">个人信息</div>
        <div v-for="item in userInfoParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>{{ item.label }}</span>
            <SfTooltip content="恢复默认值">
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="setParam(item.key, item.defaultValue)"
              />
            </SfTooltip>
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="option in item.list"
              :key="option.value"
              class="flex-1"
              border
              @click="setParam(item.key, option.value)"
              :type="getValue(item.key) === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
            >
          </div>
        </div>

        <div class="text-xs font-bold text-sf-text">一键设计</div>
        <div
          v-for="preset in PRESETS"
          :key="preset.name"
          class="flex cursor-pointer items-center gap-3 rounded-2xl border border-sf-b p-3 transition-colors hover:border-sf-theme hover:bg-sf-theme-3"
          @click="applyPreset(preset)"
        >
          <span
            class="h-4 w-4 shrink-0 rounded-full"
            :style="{ backgroundColor: preset.themeColor }"
          ></span>
          <div class="flex min-w-0 flex-col">
            <span class="text-sm text-sf-text">{{ preset.name }}</span>
            <span class="text-xs text-sf-text-2">{{ preset.desc }}</span>
          </div>
        </div>

        <div class="text-xs font-bold text-sf-text">细节调整</div>
        <!-- 标题图标切换：关闭 / 开启 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>标题图标</span>
            <SfTooltip content="恢复默认值">
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="titleIcon = defaultTitleIcon"
              />
            </SfTooltip>
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="mode in titleIconList"
              :key="mode.name"
              class="flex-1"
              border
              @click="titleIcon = mode.value"
              :type="titleIcon === mode.value ? 'theme' : 'bg'"
              >{{ mode.name }}</SfButton
            >
          </div>
        </div>
        <!-- 日期样式切换：点号 / 中文 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>日期样式</span>
            <SfTooltip content="恢复默认值">
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="dateStyle = defaultDateStyle"
              />
            </SfTooltip>
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="mode in dateStyleList"
              :key="mode.value"
              class="flex-1"
              border
              @click="dateStyle = mode.value"
              :type="dateStyle === mode.value ? 'theme' : 'bg'"
              >{{ mode.name }}</SfButton
            >
          </div>
        </div>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
