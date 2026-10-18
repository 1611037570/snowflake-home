<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import {
  AVATAR_RADIUS_LIMITS,
  AVATAR_WIDTH_LIMITS,
  DEFAULT_AVATAR_APPEARANCE,
  DEFAULT_PORTRAIT_AVATAR_SIZE,
} from "@/domain/resume/theme/avatar";
import { resolveThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import Icon from "../icon.vue";

const resumeStore = useResumeStore();

// 头像外观保存在简历 ui.user.avatar，旧简历缺失字段时读取统一默认值
const avatar = computed(() => ({
  ...DEFAULT_AVATAR_APPEARANCE,
  ...(resumeStore.currentUI?.user?.avatar || {}),
}));
const avatarRadius = computed(() => {
  if (avatar.value.borderRadius !== null) return avatar.value.borderRadius;
  if (avatar.value.shape === "circle") return AVATAR_RADIUS_LIMITS.max;
  if (avatar.value.shape === "rounded") return 10;
  return AVATAR_RADIUS_LIMITS.min;
});
const setAvatarValue = (key, value) => {
  resumeStore.currentUI.user.avatar = { ...avatar.value, [key]: value };
};
// 自定义圆角保留当前展示值，其他预设由圆角类型本身决定。
const setAvatarShape = (value) => {
  resumeStore.currentUI.user.avatar = {
    ...avatar.value,
    shape: value,
    borderRadius: value === "custom" ? avatarRadius.value : null,
    ...(value === "circle" ? { ratio: "1:1" } : {}),
  };
};
// 一寸照预设统一写入比例、形状和标准展示宽度
const applyOneInchAvatar = () => {
  resumeStore.currentUI.user.avatar = {
    ...avatar.value,
    ratio: "5:7",
    shape: "square",
    width: DEFAULT_PORTRAIT_AVATAR_SIZE.width,
    borderRadius: 0,
  };
};
const resetAvatar = () => {
  resumeStore.currentUI.user.avatar = { ...DEFAULT_AVATAR_APPEARANCE };
};
// 未自定义大小时，控制面板展示当前主题声明的真实头像宽度
const themeAvatarSize = computed(() =>
  resolveThemeDecisions(resumeStore.currentUI?.theme?.template).avatarSize,
);
const avatarWidth = computed(() => avatar.value.width ?? themeAvatarSize.value.width);
const ratioOptions = computed(() => [
  { name: "1:1", value: "1:1" },
  { name: "4:3", value: "4:3" },
  { name: "3:4", value: "3:4" },
  { name: "16:9", value: "16:9" },
  { name: $t("customRatio"), value: "custom" },
]);
const shapeOptions = computed(() => [
  { name: $t("squareAvatar"), value: "square" },
  { name: $t("roundedAvatar"), value: "rounded" },
  { name: $t("circleAvatar"), value: "circle" },
  { name: $t("customRatio"), value: "custom" },
]);
</script>

<template>
  <!-- 与专业技能、荣誉证书一致，在模块标题操作区打开独立样式下拉。 -->
  <span class="flex items-center" @click.stop @mousedown.stop>
    <SfDropdown
      trigger="click"
      placement="bottom-start"
      :show-arrow="false"
      :hide-on-click="false"
    >
      <SfTooltip :content="$t('avatarSettings')">
        <Icon
          click-through
          icon="lucide:layout-template"
          :aria-label="$t('avatarSettings')"
          aria-haspopup="menu"
        />
      </SfTooltip>
      <template #dropdown>
        <div
          class="flex w-[360px] max-w-[90vw] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-xs font-normal text-sf-text-2">{{ $t("avatarSettings") }}</p>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="resetAvatar"
            />
          </div>
          <div class="flex items-center justify-between gap-3 border-t border-sf-b pt-3">
            <span class="text-xs text-sf-text-2">{{ $t("avatarPreset") }}</span>
            <SfButton size="small" border @click="applyOneInchAvatar">{{ $t("oneInchPhoto") }}</SfButton>
          </div>
          <div class="flex flex-col gap-3 border-t border-sf-b pt-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs text-sf-text-2">{{ $t("avatarRatio") }}</span>
              <button
                type="button"
                class="cursor-pointer text-xs text-sf-text-2 transition-colors hover:text-sf-theme"
                :class="{ 'text-sf-theme!': avatar.ratio === 'theme' }"
                @click="setAvatarValue('ratio', 'theme')"
              >{{ $t("followTheme") }}</button>
            </div>
            <div class="flex flex-wrap gap-3">
              <SfButton
                v-for="option in ratioOptions"
                :key="option.value"
                size="small"
                border
                :type="avatar.ratio === option.value ? 'theme' : 'bg'"
                @click="setAvatarValue('ratio', option.value)"
              >{{ option.name }}</SfButton>
            </div>
            <div v-if="avatar.ratio === 'custom'" class="grid grid-cols-2 gap-3">
              <SfInputNumber
                :model-value="avatar.customRatioWidth"
                :min="1"
                :max="20"
                @update:model-value="setAvatarValue('customRatioWidth', $event)"
              />
              <SfInputNumber
                :model-value="avatar.customRatioHeight"
                :min="1"
                :max="20"
                @update:model-value="setAvatarValue('customRatioHeight', $event)"
              />
            </div>
          </div>
          <div class="flex flex-col gap-3 border-t border-sf-b pt-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs text-sf-text-2">{{ $t("avatarShape") }}</span>
              <button
                type="button"
                class="cursor-pointer text-xs text-sf-text-2 transition-colors hover:text-sf-theme"
                :class="{ 'text-sf-theme!': avatar.shape === 'theme' }"
                @click="setAvatarShape('theme')"
              >{{ $t("followTheme") }}</button>
            </div>
            <div class="flex flex-wrap gap-3">
              <SfButton
                v-for="option in shapeOptions"
                :key="option.value"
                size="small"
                border
                :type="avatar.shape === option.value ? 'theme' : 'bg'"
                @click="setAvatarShape(option.value)"
              >{{ option.name }}</SfButton>
            </div>
            <div v-if="avatar.shape === 'custom'" class="flex items-center gap-3">
              <SfSlider
                :model-value="avatarRadius"
                :min="AVATAR_RADIUS_LIMITS.min"
                :max="AVATAR_RADIUS_LIMITS.max"
                :step="1"
                size="small"
                @update:model-value="setAvatarValue('borderRadius', $event)"
              />
              <div class="w-27 shrink-0">
                <SfInputNumber
                  :model-value="avatarRadius"
                  :min="AVATAR_RADIUS_LIMITS.min"
                  :max="AVATAR_RADIUS_LIMITS.max"
                  :step="1"
                  size="small"
                  @update:model-value="setAvatarValue('borderRadius', $event)"
                />
              </div>
              <span class="text-xs text-sf-text-2">%</span>
            </div>
          </div>
          <div class="flex flex-col gap-3 border-t border-sf-b pt-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs text-sf-text-2">{{ $t("avatarSize") }}</span>
              <button
                type="button"
                class="cursor-pointer text-xs text-sf-text-2 transition-colors hover:text-sf-theme"
                :class="{ 'text-sf-theme!': avatar.width === null }"
                @click="setAvatarValue('width', null)"
              >{{ $t("followTheme") }}</button>
            </div>
            <div class="flex items-center gap-3">
              <SfSlider
                :model-value="avatarWidth"
                :min="AVATAR_WIDTH_LIMITS.min"
                :max="AVATAR_WIDTH_LIMITS.max"
                :step="1"
                size="small"
                @update:model-value="setAvatarValue('width', $event)"
              />
              <div class="w-27 shrink-0">
                <SfInputNumber
                  :model-value="avatarWidth"
                  :min="AVATAR_WIDTH_LIMITS.min"
                  :max="AVATAR_WIDTH_LIMITS.max"
                  :step="1"
                  size="small"
                  @update:model-value="setAvatarValue('width', $event)"
                />
              </div>
              <span class="text-xs text-sf-text-2">px</span>
            </div>
          </div>
        </div>
      </template>
    </SfDropdown>
  </span>
</template>
