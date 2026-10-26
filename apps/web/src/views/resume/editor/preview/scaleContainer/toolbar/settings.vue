<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  defaultAvatarPosition,
  defaultDatePosition,
  datePositionList,
  defaultFooter,
  defaultFooterTemplate,
  defaultInfoPosition,
  defaultLeftColumnWidth,
  defaultSubtitleCenter,
  defaultTextAlign,
  footerTemplateList,
  infoPositionList,
  textAlignList,
  uiParamRanges,
  defaultUserInfoLayout,
  userInfoLayoutList,
} from "@/domain/resume/theme/uiConfig";
import { DEFAULT_SYSTEM } from "@/stores/modules/resume/config/defaultConfig";
import { layoutUsesColumns } from "@/domain/resume/theme/layouts";
import {
  getResumeThemeTemplate,
  resolveThemeDecisions,
  resolveThemeSettingRestrictions,
} from "@/views/resume/theme";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import SettingSection from "./settingSection.vue";
import SettingNumberField from "./settingNumberField.vue";

const resumeStore = useResumeStore();
const { system, currentUI } = storeToRefs(resumeStore);
const dropdownVisible = ref(false); // 布局面板打开时保持工具栏入口选中态

// 页尾显示设置与布局参数集中在同一面板。
const showPageNumber = computed({
  get: () => system.value.showPageNumber,
  set: (value) => {
    system.value.showPageNumber = value;
  },
});
const footer = computed({
  get: () => currentUI.value?.page?.footer ?? defaultFooter,
  set: (value) => {
    currentUI.value.page.footer = value;
  },
});
// 页尾模板编号由简历配置保存，选项从模板清单读取。
const footerTemplate = computed({
  get: () => currentUI.value?.page?.footerTemplate ?? defaultFooterTemplate,
  set: (value) => {
    currentUI.value.page.footerTemplate = value;
  },
});
// 副标题居中属于排版选项，继续写入原有简历配置。
const subtitleCenter = computed({
  get: () => currentUI.value?.content?.subtitleCenter ?? defaultSubtitleCenter,
  set: (value) => {
    currentUI.value.content.subtitleCenter = value;
  },
});

// 左栏宽度占比：仅双栏布局展示
const leftColumnWidthParam = {
  labelKey: "layoutLeftColumnWidth",
  key: "layout.leftColumnWidth",
  defaultValue: defaultLeftColumnWidth,
  unit: "%",
};
// 页边距、模块间距与行间距已移到视图条的「间距」「行距」入口，这里只保留版式相关的左栏宽度
const layoutParams = [leftColumnWidthParam];

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
    // 文本对齐同属正文排版，并入布局选项统一渲染
    { label: $t("textAlign"), key: "content.textAlign", list: textAlignList },
  ].map((item) => ({ ...item, list: localizeResumeEditorOptionList(item.list) }));
});

const layoutOptionDefaults = {
  "user.infoLayout": defaultUserInfoLayout, // 个人信息布局默认值
  "user.avatarPosition": defaultAvatarPosition, // 头像位置默认值
  "user.infoPosition": defaultInfoPosition, // 个人信息对齐默认值
  "content.datePosition": defaultDatePosition, // 经历日期位置默认值
  "content.textAlign": defaultTextAlign, // 文本对齐默认值
};

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
  return layoutParams.find((item) => item.key === key)?.defaultValue ?? layoutOptionDefaults[key];
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
// 数字输入清空期间不写入无效值，继续沿用滑块的参数范围。
const setNumberParam = (key, value) => {
  if (Number.isFinite(value)) setParam(key, value);
};

// 页面布局分组仅恢复当前可见的数值参数。
const resetPageLayout = () => {
  visibleLayoutParams.value.forEach((item) => setParam(item.key, getParamDefault(item.key)));
};

// 内容布局分组恢复排版选项与副标题位置。
const resetContentLayout = () => {
  layoutOptionParams.value.forEach((item) => setParam(item.key, getParamDefault(item.key)));
  subtitleCenter.value = defaultSubtitleCenter;
};

// 页尾分组恢复显示状态、页码模板与默认空文案。
const resetFooterSettings = () => {
  showPageNumber.value = DEFAULT_SYSTEM.showPageNumber;
  footerTemplate.value = defaultFooterTemplate;
  footer.value = defaultFooter;
};
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false" @visible-change="dropdownVisible = $event">
    <span
      class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[11px] text-sf-text-2 transition-colors hover:bg-sf-bg"
      :class="{ 'bg-sf-bg text-sf-theme!': dropdownVisible }"
    >
      <SfIcon icon="lucide:layout-template" size="4" />
      <span class="whitespace-nowrap">{{ $t("layout") }}</span>
    </span>
    <template #dropdown>
      <SfScrollbar
        max-height="min(360px, max(0px, calc(100vh - 260px)))"
        class="w-80 rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <div class="flex flex-col gap-3 pb-3">
          <!-- 单栏布局没有左栏宽度可调，这一组随之隐藏 -->
          <SettingSection
            v-if="visibleLayoutParams.length"
            :title="$t('pageLayout')"
            :reset-label="$t('reset')"
            @reset="resetPageLayout"
          >
            <SettingNumberField
              v-for="item in visibleLayoutParams"
              :key="item.key"
              :label="$t(item.labelKey)"
              :model-value="getNumberValue(item.key)"
              :min="uiParamRanges[item.key].min"
              :max="uiParamRanges[item.key].max"
              :step="uiParamRanges[item.key].step"
              :unit="item.unit"
              @update:model-value="(value) => setNumberParam(item.key, value)"
              @reset="setParam(item.key, getParamDefault(item.key))"
            />
          </SettingSection>
          <!-- 个人信息与经历日期的排版选项：与页面数值参数共用同一入口 -->
          <SettingSection :title="$t('contentLayout')" :reset-label="$t('reset')" @reset="resetContentLayout">
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
              <div class="flex gap-1">
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
              <span>{{ $t("subtitleCenter") }}</span>
              <ElSwitch v-model="subtitleCenter" />
            </div>
          </SettingSection>
          <SettingSection :title="$t('footerSettings')" :reset-label="$t('reset')" @reset="resetFooterSettings">
            <div class="flex items-center justify-between text-sm text-sf-text-2">
              <span>{{ $t("showPageNumber") }}</span>
              <ElSwitch v-model="showPageNumber" />
            </div>
            <div v-if="showPageNumber" class="flex flex-col gap-1">
              <span class="text-sm text-sf-text-2">{{ $t("footerTemplate") }}</span>
              <div class="grid grid-cols-2 gap-1">
                <SfButton v-for="option in footerTemplateList" :key="option.value" class="w-full" :class="{ 'col-span-2': option.value === 'total' }" size="small" border :type="footerTemplate === option.value ? 'theme' : 'bg'" @click="footerTemplate = option.value">{{ $t(option.labelKey) }}</SfButton>
              </div>
            </div>
            <div v-if="showPageNumber" class="flex flex-col gap-1">
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
          </SettingSection>
        </div>
      </SfScrollbar>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
