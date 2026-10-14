<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import { defaultFooter } from "@/domain/resume/theme/uiConfig";
import {
  avatarPositionList,
  datePositionList,
  defaultLeftColumnWidth,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  infoPositionList,
  uiParamRanges,
  userInfoLayoutList,
} from "@/domain/resume/theme/uiConfig";
import { layoutUsesColumns } from "@/domain/resume/theme/layouts";
import {
  getResumeThemeTemplate,
  resolveThemeDecisions,
  resolveThemeSettingRestrictions,
} from "@/views/resume/theme";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";

const resumeStore = useResumeStore();
const { system, currentUI } = storeToRefs(resumeStore);

// 页尾显示设置与布局参数集中在同一面板。
const showPageNumber = computed({
  get: () => system.value.showPageNumber,
  set: (value) => {
    system.value.showPageNumber = value;
  },
});
const footer = computed({
  get: () => currentUI.value?.page?.footer ?? "",
  set: (value) => {
    currentUI.value.page.footer = value;
  },
});

// 左栏宽度占比：仅双栏布局展示，位置固定在参数列表最上方
const leftColumnWidthParam = {
  labelKey: "layoutLeftColumnWidth",
  key: "layout.leftColumnWidth",
  defaultValue: defaultLeftColumnWidth,
  unit: "%",
};
// 页面布局数值参数：标签、绑定字段、默认值与单位集中维护，模板统一渲染
const layoutParams = [
  leftColumnWidthParam,
  { labelKey: "layoutTopBottomMargin", key: "page.padding.vertical", defaultValue: defaultPaddingVertical, unit: "px" },
  {
    labelKey: "layoutLeftRightMargin",
    key: "page.padding.horizontal",
    defaultValue: defaultPaddingHorizontal,
    unit: "px",
  },
  { labelKey: "layoutModuleSpacing", key: "page.spacing.module", defaultValue: defaultModuleSpacing, unit: "px" },
  {
    labelKey: "layoutParagraphSpacing",
    key: "page.spacing.paragraph",
    defaultValue: defaultParagraphSpacing,
    unit: "px",
  },
  // 行间距为字号倍数，单位与其它像素值不同
  { labelKey: "layoutLineHeight", key: "font.lineHeight", defaultValue: defaultLineHeight, unit: "lineHeightUnit" },
];

// 版式由主题定义决定；主题预设保存着当前主题的数值参数，恢复默认时以它为准而不是全局默认值
const layoutType = computed(() => resolveThemeDecisions(currentUI.value?.theme?.template).layoutType);
const themePresetUi = computed(() => getResumeThemeTemplate(currentUI.value?.theme?.template).item.ui);

// 单栏布局不分配左右栏，隐藏左栏宽度参数
const visibleLayoutParams = computed(() =>
  layoutUsesColumns(layoutType.value)
    ? layoutParams
    : layoutParams.filter((item) => item !== leftColumnWidthParam),
);

// 并入布局的排版选项：个人信息与经历日期的水平位置，选项名称随语言重新生成
const layoutOptionParams = computed(() => {
  i18n.global.locale.value;
  return [
    { label: $t("contactLayout"), key: "user.infoLayout", list: userInfoLayoutList },
    { label: $t("avatarPosition"), key: "user.avatarPosition", list: avatarPositionList },
    { label: $t("infoAlign"), key: "user.infoPosition", list: infoPositionList },
    { label: $t("timePosition"), key: "content.datePosition", list: datePositionList },
  ].map((item) => ({ ...item, list: localizeResumeEditorOptionList(item.list) }));
});

// 主题固定的选项保持可见，由限制说明给出原因并阻止写入
const settingRestrictions = computed(() =>
  resolveThemeSettingRestrictions(currentUI.value?.theme?.template),
);
const getSettingRestriction = (key) =>
  settingRestrictions.value[key] ? $t(settingRestrictions.value[key]) : "";

