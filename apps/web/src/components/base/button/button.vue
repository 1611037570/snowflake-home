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
});
const isBorder = computed(() => (props.border ? "border border-sf-b" : ""));
const isRound = computed(() => (props.round ? "rounded-3xl" : "rounded-xl"));
const plainClassObj = {
  error: "bg-sf-error-2 text-sf-error hover:bg-sf-error hover:text-white",
  theme: "bg-sf-theme-3 text-sf-theme hover:bg-sf-theme hover:text-white",
};
const classObj = {
  error: "",
  theme: "bg-sf-theme text-sf-theme-text hover:bg-sf-theme-2",
};
const getClass = computed(() => {
  return props.plain ? plainClassObj[props.type] : classObj[props.type];
});
</script>

<template>
  <div
    class="flex cursor-pointer items-center justify-center px-3 py-2 text-sm transition-all duration-300 active:scale-98"
    :class="[isBorder, getClass, isRound]"
  >
    <SfIcon v-if="icon" :icon="icon" size="4" class="mr-1" />
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped></style>
