<script setup>
const props = defineProps({
  activePanel: {
    type: String,
    default: "preview",
  },
});
const emit = defineEmits(["select"]);
const panelOptions = [
  { value: "edit", label: "编辑", icon: "lucide:file-text" },
  { value: "preview", label: "预览", icon: "lucide:eye" },
];
</script>

<template>
  <nav
    class="relative z-30 flex shrink-0 items-center gap-1 self-center rounded-3xl border border-sf-b bg-sf-primary p-1"
    :style="{ marginBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }"
    aria-label="简历工作区"
  >
    <!-- 底部切换只控制编辑与预览面板。 -->
    <button
      v-for="option in panelOptions"
      :key="option.value"
      type="button"
      class="flex h-8 w-18 items-center justify-center gap-1 rounded-2xl px-2 text-xs transition-colors"
      :class="
        props.activePanel === option.value ? 'bg-sf-theme text-sf-theme-text' : 'text-sf-text-2'
      "
      :aria-pressed="props.activePanel === option.value"
      @click="emit('select', option.value)"
    >
      <SfIcon :icon="option.icon" size="4" />
      <span>{{ option.label }}</span>
    </button>
  </nav>
</template>
