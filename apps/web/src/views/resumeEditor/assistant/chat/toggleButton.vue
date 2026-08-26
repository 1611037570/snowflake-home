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
  // 用户消息将折叠图标放在文字左侧并反向旋转
  iconLeft: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle"]);
</script>

<template>
  <!-- 胶囊折叠切换按钮 -->
  <div
    class="flex cursor-pointer items-center gap-1.5 text-[11px] transition-all"
    :class="[collapsed ? 'text-sf-text-3 hover:text-sf-theme-2' : ' text-sf-theme']"
    @click="emit('toggle')"
  >
    <span class="tracking-tight">{{ label }}</span>
    <SfIcon
      icon="ph:caret-down-bold"
      size="2"
      class="transition-transform duration-300"
      :class="{
        'order-first': iconLeft,
        '-rotate-90': collapsed && !iconLeft,
        'rotate-90': collapsed && iconLeft,
      }"
    />
  </div>
</template>
