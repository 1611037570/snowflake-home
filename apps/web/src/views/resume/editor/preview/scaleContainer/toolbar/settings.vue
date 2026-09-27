<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import { defaultFooter } from "@/stores/modules/resume/config/uiConfig";
import {
  defaultLeftColumnWidth,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  uiParamRanges,
} from "@/stores/modules/resume/config/uiConfig";

const resumeStore = useResumeStore();
const { system, currentUI } = storeToRefs(resumeStore);
const { setPageLayout } = resumeStore;

// 页尾显示设置与布局参数集中在同一面板。
const showPageNumber = computed({
  get: () => system.value.showPageNumber,
  set: (value) => {
    system.value.showPageNumber = value;
  },
});
const footer = computed({
  get: () => currentUI.value?.footer ?? "",
  set: (value) => {
    currentUI.value.footer = value;
  },
});

// 页面布局数值参数：标签、绑定字段、默认值与单位集中维护，模板统一渲染
const layoutParams = [
  { labelKey: "layoutTopBottomMargin", key: "paddingVertical", defaultValue: defaultPaddingVertical, unit: "px" },
  {
    labelKey: "layoutLeftRightMargin",
    key: "paddingHorizontal",
    defaultValue: defaultPaddingHorizontal,
    unit: "px",
  },
  { labelKey: "layoutModuleSpacing", key: "moduleSpacing", defaultValue: defaultModuleSpacing, unit: "px" },
  // 左栏宽度占比：仅双栏布局生效，左栏保持为较窄的一栏
  {
    labelKey: "layoutLeftColumnWidth",
    key: "leftColumnWidth",
    defaultValue: defaultLeftColumnWidth,
    unit: "%",
  },
  {
    labelKey: "layoutParagraphSpacing",
    key: "paragraphSpacing",
    defaultValue: defaultParagraphSpacing,
    unit: "px",
  },
  // 行间距为字号倍数，单位与其它像素值不同
  { labelKey: "layoutLineHeight", key: "lineHeight", defaultValue: defaultLineHeight, unit: "lineHeightUnit" },
];

// 读取数值型参数：统一转为数值，避免字符串参与滑块内部计算；字段缺失时回退该参数的默认值
const getNumberValue = (key) => {
  const value = Number(currentUI.value?.[key]);
  if (Number.isFinite(value)) return value;
  const fallback = Number(layoutParams.find((item) => item.key === key)?.defaultValue);
  return Number.isFinite(fallback) ? fallback : 0;
};

// 恢复当前主题默认布局与全部数值参数
const resetLayout = () => {
  if (!currentUI.value) return;
  layoutParams.forEach((item) => {
    currentUI.value[item.key] = item.defaultValue;
  });
  setPageLayout(null);
};

// 显式布局下同步更新页边距、栏宽与模块间距
const syncPageLayoutParam = (key, value) => {
  const pageLayout = currentUI.value?.pageLayout;
  if (!pageLayout?.regions) return;
  const nextValue = Number(value);
  const nextLayout = {
    ...pageLayout,
    regions: pageLayout.regions.map((region) => ({
      ...region,
      columns: region.columns.map((column, index) => {
        if (key === "moduleSpacing") return { ...column, gap: nextValue };
        if (key === "leftColumnWidth" && region.columns.length === 2) {
          return {
            ...column,
            width: { mode: "ratio", value: index === 0 ? nextValue : 100 - nextValue },
          };
        }
        return column;
      }),
    })),
  };
  if (key === "paddingVertical") {
    nextLayout.pagePadding = {
      ...pageLayout.pagePadding,
      top: nextValue,
      bottom: nextValue,
    };
  }
  if (key === "paddingHorizontal") {
    nextLayout.pagePadding = {
      ...pageLayout.pagePadding,
      left: nextValue,
      right: nextValue,
    };
  }
  if (key === "moduleSpacing") nextLayout.regionGap = nextValue;
  setPageLayout(nextLayout);
};

// 写入参数：数值型统一使用数值类型
const setParam = (key, value) => {
  if (!currentUI.value) return;
  currentUI.value[key] = typeof value === "number" ? Number(value) : value;
  syncPageLayoutParam(key, value);
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
      <div
        class="flex w-[240px] flex-col gap-3 overflow-hidden rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <div class="flex items-center justify-between text-xs font-bold text-sf-text">
          <span>{{ $t("pageLayout") }}</span>
          <button
            type="button"
            class="flex items-center gap-3 rounded-lg px-3 py-1 font-normal text-sf-text-2 hover:bg-sf-bg-2 hover:text-sf-theme"
            @click="resetLayout"
          >
            <SfIcon icon="material-symbols:restart-alt" size="4" />
            {{ $t("restoreLayoutDefault") }}
          </button>
        </div>
        <div v-for="item in layoutParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span class="flex items-center gap-1">
              <span>{{ $t(item.labelKey) }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="setParam(item.key, item.defaultValue)"
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
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
