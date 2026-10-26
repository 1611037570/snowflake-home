<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  uiParamRanges,
} from "@/domain/resume/theme/uiConfig";
import { getResumeThemeTemplate } from "@/views/resume/theme";
import SettingPill from "./settingPill.vue";
import SettingSection from "./settingSection.vue";
import SettingNumberField from "./settingNumberField.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const dropdownVisible = ref(false); // 下拉展开时保持入口高亮

// 间距类参数统一由视图条调整：页边距两组、模块间距两组、行间距一项
const spacingFieldList = [
  {
    container: "page.padding",
    field: "vertical",
    labelKey: "layoutTopBottomMargin",
    defaultValue: defaultPaddingVertical,
    unit: "px",
  },
  {
    container: "page.padding",
    field: "horizontal",
    labelKey: "layoutLeftRightMargin",
    defaultValue: defaultPaddingHorizontal,
    unit: "px",
  },
  {
    container: "page.spacing",
    field: "module",
    labelKey: "layoutModuleSpacing",
    defaultValue: defaultModuleSpacing,
    unit: "px",
  },
  {
    container: "page.spacing",
    field: "paragraph",
    labelKey: "layoutParagraphSpacing",
    defaultValue: defaultParagraphSpacing,
    unit: "px",
  },
  // 行间距是字号倍数，单位随语言变化
  {
    container: "font",
    field: "lineHeight",
    labelKey: "layoutLineHeight",
    defaultValue: defaultLineHeight,
    unitKey: "lineHeightUnit",
  },
];

// 重置基准取当前主题声明的同名参数，主题未声明时回退系统默认值
const themePresetUi = computed(
  () => getResumeThemeTemplate(currentUI.value?.theme?.template).item.ui,
);

const resolveContainer = (source, path) =>
  path.split(".").reduce((target, key) => target?.[key], source);

const readSpacing = (item) => {
  const value = Number(resolveContainer(currentUI.value, item.container)?.[item.field]);
  return Number.isFinite(value) ? value : item.defaultValue;
};

// 数字输入清空期间不写入无效值，与布局面板保持一致
const writeSpacing = (item, value) => {
  if (!currentUI.value || !Number.isFinite(value)) return;
  const container = resolveContainer(currentUI.value, item.container);
  if (container) container[item.field] = Number(value);
};

const resetSpacingItem = (item) => {
  const preset = resolveContainer(themePresetUi.value, item.container)?.[item.field];
  writeSpacing(item, preset ?? item.defaultValue);
};

// 分组重置：五项一起回到当前主题预设
const resetSpacing = () => {
  spacingFieldList.forEach(resetSpacingItem);
};

// 面板内容随语言重新生成，并给出当前数值、单位与可调范围
const spacingFields = computed(() => {
  i18n.global.locale.value;
  return spacingFieldList.map((item) => ({
    ...item,
    label: $t(item.labelKey),
    unit: item.unitKey ? $t(item.unitKey) : item.unit,
    value: readSpacing(item),
    range: uiParamRanges[`${item.container}.${item.field}`],
  }));
});

// 入口只概括上下/左右页边距，模块间距与行间距在面板内单独调
const spacingLabel = computed(() =>
  spacingFields.value
    .filter((item) => item.container === "page.padding")
    .map((item) => item.value)
    .join("/"),
);
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
      :label="$t('toolbarSpacing')"
      :value="spacingLabel"
      :active="dropdownVisible"
    />
    <template #dropdown>
      <SfScrollbar
        max-height="min(360px, max(0px, calc(100vh - 260px)))"
        class="rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <SettingSection
          :title="$t('pageLayout')"
          :reset-label="$t('reset')"
          @reset="resetSpacing"
        >
          <!-- 数值控件与数值范围沿用布局面板的同一套定义 -->
          <div class="flex w-72 flex-col gap-3 pb-3">
            <SettingNumberField
              v-for="item in spacingFields"
              :key="`${item.container}.${item.field}`"
              :label="item.label"
              :model-value="item.value"
              :min="item.range.min"
              :max="item.range.max"
              :step="item.range.step"
              :unit="item.unit"
              @update:model-value="(value) => writeSpacing(item, value)"
              @reset="resetSpacingItem(item)"
            />
          </div>
        </SettingSection>
      </SfScrollbar>
    </template>
  </SfDropdown>
</template>
