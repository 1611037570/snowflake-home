<script setup>
import { computed } from "vue";

defineOptions({ name: "SalaryRange" });

const modelValue = defineModel("modelValue", {
  type: String,
  default: "",
});

const parseRange = (value) => {
  const match = typeof value === "string" ? value.match(/^(\d+)k-(?:(\d+)k)?$/) : null;
  return match ? { minimum: match[1], maximum: match[2] ?? "" } : { minimum: "", maximum: "" };
};

const range = computed(() => parseRange(modelValue.value));
const minimumOptions = Array.from({ length: 200 }, (_, index) => {
  const value = String(index + 1);
  return { name: `${value}k`, value };
});
const maximumOptions = computed(() => {
  const minimum = Number(range.value.minimum);
  if (!minimum) return [];
  return Array.from({ length: Math.min(5, 200 - minimum) }, (_, index) => {
    const value = String(minimum + index + 1);
    return { name: `${value}k`, value };
  });
});

// 薪资区间统一保存为可直接展示的文本，最高薪资始终跟随最低薪资范围。
const minimum = computed({
  get: () => range.value.minimum,
  set: (value) => {
    if (!value) {
      modelValue.value = "";
      return;
    }
    const maximumValue = Number(range.value.maximum);
    const nextMinimumValue = Number(value);
    const hasValidMaximum = maximumValue > nextMinimumValue && maximumValue <= Math.min(200, nextMinimumValue + 5);
    const maximum = hasValidMaximum ? range.value.maximum : "";
    modelValue.value = maximum ? `${value}k-${maximum}k` : `${value}k-`;
  },
});

const maximum = computed({
  get: () => range.value.maximum,
  set: (value) => {
    modelValue.value = value ? `${range.value.minimum}k-${value}k` : `${range.value.minimum}k-`;
  },
});
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <SfSelect
      v-model="minimum"
      :list="minimumOptions"
      filterable
      clearable
      :placeholder="$t('salaryMinimum')"
      class="min-w-0 flex-1"
    />
    <span class="shrink-0 text-sm text-sf-text-3">{{ $t("salaryRangeSeparator") }}</span>
    <SfSelect
      v-model="maximum"
      :list="maximumOptions"
      :disabled="!minimum"
      filterable
      clearable
      :placeholder="$t('salaryMaximum')"
      class="min-w-0 flex-1"
    />
  </div>
</template>
