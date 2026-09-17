<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "theme",
  },
  plain: {
    type: Boolean,
    default: false,
  },
  round: {
    type: Boolean,
    default: true,
  },
  border: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "",
  },
  // 按 Element Plus 约定提供按钮尺寸
  size: {
    type: String,
    default: "default",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  rightIcon: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["click"]);
// 禁用按钮时不向外派发点击事件。
const handleClick = (event) => {
  if (props.disabled) return;
  emit("click", event);
};
// 按钮边框
const isBorder = computed(() => (props.border ? "border border-sf-b" : ""));
// 按钮圆角
const isRound = computed(() => (props.round ? "rounded-3xl" : "rounded-xl"));
const sizeClassObj = {
  small: "p-1 text-[13px]",
  default: "p-2 text-sm",
  large: "p-3 text-[15px]",
};
const sizeClass = computed(() => sizeClassObj[props.size] || sizeClassObj.default);
const plainClassObj = {
  error: "bg-sf-error-2 text-sf-error hover:bg-sf-error hover:text-white",
  success: "bg-sf-success-2 text-sf-success hover:bg-sf-success hover:text-white",
  theme: "bg-sf-theme-3 text-sf-theme hover:bg-sf-theme hover:text-white",
};
const classObj = {
  error: "",
  success: "bg-sf-success text-white hover:bg-sf-success-2",
  theme: "bg-sf-theme text-sf-theme-text hover:bg-sf-theme-2",
  bg: "bg-sf-bg text-sf-text hover:bg-sf-bg-2",
};
const getClass = computed(() => {
  return props.plain ? plainClassObj[props.type] : classObj[props.type];
});
// 禁用按钮时的样式
const disabledClass = computed(() => (props.disabled ? "cursor-not-allowed! opacity-60" : ""));
const clickClass = computed(() => (props.disabled ? "" : "active:scale-95 hover:scale-105"));
</script>

<template>
  <button
    type="button"
    class="8 flex cursor-pointer items-center justify-center transition-all duration-300"
    :class="[isBorder, getClass, isRound, sizeClass, disabledClass, clickClass]"
    :aria-disabled="props.disabled"
    @click="handleClick"
  >
    <SfIcon v-if="icon" :icon="icon" size="4" class="mr-1" />
    <slot></slot>
    <SfIcon v-if="rightIcon" :icon="rightIcon" size="4" class="ml-1" />
  </button>
</template>

<style lang="scss" scoped></style>
