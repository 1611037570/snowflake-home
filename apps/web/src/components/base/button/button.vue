<script setup>
const props = defineProps({
  type: {
    type: String,
    default: "primary",
  },
  border: {
    type: Boolean,
    default: false,
  },
});
const isBorder = computed(() => (props.border ? "border border-sf-b" : ""));
</script>

<template>
  <div
    class="flex cursor-pointer items-center justify-center rounded-3xl bg-sf-theme px-3 py-2 text-sm text-sf-theme-text transition-all duration-300 hover:bg-sf-theme-2 active:scale-98"
    :class="isBorder"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped></style>
