<script setup>
import { computed, inject, useSlots } from "vue";
import {
  defaultInfoSeparator,
  getInfoSeparatorMark,
} from "@/stores/modules/resume/uiConfig";
import ResumeField from "./resumeField/index.vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const fontValue = inject("fontValue");
const infoSeparator = inject("infoSeparator", computed(() => defaultInfoSeparator));
const slots = useSlots();
const separatorMark = computed(() => getInfoSeparatorMark(infoSeparator.value));

// 统一过滤空字段，避免切换分隔符后产生多余符号。
const infoItems = computed(() =>
  props.items
    .map((item) => (typeof item === "object" && item !== null ? item : { value: item }))
    .filter((item) => (slots.default ? Boolean(item) : String(item.value ?? "").trim())),
);
</script>

<template>
  <div
    class="flex max-w-full min-w-0 flex-wrap items-center"
    :class="separatorMark ? '' : 'gap-3'"
  >
    <div
      v-for="(item, index) in infoItems"
      :key="item.key || index"
      class="flex min-w-0 items-center"
    >
      <span
        v-if="index && separatorMark"
        class="mx-3 shrink-0 text-sf-text-3"
        aria-hidden="true"
      >
        {{ separatorMark }}
      </span>
      <slot v-if="$slots.default" :item="item" />
      <div
        v-else
        :class="{ 'font-bold': item.emphasis }"
        :style="item.emphasis ? fontValue(1) : undefined"
      >
        <ResumeField :model-value="item.value" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
