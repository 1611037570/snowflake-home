<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  darkPageBackground,
  defaultPageBackground,
  fontColorOptions,
  fontColorOptionsOnDark,
  pageBackgroundColors,
} from "@/domain/resume/theme/uiConfig";
import { getResumeThemeTemplate, resolveThemeSettingRestrictions } from "@/views/resume/theme";
import CustomColorPicker from "@/components/business/themeColorPicker/customColorPicker.vue";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";
import SettingSection from "./settingSection.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const dropdownVisible = ref(false); // 设计面板打开时保持工具栏入口选中态
// 设计分组重置时恢复当前主题声明的初始外观。
const themePresetUi = computed(
  () => getResumeThemeTemplate(currentUI.value?.theme?.template).item.ui,
);
// 不支持的设置保持可见，由外观声明给出原因并阻止写入。
const settingRestrictions = computed(() => resolveThemeSettingRestrictions(currentUI.value?.theme?.template));
const getSettingRestriction = (key) => settingRestrictions.value[key] ? $t(settingRestrictions.value[key]) : "";

// 通过独立计算属性绑定主题色，避免嵌套修改可写计算属性引发递归更新
const themeColor = computed({
  get: () => currentUI.value?.theme?.color || "",
  set: (value) => {
    if (currentUI.value && currentUI.value.theme.color !== value) {
      currentUI.value.theme.color = value;
    }
  },
});

// 正文颜色使用固定灰度预设，模板值作为初始值，用户选择后写入当前简历配置。
const fontColor = computed({
  get: () => currentUI.value?.font?.color || "#000",
  set: (value) => {
    if (currentUI.value && currentUI.value.font.color !== value) {
      currentUI.value.font.color = value;
    }
  },
});

// 三位与六位十六进制颜色按同一颜色比较，模板使用 #000000 时也能命中默认黑色。
const normalizeHexColor = (value) => {
  const color = String(value || "").toLowerCase();
  return /^#[0-9a-f]{3}$/.test(color)
    ? `#${color.slice(1).split("").map((item) => `${item}${item}`).join("")}`
    : color;
};

// 极致黑视为深色底，其余背景按浅色底处理
const isDarkBackground = (value) => normalizeHexColor(value) === normalizeHexColor(darkPageBackground);

// 背景明暗切换时把当前字体色映射到另一档阶梯的同层级色值，避免黑底黑字与白底白字
const syncFontColorWithBackground = (nextBackground) => {
  const toDarkPage = isDarkBackground(nextBackground);
  const fromList = toDarkPage ? fontColorOptions : fontColorOptionsOnDark;
  const toList = toDarkPage ? fontColorOptionsOnDark : fontColorOptions;
  const matched = fromList.findIndex((option) => normalizeHexColor(option.value) === normalizeHexColor(fontColor.value));
  // 模板自定义的字体色不在阶梯内时，取目标阶梯首档保证正文对比度
  fontColor.value = toList[matched > -1 ? matched : 0].value;
};

// 简历页面背景色
const pageBackground = computed({
  get: () => currentUI.value?.page?.background || defaultPageBackground,
  set: (value) => {
    if (getSettingRestriction("page.background")) return;
    const previous = currentUI.value?.page?.background || defaultPageBackground;
    // 替换页面配置对象，确保分页预览、全屏预览与导出同时收到背景色变化。
    currentUI.value = {
      ...currentUI.value,
      page: {
        ...currentUI.value.page,
        background: value,
      },
    };
    // 跨明暗切换背景时同步字体颜色，同明暗内换色不动字体
    if (isDarkBackground(value) !== isDarkBackground(previous)) syncFontColorWithBackground(value);
  },
});

// 当前主题声明的页面背景独立展示在分组标题右侧。
const themePageBackground = computed(
  () => themePresetUi.value.page.background || defaultPageBackground,
);
// 固定背景预设始终完整展示，默认白色不因与主题背景重复而隐藏。
const pageBackgroundOptions = computed(() => pageBackgroundColors);

const isPageBackgroundActive = (value) =>
  normalizeHexColor(pageBackground.value) === normalizeHexColor(value);

// 主题色分组仅恢复当前主题的初始主题色。
const resetThemeColor = () => {
  themeColor.value = themePresetUi.value.theme.color;
};

// 页面背景分组通过现有写入入口恢复，继续处理明暗背景的文字对比度。
const resetPageBackground = () => {
  pageBackground.value = themePresetUi.value.page.background || defaultPageBackground;
};
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    popper-class="sf-theme-color-popper"
    @visible-change="dropdownVisible = $event"
  >
    <span
      class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[11px] text-sf-text-2 transition-colors hover:bg-sf-bg"
      :class="{ 'bg-sf-bg text-sf-theme!': dropdownVisible }"
    >
      <SfIcon icon="lucide:swatch-book" size="4" />
      <span class="whitespace-nowrap">{{ $t("design") }}</span>
    </span>
    <template #dropdown>
      <div class="flex w-80 flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <SettingSection :title="$t('themeColors')" :reset-label="$t('reset')" @reset="resetThemeColor">
          <template #right>
            <CustomColorPicker v-model="themeColor" :label="$t('customColor')" />
          </template>
          <ThemeColorPicker v-model="themeColor" />
        </SettingSection>

        <SettingSection :title="$t('resumeBackground')" :reset-label="$t('reset')" @reset="resetPageBackground">
          <template #right>
            <!-- 主题声明的页面背景独立放在标题右侧。 -->
            <button
              type="button"
              class="flex cursor-pointer items-center gap-1 rounded-full border border-sf-b p-1 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
              :class="{
                'border-2 border-sf-theme': isPageBackgroundActive(themePageBackground),
                'cursor-not-allowed! opacity-60': Boolean(getSettingRestriction('page.background')),
              }"
              :aria-label="$t('themeDefaultOption')"
              :aria-pressed="isPageBackgroundActive(themePageBackground)"
              :disabled="Boolean(getSettingRestriction('page.background'))"
              @click="pageBackground = themePageBackground"
            >
              <span>{{ $t("themeDefaultOption") }}</span>
              <span
                class="h-4 w-4 shrink-0 rounded-full border border-sf-b"
                :style="{ backgroundColor: themePageBackground }"
              />
            </button>
          </template>
          <p v-if="getSettingRestriction('page.background')" class="text-xs text-sf-text-2">
            {{ getSettingRestriction("page.background") }}
          </p>
          <!-- 简历背景仅保留圆形色块，选中项使用主题色边框。 -->
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="option in pageBackgroundOptions"
              :key="option.value"
              type="button"
              class="h-6 w-6 cursor-pointer rounded-full border border-sf-b transition-all duration-200 hover:scale-110"
              :class="{
                'border-2 border-sf-theme': isPageBackgroundActive(option.value),
                'cursor-not-allowed! opacity-60': Boolean(getSettingRestriction('page.background')),
              }"
              :style="{ backgroundColor: option.value }"
              :aria-label="$t(option.name)"
              :aria-pressed="isPageBackgroundActive(option.value)"
              :disabled="Boolean(getSettingRestriction('page.background'))"
              @click="pageBackground = option.value"
            />
          </div>
        </SettingSection>
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
</style>
