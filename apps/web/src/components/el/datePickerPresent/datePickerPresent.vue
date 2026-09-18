<template>
  <SfDatePicker
    v-model="innerValue"
    v-bind="$attrs"
    :class="{ 'is-present': isPresent }"
    :placeholder="isPresent ? presentText : $attrs.placeholder"
    :shortcuts="shortcuts"
    :popper-class="popperClass"
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

// 选中"持续至今"时，面板标记选中态用于高亮快捷项
const popperClass = computed(() =>
  isPresent.value ? "date-picker-present-popper is-present" : "date-picker-present-popper",
);

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
  justify-content: center;
  gap: 12px;
  width: auto;
  padding: 6px 0;
  border-right: none;
  border-top: 1px solid var(--sf-border);
}

.date-picker-present-popper .el-picker-panel__sidebar + .el-picker-panel__body {
  margin-left: 0;
}

/* 快捷项按按钮样式呈现并居中文字 */
.date-picker-present-popper .el-picker-panel__shortcut {
  width: auto;
  padding: 3px 18px;
  line-height: 24px;
  text-align: center;
  color: var(--sf-text);
  background-color: transparent;
  border: 1px solid var(--sf-border);
  border-radius: 12px;
  transition: all 0.2s;
}

.date-picker-present-popper .el-picker-panel__shortcut:hover {
  color: var(--sf-theme);
  background-color: var(--sf-theme-3);
  border-color: var(--sf-theme);
}

/* 当前值为快捷项时高亮，表示已选中 */
.date-picker-present-popper.is-present .el-picker-panel__shortcut {
  color: var(--sf-theme);
  background-color: var(--sf-theme-3);
  border-color: var(--sf-theme);
}

/* 选中"持续至今"时，输入框以正文色显示该文案 */
.el-date-editor.is-present .el-input__inner::placeholder {
  color: var(--sf-text);
}
</style>
