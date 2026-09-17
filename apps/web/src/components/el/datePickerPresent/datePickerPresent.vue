<template>
  <SfDatePicker
    v-model="innerValue"
    v-bind="$attrs"
    :shortcuts="shortcuts"
    popper-class="date-picker-present-popper"
  />
</template>

<script setup lang="ts">
import SfDatePicker from "../datePicker";

defineOptions({ name: "SfDatePickerPresent", inheritAttrs: false });

const props = defineProps<{
  // 快捷项文案，传入后面板左侧栏显示该快捷项用于标记"持续至今"
  presentText?: string;
}>();

const model = defineModel<any>("modelValue");

// 标记本次变更来自快捷项
let byPresent = false;

const isPresent = computed(() => Boolean(props.presentText) && model.value === props.presentText);

// 面板左侧栏快捷项
const shortcuts = computed(() =>
  props.presentText
    ? [
        {
          text: props.presentText,
          value: () => {
            byPresent = true;
            return new Date();
          },
        },
      ]
    : [],
);

// element-plus 无法解析快捷项文案，对内以空值呈现
const innerValue = computed({
  get: () => (isPresent.value ? "" : model.value),
  set: (val: any) => {
    if (byPresent) {
      byPresent = false;
      if (val) {
        model.value = props.presentText;
        return;
      }
    }
    model.value = val;
  },
});
</script>

<style lang="scss">
/* 快捷项由面板侧栏移至底部，面板宽度同步恢复为无侧栏时的宽度 */
.date-picker-present-popper .el-picker-panel.el-date-picker.has-sidebar {
  width: 322px;
}

.date-picker-present-popper .el-picker-panel__body-wrapper {
  display: flex;
  flex-direction: column;
}

.date-picker-present-popper .el-picker-panel__sidebar {
  position: static;
  order: 1;
  display: flex;
  gap: 12px;
  width: auto;
  padding-bottom: 6px;
  border-right: none;
  border-top: 1px solid var(--sf-border);
}

.date-picker-present-popper .el-picker-panel__sidebar + .el-picker-panel__body {
  margin-left: 0;
}

.date-picker-present-popper .el-picker-panel__shortcut {
  width: auto;
}
</style>
