<script setup>
// 工具栏「样式疑问」：悬停提示疑问，点击确认后切换到标准 A4 查看真实排版
import { $t } from "@/locales";

const emit = defineEmits(["standardA4"]);
const { proxy } = getCurrentInstance();

// 点击打开确认框：说明小比例预览的观感差异来自缩放，确认即切到标准 A4
const openStyleHint = () => {
  proxy
    .$confirm($t("styleHintContent"), $t("styleHintHover"))
    .then(() => emit("standardA4"))
    // 取消：保持当前缩放模式
    .catch(() => undefined);
};
</script>

<template>
  <!-- 工具栏入口：图标尺寸与其它入口一致 -->
  <SfTooltip :content="$t('styleHintHover')">
    <SfIcon
      icon="mingcute:question-line"
      size="5"
      boxSize="7"
      class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      @click="openStyleHint"
    />
  </SfTooltip>
</template>
