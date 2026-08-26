<script setup>
defineProps({
  icon: {
    type: String,
    default: "iconamoon:settings-fill",
  },
  content: {
    type: String,
    default: "系统设置",
  },
});

defineEmits(["click"]);
</script>

<template>
  <SfTooltip :content="content" placement="left">
    <SfIcon
      :icon="icon"
      size="6"
      boxSize="8"
      class="rounded-full bg-sf-bg-2 text-sf-text-2 transition-all duration-400 hover:scale-115 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      @click="emit('click')"
    />
  </SfTooltip>
</template>

<style lang="scss" scoped></style>
