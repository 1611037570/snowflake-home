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
    default: 6,
  },
  active: {
    type: Boolean, // 是否显示工具入口激活状态。
    default: false, // 默认保持普通状态。
  },
});

const emit = defineEmits(["onClick"]);
</script>

<template>
  <SfTooltip :content="content" placement="left">
    <div class="flex items-center">
      <SfIcon
        :icon="icon"
        :size="size"
        boxSize="9"
        class="rounded-xl border bg-transparent transition-all duration-300 hover:scale-105 hover:border-sf-theme hover:text-sf-theme active:scale-95"
        :class="active ? 'border-sf-theme text-sf-theme' : 'border-transparent text-sf-text-2'"
        @click="emit('onClick')"
      />
    </div>
  </SfTooltip>
</template>

<style lang="scss" scoped></style>
