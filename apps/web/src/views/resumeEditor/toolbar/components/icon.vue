<script setup>
defineProps({
  icon: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 6,
  },
});

defineEmits(["onClick"]);
</script>

<template>
  <SfTooltip :content="content" placement="left">
    <SfIcon
      :icon="icon"
      :size="size"
      boxSize="8"
      class="rounded-full bg-sf-bg-2 text-sf-text-2 transition-all duration-400 hover:scale-115 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      @click="emit('onClick')"
    />
  </SfTooltip>
</template>

<style lang="scss" scoped></style>
