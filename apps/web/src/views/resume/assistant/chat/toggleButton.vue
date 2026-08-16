<script setup>
defineProps({
  // 按钮文案
  label: {
    type: String,
    required: true,
  },
  // 是否已折叠
  collapsed: {
    type: Boolean,
    required: true,
  },
  // 图标与文字间距
  gap: {
    type: String,
    default: "gap-1.5",
  },
});

const emit = defineEmits(["toggle"]);
</script>

<template>
  <!-- 胶囊折叠切换按钮 -->
  <button
    class="flex cursor-pointer items-center rounded-full border px-2 py-0.5 text-sf font-bold transition-all"
    :class="[
      gap,
      !collapsed
        ? 'border-sf-theme/20 bg-sf-theme/10 text-sf-theme'
        : 'border-sf-border/10 bg-sf-bg-3 text-sf-text-3',
    ]"
    @click="emit('toggle')"
  >
    <span class="tracking-tight">{{ label }}</span>
    <SfIcon
      icon="ph:caret-down-bold"
      size="2"
      class="transition-transform duration-300"
      :class="{ '-rotate-180 opacity-80': !collapsed }"
    />
  </button>
</template>