const getPathValue = (source, path) => path.split(".").reduce((value, key) => value?.[key], source);
const setPathValue = (source, path, value) => {
  const keys = path.split(".");
  const field = keys.pop();
  const parent = keys.reduce((target, key) => target[key], source);
  parent[field] = value;
};

// 参数的主题默认值：主题预设里没有该字段时回退全局默认值
const getParamDefault = (key) => {
  const presetValue = getPathValue(themePresetUi.value, key);
  if (presetValue !== undefined && presetValue !== null) return presetValue;
  return layoutParams.find((item) => item.key === key)?.defaultValue;
};

// 读取数值型参数：统一转为数值，避免字符串参与滑块内部计算；字段缺失时回退该参数的默认值
const getNumberValue = (key) => {
  const value = Number(getPathValue(currentUI.value, key));
  if (Number.isFinite(value)) return value;
  const fallback = Number(getParamDefault(key));
  return Number.isFinite(fallback) ? fallback : 0;
};

// 读取选项参数的当前值：与数值参数共用路径解析
const getValue = (key) => getPathValue(currentUI.value, key);

// 写入参数：数值型统一使用数值类型，主题固定的设置不接受修改
const setParam = (key, value) => {
  if (!currentUI.value || settingRestrictions.value[key]) return;
  setPathValue(currentUI.value, key, typeof value === "number" ? Number(value) : value);
};
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:layout-template" size="5" />
    <span>{{ $t("layout") }}</span>
    </span>
    <template #dropdown>
      <SfScrollbar
        max-height="min(360px, max(0px, calc(100vh - 260px)))"
        class="w-80 rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <div class="flex flex-col gap-3 pb-3">
          <div class="text-xs font-bold text-sf-text">{{ $t("pageLayout") }}</div>
          <div v-for="item in visibleLayoutParams" :key="item.key" class="flex flex-col gap-1">
            <div class="flex items-center justify-between text-sm text-sf-text-2">
              <span class="flex items-center gap-1">
                <span>{{ $t(item.labelKey) }}</span>
                <SfIcon
                  icon="material-symbols:restart-alt"
                  size="4"
                  class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                  @click="setParam(item.key, getParamDefault(item.key))"
                />
              </span>
              <span>{{ getNumberValue(item.key) }}{{ item.unit === "lineHeightUnit" ? $t(item.unit) : item.unit }}</span>
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
          <!-- 个人信息与经历日期的排版选项：与页面数值参数共用同一入口 -->
          <div v-for="item in layoutOptionParams" :key="item.key" class="flex flex-col gap-1">
            <p v-if="getSettingRestriction(item.key)" class="text-xs text-sf-text-2">
              {{ getSettingRestriction(item.key) }}
            </p>
            <div class="flex items-center gap-1 text-sm text-sf-text-2">
              <span>{{ item.label }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                :aria-disabled="Boolean(getSettingRestriction(item.key))"
                :class="{ 'cursor-not-allowed! text-sf-text-disabled!': getSettingRestriction(item.key) }"
                @click="setParam(item.key, getParamDefault(item.key))"
              />
            </div>
            <div class="flex gap-3">
              <SfButton
                v-for="option in item.list"
                :key="option.value"
                class="flex-1"
                size="small"
                border
                :disabled="Boolean(getSettingRestriction(item.key))"
                :type="getValue(item.key) === option.value ? 'theme' : 'bg'"
                @click="setParam(item.key, option.value)"
                >{{ option.name }}</SfButton
              >
            </div>
          </div>
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span>{{ $t("showPageNumber") }}</span>
            <ElSwitch v-model="showPageNumber" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 text-sm text-sf-text-2">
              <span>{{ $t("customFooter") }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="footer = defaultFooter"
              />
              <SfTooltip :content="$t('customFooterTip')" />
            </div>
            <SfInput v-model="footer" :placeholder="$t('customFooterPlaceholder')" clearable />
          </div>
        </div>
      </SfScrollbar>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
