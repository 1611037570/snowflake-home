<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  defaultTextAlign,
  defaultFontFamily,
  defaultFontSize,
  defaultTitleFontSize,
  fontFamilyList,
  textAlignList,
  uiParamRanges,
} from "@/stores/modules/resume/config/uiConfig";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 字体类数值参数：标签、绑定字段与默认值集中维护，模板统一渲染
const fontParams = computed(() => {
  i18n.global.locale.value;
  return [
    { label: $t("fontSize"), key: "fontSize", defaultValue: defaultFontSize },
    { label: $t("moduleTitleFontSize"), key: "titleFontSize", defaultValue: defaultTitleFontSize },
  ];
});

const localizedFontFamilyList = computed(() => {
  i18n.global.locale.value;
  return localizeResumeEditorOptionList(fontFamilyList);
});

const localizedTextAlignList = computed(() => {
  i18n.global.locale.value;
  return localizeResumeEditorOptionList(textAlignList);
});

// 字体类型（阿里普惠体 / 汉仪易烊千玺体 / 跟随系统）
const fontFamily = computed({
  get: () => currentUI.value?.fontFamily,
  set: (value) => {
    currentUI.value.fontFamily = value;
  },
});

// 文本对齐属于正文排版，与字体配置放在同一入口
const textAlign = computed({
  get: () => currentUI.value?.textAlign,
  set: (value) => {
    currentUI.value.textAlign = value;
  },
});

// 读取数值型参数：统一转为数值，缺失时回退默认值，避免出现 NaN
const getNumberValue = (key, defaultValue) => {
  const value = Number(currentUI.value?.[key]);
  return Number.isFinite(value) ? value : defaultValue;
};

// 写入数值型参数
const setParam = (key, value) => {
  if (!currentUI.value) return;
  currentUI.value[key] = Number(value);
};
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:type" size="5" />
      <span>{{ $t("layout") }}</span>
    </span>
    <template #dropdown>
      <div
        class="flex w-[240px] flex-col gap-3 overflow-hidden rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <!-- 字体类型选择 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>{{ $t("fontTypes") }}</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="fontFamily = defaultFontFamily"
            />
          </div>
          <SfSelect v-model="fontFamily" :list="localizedFontFamilyList" />
        </div>

        <div v-for="item in fontParams" :key="item.key" class="flex flex-col gap-1">
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
            <span>{{ getNumberValue(item.key, item.defaultValue) }}px</span>
          </div>
          <SfSlider
            :model-value="getNumberValue(item.key, item.defaultValue)"
            @update:model-value="(value) => setParam(item.key, value)"
            :min="uiParamRanges[item.key].min"
            :max="uiParamRanges[item.key].max"
            :step="uiParamRanges[item.key].step"
            size="small"
          />
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>{{ $t("textAlign") }}</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="textAlign = defaultTextAlign"
            />
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="option in localizedTextAlignList"
              :key="option.value"
              class="flex-1"
              size="small"
              border
              @click="textAlign = option.value"
              :type="textAlign === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
            >
          </div>
        </div>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
