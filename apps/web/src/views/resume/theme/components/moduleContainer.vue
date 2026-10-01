<script setup lang="ts">
import { computed } from "vue";
import { getThemeModuleStyle } from "@/views/resume/theme";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps<{
  moduleKey: string;
  moduleClass?: string;
}>();
const emit = defineEmits<{
  mouseenter: [moduleKey: string];
}>();

const {
  theme: { moduleTemplate, themeColor, themeColorLine },
} = useResumePreviewContext();
const isOutlineModule = computed(
  () => getThemeModuleStyle(moduleTemplate.value).frame === "outline" && props.moduleKey !== "user",
);
// 左侧细线由模块外壳绘制，跨页时跟随每页模块分片延伸。
const isLeftLineModule = computed(
  () =>
    getThemeModuleStyle(moduleTemplate.value).frame === "leftLine" && props.moduleKey !== "user",
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
    <div
      v-if="isLeftLineModule"
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 border-l"
      :style="{ borderColor: themeColorLine }"
    />
    <slot />
  </div>
</template>
