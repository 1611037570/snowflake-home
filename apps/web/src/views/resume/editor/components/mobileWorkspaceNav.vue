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
  { value: "preview", label: "resumePreview", icon: "lucide:eye" },
];
</script>

<template>
  <!-- :style="{ marginBottom: 'max(0.75rem,env(safe-area-inset-bottom))' }" -->
  <nav class="relative w-full">
    <div
      class="relative z-30 mx-auto flex w-fit shrink-0 items-center gap-1 self-center rounded-t-3xl border border-sf-b bg-sf-primary p-1"
      :aria-label="$t('resumePreview')"
    >
      <!-- 底部切换只控制编辑与预览面板。 -->
      <button
        v-for="option in panelOptions"
        :key="option.value"
        type="button"
        class="flex h-8 w-20 items-center justify-center gap-1 rounded-2xl px-2 text-xs transition-colors"
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
