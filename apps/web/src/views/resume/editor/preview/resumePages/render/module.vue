<script setup lang="ts">
import { computed } from "vue";
import { useResumePreviewContext } from "../../shared/previewContext";

const props = defineProps<{
  moduleKey: string;
  moduleClass?: string;
}>();
const emit = defineEmits<{
  mouseenter: [moduleKey: string];
}>();

const {
  theme: { moduleTemplate, themeColor },
} = useResumePreviewContext();
const isOutlineModule = computed(
  () => moduleTemplate.value === "outline" && props.moduleKey !== "user",
);
</script>

<template>
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col rounded-3xl"
    :data-module="moduleKey"
    :class="moduleClass"
    @mouseenter="emit('mouseenter', moduleKey)"
  >
    <div
      v-if="isOutlineModule"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border rounded-none border"
      :style="{ borderColor: themeColor }"
    />
    <slot name="actions" />
    <slot />
  </div>
</template>
