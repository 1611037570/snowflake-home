<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  defaultFontSize,
  defaultTitleFontSize,
  uiParamRanges,
} from "@/domain/resume/theme/uiConfig";
import { getResumeThemeTemplate } from "@/views/resume/theme";
import SettingPill from "./settingPill.vue";
import SettingNumberField from "./settingNumberField.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const dropdownVisible = ref(false); // 下拉展开时保持入口高亮

// 字号参数：正文与模块标题同属字体设置，合并到这一个入口
const sizeFieldList = [
  { key: "size", labelKey: "fontSize", defaultValue: defaultFontSize },
  { key: "titleSize", labelKey: "moduleTitleFontSize", defaultValue: defaultTitleFontSize },
];

// 重置基准取当前主题声明的字号，主题未声明时回退系统默认值
const themePresetUi = computed(
  () => getResumeThemeTemplate(currentUI.value?.theme?.template).item.ui,
);

const readSize = (field) => {
  const value = Number(currentUI.value?.font?.[field.key]);
  return Number.isFinite(value) ? value : field.defaultValue;
};

// 拖滑杆时持续写入并保持面板展开；清空输入期间不写入无效值
const writeSize = (key, value) => {
  if (!currentUI.value || !Number.isFinite(value)) return;
  currentUI.value.font[key] = Number(value);
};

const resetSize = (field) => {
  writeSize(field.key, themePresetUi.value?.font?.[field.key] ?? field.defaultValue);
};

// 面板内容随语言重新生成，并给出当前数值与可调范围
const sizeFields = computed(() => {
  i18n.global.locale.value;
  return sizeFieldList.map((field) => ({
    ...field,
    label: $t(field.labelKey),
    value: readSize(field),
    range: uiParamRanges[`font.${field.key}`],
  }));
});

// 入口概括正文字号，标题字号在面板内单独调
const bodySize = computed(() => sizeFields.value[0].value);
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    @visible-change="dropdownVisible = $event"
  >
    <SettingPill
      :label="$t('fontSize')"
      :value="`${bodySize}px`"
      :active="dropdownVisible"
    />
    <template #dropdown>
      <!-- 与面板同一套数值控件，滑杆与数字框共用同一个写入入口 -->
      <div class="flex w-72 flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <SettingNumberField
          v-for="item in sizeFields"
          :key="item.key"
          :label="item.label"
          :model-value="item.value"
          :min="item.range.min"
          :max="item.range.max"
          :step="item.range.step"
          unit="px"
          @update:model-value="(value) => writeSize(item.key, value)"
          @reset="resetSize(item)"
        />
      </div>
    </template>
  </SfDropdown>
</template>
