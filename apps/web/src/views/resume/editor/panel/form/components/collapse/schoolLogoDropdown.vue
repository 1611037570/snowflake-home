<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import { DEFAULT_SCHOOL_LOGO_APPEARANCE, SCHOOL_LOGO_WIDTH_LIMITS, resolveSchoolLogoSize } from "@/domain/resume/theme/schoolLogo";
import Icon from "../icon.vue";

const resumeStore = useResumeStore();
// 面板仅调整展示大小，比例由上传裁切流程确定。
const logoWidth = computed({
  get: () => resolveSchoolLogoSize(resumeStore.currentUI?.user?.logo).width,
  set: (width) => {
    if (!resumeStore.currentUI) return;
    resumeStore.currentUI.user.logo = {
      ...DEFAULT_SCHOOL_LOGO_APPEARANCE,
      ...resumeStore.currentUI.user.logo,
      width, // 用户选择的校徽展示宽度。
    };
  },
});
</script>

<template>
  <span class="flex items-center" @click.stop @mousedown.stop>
    <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false" :hide-on-click="false">
      <SfTooltip :content="$t('schoolLogoSize')">
        <Icon click-through icon="lucide:settings-2" :aria-label="$t('schoolLogoSize')" aria-haspopup="menu" />
      </SfTooltip>
      <template #dropdown>
        <div class="flex w-72 flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
          <div class="flex items-center justify-between gap-3 text-xs text-sf-text-2">
            <span>{{ $t("schoolLogoSize") }}</span>
            <span>{{ logoWidth }} px</span>
          </div>
          <SfSlider v-model="logoWidth" :min="SCHOOL_LOGO_WIDTH_LIMITS.min" :max="SCHOOL_LOGO_WIDTH_LIMITS.max" :step="1" size="small" />
        </div>
      </template>
    </SfDropdown>
  </span>
</template>
