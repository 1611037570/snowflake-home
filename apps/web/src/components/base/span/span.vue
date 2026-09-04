<script setup>
defineOptions({ name: "SfSpan" });
const props = defineProps({
  active: { type: Boolean, default: false },
  // 下划线高度
  underlineHeight: { type: Number, default: 0.5 },
});
const height = computed(() => `${props.underlineHeight * 4}px`);
</script>
<template>
  <span
    :class="[active ? 'text-sf-theme' : '']"
    class="group flex-c relative cursor-pointer transition-all duration-200 hover:text-sf-theme"
  >
    <slot />
    <!-- 悬停下划线动画 -->
    <span
      class="absolute -bottom-1 left-1/2 w-0 -translate-x-1/2 rounded-full bg-sf-theme ease-out group-hover:w-full"
      :class="[active ? 'w-full' : '']"
      :style="{ height: height }"
    ></span>
  </span>
</template>

<style lang="scss" scoped></style>
