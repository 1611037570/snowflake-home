<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  defaultPageBackground,
  defaultSubtitleCenter,
  fontColorOptions,
  pageBackgroundColors,
} from "@/domain/resume/theme/uiConfig";
import { resolveThemeSettingRestrictions } from "@/views/resume/theme";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
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
const isFontColorActive = (value) => normalizeHexColor(fontColor.value) === normalizeHexColor(value);

// 简历页面背景色
const pageBackground = computed({
  get: () => currentUI.value?.page?.background || defaultPageBackground,
  set: (value) => {
    if (!getSettingRestriction("page.background")) currentUI.value.page.background = value;
  },
});

// 副标题居中开关：教育经历的专业在条目内居中。
const subtitleCenter = computed({
  get: () => currentUI.value?.content?.subtitleCenter ?? defaultSubtitleCenter,
  set: (value) => {
    currentUI.value.content.subtitleCenter = value;
  },
});
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

        <div class="text-xs font-bold text-sf-text">{{ $t("fontColor") }}</div>
        <div class="flex items-center gap-3">
          <button
            v-for="option in fontColorOptions"
            :key="option.value"
            type="button"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-transform hover:scale-110"
            :class="isFontColorActive(option.value) ? 'border-2 border-sf-theme' : 'border-sf-b'"
            :title="$t(option.name)"
            :aria-label="$t(option.name)"
            :aria-pressed="isFontColorActive(option.value)"
            @click="fontColor = option.value"
          >
            <span class="h-6 w-6 rounded-full" :style="{ backgroundColor: option.value }" />
          </button>
        </div>

        <div class="text-xs font-bold text-sf-text">{{ $t("resumeBackground") }}</div>
        <p v-if="getSettingRestriction('page.background')" class="text-xs text-sf-text-2">
          {{ getSettingRestriction("page.background") }}
        </p>
        <div class="grid grid-cols-3 gap-3">
          <SfButton
            v-for="option in pageBackgroundColors"
            :key="option.value"
            class="flex flex-col items-center gap-3"
            size="small"
            border
            :disabled="Boolean(getSettingRestriction('page.background'))"
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
        <!-- 副标题居中设置归入设计面板。 -->
        <div class="flex items-center justify-between text-sm text-sf-text-2">
          <span>{{ $t("subtitleCenter") }}</span>
          <ElSwitch v-model="subtitleCenter" />
        </div>
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
