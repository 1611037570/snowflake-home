<script setup>
import { computed, useSlots } from "vue";
import { getInfoSeparatorMark } from "@/stores/modules/resume/uiConfig";
import ResumeField from "./resumeField/index.vue";
import { useResumePreviewContext } from "../previewContext";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const {
  theme: { fontValue, infoSeparator },
} = useResumePreviewContext();
const slots = useSlots();
const separatorMark = computed(() => getInfoSeparatorMark(infoSeparator.value));

// 每项保持行内元素，让文字按可用宽度自然续行。
// 统一过滤空字段，避免切换分隔符后产生多余符号。
const infoItems = computed(() =>
  props.items
    .map((item) => (typeof item === "object" && item !== null ? item : { value: item }))
    .filter((item) => (slots.default ? Boolean(item) : String(item.value ?? "").trim())),
);
</script>

<template>
  <span class="max-w-full min-w-0">
    <template
      v-for="(item, index) in infoItems"
      :key="item.key || index"
    >
      <span
        v-if="index"
        class="text-sf-text-3"
        :class="separatorMark ? 'mx-3' : 'inline-block w-3'"
        aria-hidden="true"
      >
        {{ separatorMark }}
      </span>
      <slot v-if="$slots.default" :item="item" />
      <span
        v-else
        :class="{ 'font-bold': item.emphasis }"
        :style="item.emphasis ? fontValue(1) : undefined"
      >
        <ResumeField inline :model-value="item.value" />
      </span>
    </template>
  </span>
</template>

<style lang="scss" scoped></style>
