<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  datePositionList,
  dateStyleList,
  defaultAvatarPosition,
  defaultDatePosition,
  defaultDateStyle,
  defaultInfoSeparator,
  defaultInfoPosition,
  defaultLinkUnderline,
  defaultPageBackground,
  defaultTitleIconMode,
  defaultUserInfoLayout,
  defaultUserInfoMode,
  infoPositionList,
  infoSeparatorList,
  pageBackgroundColors,
  titleIconModeList,
  userInfoLayoutList,
  userInfoModeList,
} from "@/stores/modules/resume/config/uiConfig";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
// 低频视觉微调默认收起，常用外观选项保持直接可见。
const moreSettingsExpanded = ref([]);

// 个人信息属于简历视觉设计，与模板和模块样式统一管理
const localizeOptions = (options) => localizeResumeEditorOptionList(options);

const userInfoParams = computed(() => {
  i18n.global.locale.value;
  return [
    { label: $t("contactDisplay"), key: "user.infoMode", defaultValue: defaultUserInfoMode, list: localizeOptions(userInfoModeList) },
    { label: $t("contactLayout"), key: "user.infoLayout", defaultValue: defaultUserInfoLayout, list: localizeOptions(userInfoLayoutList) },
    { label: $t("avatarPosition"), key: "user.avatarPosition", defaultValue: defaultAvatarPosition, list: localizeOptions(avatarPositionList) },
    { label: $t("infoAlign"), key: "user.infoPosition", defaultValue: defaultInfoPosition, list: localizeOptions(infoPositionList) },
  ];
});

const localizedTitleIconModeList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(titleIconModeList);
});

const localizedDatePositionList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(datePositionList);
});

const localizedDateStyleList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(dateStyleList);
});

const localizedInfoSeparatorList = computed(() => {
  i18n.global.locale.value;
  return localizeOptions(infoSeparatorList);
});

// 通过独立计算属性绑定主题色，避免嵌套修改可写计算属性引发递归更新
const themeColor = computed({
  get: () => currentUI.value?.theme?.color || "",
  set: (value) => {
    if (currentUI.value && currentUI.value.theme.color !== value) {
      currentUI.value.theme.color = value;
    }
  },
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

// 经历排版属于简历视觉设计，与个人信息统一管理
const datePosition = computed({
  get: () => currentUI.value?.content?.datePosition,
  set: (value) => {
    currentUI.value.content.datePosition = value;
  },
});

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

// 简历页面背景色
const pageBackground = computed({
  get: () => currentUI.value?.page?.background || defaultPageBackground,
  set: (value) => {
    currentUI.value.page.background = value;
  },
});

const getValue = (key) => key.split(".").reduce((value, field) => value?.[field], currentUI.value);

const setParam = (key, value) => {
  if (!currentUI.value) return;
  const [group, field] = key.split(".");
  currentUI.value[group][field] = value;
};
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    popper-class="sf-theme-color-popper"
  >
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:swatch-book" size="5" />
      <span>{{ $t("design") }}</span>
    </span>
    <template #dropdown>
      <div class="flex w-80 flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="text-xs font-bold text-sf-text">{{ $t("themeColors") }}</div>
        <ThemeColorPicker v-model="themeColor" :teleported="false" />

        <div class="text-xs font-bold text-sf-text">{{ $t("resumeBackground") }}</div>
        <div class="grid grid-cols-3 gap-3">
          <SfButton
            v-for="option in pageBackgroundColors"
            :key="option.value"
            class="flex flex-col items-center gap-3"
            size="small"
            border
            @click="pageBackground = option.value"
            :type="pageBackground === option.value ? 'theme' : 'bg'"
          >
            <span
              class="h-6 w-6 rounded-full border border-sf-b"
              :style="{ backgroundColor: option.value }"
            />
            <span>{{ $t(option.name) }}</span>
          </SfButton>
        </div>

        <SfCollapse v-model="moreSettingsExpanded" :border="false" class="rounded-xl bg-sf-bg px-3">
          <SfCollapseItem name="design-more" lazy>
            <template #title>
              <span class="text-sm text-sf-text-2">{{ $t("designMore") }}</span>
            </template>
            <SfScrollbar
              max-height="min(360px, max(0px, calc(100vh - 260px)))"
              class="design-more-scroll w-full"
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
                      @click="titleIconMode = defaultTitleIconMode"
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
                      size="small"
                      border
                      @click="setParam(item.key, option.value)"
                      :type="getValue(item.key) === option.value ? 'theme' : 'bg'"
                      >{{ option.name }}</SfButton
                    >
                  </div>
                </div>

                <div class="text-xs font-bold text-sf-text">{{ $t("experienceLayout") }}</div>
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1 text-sm text-sf-text-2">
                    <span>{{ $t("timePosition") }}</span>
                    <SfIcon
                      icon="material-symbols:restart-alt"
                      size="4"
                      class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                      @click="datePosition = defaultDatePosition"
                    />
                  </div>
                  <div class="flex gap-3">
                    <SfButton
                      v-for="option in localizedDatePositionList"
                      :key="option.value"
                      class="flex-1"
                      size="small"
                      border
                      @click="datePosition = option.value"
                      :type="datePosition === option.value ? 'theme' : 'bg'"
                      >{{ option.name }}</SfButton
                    >
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1 text-sm text-sf-text-2">
                    <span>{{ $t("timeFormat") }}</span>
                    <SfIcon
                      icon="material-symbols:restart-alt"
                      size="4"
                      class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                      @click="dateStyle = defaultDateStyle"
                    />
                  </div>
                  <div class="flex gap-3">
                    <SfButton
                      v-for="option in localizedDateStyleList"
                      :key="option.value"
                      class="flex-1"
                      size="small"
                      border
                      @click="dateStyle = option.value"
                      :type="dateStyle === option.value ? 'theme' : 'bg'"
                      >{{ option.name }}</SfButton
                    >
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-1 text-sm text-sf-text-2">
                    <span>{{ $t("infoSeparator") }}</span>
                    <SfIcon
                      icon="material-symbols:restart-alt"
                      size="4"
                      class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                      @click="infoSeparator = defaultInfoSeparator"
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
          </SfCollapseItem>
        </SfCollapse>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss">
/* 取色器面板内联渲染在下拉弹层内，取消滚动容器裁剪，避免面板被弹层裁掉 */
.sf-theme-color-popper .el-scrollbar,
.sf-theme-color-popper .el-scrollbar__wrap {
  overflow: visible;
}

/* 下拉层中的更多设置使用独立滚动，避免受取色器溢出规则影响 */
.sf-theme-color-popper .design-more-scroll.el-scrollbar {
  overflow: hidden;
}

.sf-theme-color-popper .design-more-scroll .el-scrollbar__wrap {
  overflow: auto;
}
</style>
