<script setup>
const props = defineProps({
  activePanel: {
    type: String,
    default: "preview",
  },
});
const emit = defineEmits(["select"]);
const panelOptions = [
  { value: "edit", label: "edit", icon: "lucide:file-text" },
  {
    value: "preview", // 预览面板标识。
    label: "resumePanelPreview", // 底部按钮使用简短的预览文案。
    icon: "lucide:eye", // 预览按钮图标。
  },
];
</script>

<template>
  <!-- :style="{ marginBottom: 'max(0.75rem,env(safe-area-inset-bottom))' }" -->
  <nav class="relative w-full">
    <div
      class="relative z-30 flex w-full shrink-0 items-center justify-center gap-1 border-t border-sf-b bg-sf-primary p-1"
      :aria-label="$t('resumePreview')"
    >
      <!-- 底栏铺满宽度，按钮等分空间并保留圆角与选中样式。 -->
      <button
        v-for="option in panelOptions"
        :key="option.value"
        type="button"
        class="flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-2xl px-2 text-xs transition-colors"
        :class="
          props.activePanel === option.value ? 'bg-sf-theme text-sf-theme-text' : 'text-sf-text-2'
        "
        :aria-pressed="props.activePanel === option.value"
        @click="emit('select', option.value)"
      >
        <SfIcon :icon="option.icon" size="4" />
        <span>{{ $t(option.label) }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped></style>
