<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import { defaultPageBackground, pageBackgroundColors } from "@/domain/resume/theme/uiConfig";
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

// 简历页面背景色
const pageBackground = computed({
  get: () => currentUI.value?.page?.background || defaultPageBackground,
  set: (value) => {
    if (!getSettingRestriction("page.background")) currentUI.value.page.background = value;
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
