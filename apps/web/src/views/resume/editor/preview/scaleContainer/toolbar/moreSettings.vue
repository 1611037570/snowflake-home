<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  dateStyleList,
  defaultInfoSeparator,
  defaultLinkUnderline,
  defaultUserInfoMode,
  infoSeparatorList,
  titleIconModeList,
  userInfoModeList,
} from "@/domain/resume/theme/uiConfig";
import { getResumeThemeTemplate, resolveThemeSettingRestrictions } from "@/views/resume/theme";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
// 视觉参数重置统一回到当前主题预设。
const themePresetUi = computed(
  () => getResumeThemeTemplate(currentUI.value?.theme?.template).item.ui,
);
const getThemeDefault = (key) =>
  key.split(".").reduce((value, field) => value?.[field], themePresetUi.value);
// 不支持的设置保持可见，由外观声明给出原因并阻止写入。
const settingRestrictions = computed(() =>
  resolveThemeSettingRestrictions(currentUI.value?.theme?.template),
);
const getSettingRestriction = (key) =>
  settingRestrictions.value[key] ? $t(settingRestrictions.value[key]) : "";

// 个人信息属于简历视觉设计，与模板和模块样式统一管理
const localizeOptions = (options) => localizeResumeEditorOptionList(options);

const userInfoParams = computed(() => {
  i18n.global.locale.value;
  return [
    {
      label: $t("contactDisplay"),
      key: "user.infoMode",
      defaultValue: defaultUserInfoMode,
      list: localizeOptions(userInfoModeList),
    },
  ];
});

const localizedTitleIconModeList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(titleIconModeList);
});

const localizedDateStyleList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(dateStyleList);
});

const localizedInfoSeparatorList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(infoSeparatorList);
});

// 模块标题图标模式
const titleIconMode = computed({
  get: () => currentUI.value?.theme?.titleIconMode,
  set: (value) => {
    currentUI.value.theme.titleIconMode = value;
  },
});

// 链接下划线开关
const linkUnderline = computed({
  get: () => currentUI.value?.content?.linkUnderline ?? defaultLinkUnderline,
  set: (value) => {
    currentUI.value.content.linkUnderline = value;
  },
});

// 经历排版的时间格式与信息分隔保留在细节调整分组
const dateStyle = computed({
  get: () => currentUI.value?.content?.dateStyle,
  set: (value) => {
    currentUI.value.content.dateStyle = value;
  },
});

const infoSeparator = computed({
  get: () => currentUI.value?.content?.infoSeparator ?? defaultInfoSeparator,
  set: (value) => {
    currentUI.value.content.infoSeparator = value;
  },
});

const getValue = (key) => key.split(".").reduce((value, field) => value?.[field], currentUI.value);

const setParam = (key, value) => {
  if (!currentUI.value || getSettingRestriction(key)) return;
  const [group, field] = key.split(".");
  currentUI.value[group][field] = value;
};
</script>

<template>
  <SfDropdown v-if="currentUI" trigger="click" placement="bottom-start" :show-arrow="false">
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:sliders-horizontal" size="5" />
      <span>{{ $t("designMore") }}</span>
    </span>
    <template #dropdown>
      <SfScrollbar
        max-height="min(360px, max(0px, calc(100vh - 260px)))"
        class="w-80 rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <div class="flex flex-col gap-3 pb-3">
          <div class="text-xs font-bold text-sf-text">{{ $t("detailAdjustments") }}</div>
          <!-- 模块标题图标模式 -->
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 text-sm text-sf-text-2">
              <span>{{ $t("titleIconMode") }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="titleIconMode = themePresetUi.theme.titleIconMode"
              />
            </div>
            <SfSelect v-model="titleIconMode" :list="localizedTitleIconModeList" />
          </div>
          <!-- 链接下划线开关：统一控制预览中的可点击链接样式 -->
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span>{{ $t("linkUnderline") }}</span>
            <ElSwitch v-model="linkUnderline" />
          </div>
          <div class="text-xs font-bold text-sf-text">{{ $t("personalInfo") }}</div>
          <div v-for="item in userInfoParams" :key="item.key" class="flex flex-col gap-1">
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
                :class="{
                  'text-sf-text-disabled! cursor-not-allowed!': getSettingRestriction(item.key),
                }"
                @click="setParam(item.key, getThemeDefault(item.key))"
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
                @click="setParam(item.key, option.value)"
                :type="getValue(item.key) === option.value ? 'theme' : 'bg'"
                >{{ option.name }}</SfButton
              >
            </div>
          </div>

          <div class="text-xs font-bold text-sf-text">{{ $t("experienceLayout") }}</div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 text-sm text-sf-text-2">
              <span>{{ $t("timeFormat") }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="dateStyle = themePresetUi.content.dateStyle"
              />
            </div>
            <SfSelect v-model="dateStyle" :list="localizedDateStyleList" />
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-1 text-sm text-sf-text-2">
              <span>{{ $t("infoSeparator") }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="infoSeparator = themePresetUi.content.infoSeparator"
              />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <SfButton
                v-for="option in localizedInfoSeparatorList"
                :key="option.value"
                size="small"
                border
                @click="infoSeparator = option.value"
                :type="infoSeparator === option.value ? 'theme' : 'bg'"
                >{{ option.name }}</SfButton
              >
            </div>
          </div>
        </div>
      </SfScrollbar>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
