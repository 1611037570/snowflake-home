<script setup>
import { computed } from "vue";
import { themeColors } from "@/domain/resume/theme/uiConfig";

const props = defineProps({
  label: { type: String, required: true }, // 自定义取色入口名称
});

const modelValue = defineModel("modelValue", {
  type: String,
  default: "",
});

const normalizeColor = (value) => String(value || "").toLowerCase();
// 非预设颜色使用当前颜色展示，并通过主题色边框标明自定义状态。
const isCustomColor = computed(() =>
  Boolean(modelValue.value) && !themeColors.some(
    (item) => normalizeColor(item.value) === normalizeColor(modelValue.value),
  ),
);
const customColorStyle = computed(() => ({
  background: isCustomColor.value
    ? modelValue.value
    : "conic-gradient(var(--sf-error), var(--sf-warning), var(--sf-success), var(--sf-info), var(--sf-theme), var(--sf-error))",
}));
</script>

<template>
  <ElPopover
    trigger="click"
    placement="bottom-end"
    :teleported="false"
    :popper-style="{ width: 'auto', padding: '0' }"
  >
    <template #reference>
      <button
        type="button"
        class="flex cursor-pointer items-center gap-1 rounded-full border border-sf-b p-1 text-sm text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        :class="{ 'border-2 border-sf-theme': isCustomColor }"
        :title="props.label"
        :aria-label="props.label"
        :aria-pressed="isCustomColor"
      >
        <SfIcon icon="lucide:palette" size="4" />
        <span>{{ props.label }}</span>
        <!-- 右侧色点放大展示当前自定义颜色，未选择时保留彩色提示。 -->
        <span class="h-4 w-4 shrink-0 rounded-full border border-sf-b" :style="customColorStyle" />
      </button>
    </template>
    <el-color-picker-panel v-model="modelValue" color-format="hex" />
  </ElPopover>
</template>
