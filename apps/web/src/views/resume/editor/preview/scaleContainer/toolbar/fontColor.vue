<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  darkPageBackground,
  fontColorOptions,
  fontColorOptionsOnDark,
} from "@/domain/resume/theme/uiConfig";
import { getResumeThemeTemplate } from "@/views/resume/theme";
import SettingPill from "./settingPill.vue";
import SettingSection from "./settingSection.vue";

const { currentUI } = storeToRefs(useResumeStore());
const dropdownVisible = ref(false);
// 字体灰度独立展示，继续写入原有字体颜色配置。
const fontColor = computed({
  get: () => currentUI.value?.font?.color || "#000",
  set: (value) => {
    if (currentUI.value) currentUI.value.font.color = value;
  },
});
// 统一短色值与完整色值的比较，保留主题自定义颜色的首档兜底。
const normalizeHexColor = (value) => {
  const color = String(value || "").toLowerCase();
  return /^#[0-9a-f]{3}$/.test(color)
    ? `#${color.slice(1).split("").map((item) => `${item}${item}`).join("")}`
    : color;
};
const options = computed(() =>
  normalizeHexColor(currentUI.value?.page?.background) === normalizeHexColor(darkPageBackground)
    ? fontColorOptionsOnDark
    : fontColorOptions,
);
const activeColor = computed(() =>
  (options.value.find((option) => normalizeHexColor(option.value) === normalizeHexColor(fontColor.value))
    ?? options.value[0]).value,
);
// 恢复灰度时沿用当前模板声明的初始字色。
const resetFontColor = () => {
  fontColor.value = getResumeThemeTemplate(currentUI.value?.theme?.template).item.ui.font.color;
};
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    @visible-change="dropdownVisible = $event"
  >
    <SettingPill compact :label="$t('fontColor')" :active="dropdownVisible">
      <!-- 字母下方色条对应当前正文字色，与参考图的字体颜色入口保持一致。 -->
      <span class="flex w-3 flex-col items-center leading-none">
        <span>A</span>
        <span class="h-[3px] w-3 rounded-full" :style="{ backgroundColor: fontColor }" />
      </span>
    </SettingPill>
    <template #dropdown>
      <div class="w-60 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <SettingSection :title="$t('fontColor')" :reset-label="$t('reset')" @reset="resetFontColor">
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="option in options"
              :key="option.value"
              type="button"
              class="h-6 w-6 cursor-pointer rounded-full border border-sf-b transition-colors hover:border-sf-theme"
              :class="{ 'border-2 border-sf-theme': activeColor === option.value }"
              :style="{ backgroundColor: option.value }"
              :aria-label="$t(option.name)"
              :aria-pressed="activeColor === option.value"
              @click="fontColor = option.value"
            />
          </div>
        </SettingSection>
      </div>
    </template>
  </SfDropdown>
</template>
