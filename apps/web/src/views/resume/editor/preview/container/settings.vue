<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  defaultAvatarPosition,
  defaultInfoPosition,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  defaultUserInfoLayout,
  defaultUserInfoMode,
  infoPositionList,
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
        class="flex w-[240px] flex-col gap-3 overflow-hidden rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <div class="text-xs font-bold text-sf-text">页面布局</div>
        <div v-for="item in layoutParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span class="flex items-center gap-1">
              <span>{{ item.label }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="setParam(item.key, item.defaultValue)"
              />
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
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="setParam(item.key, item.defaultValue)"
            />
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
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
