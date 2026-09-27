<script setup>
import { computed } from "vue";

defineOptions({ name: "SalaryRange" });

const modelValue = defineModel("modelValue", {
  type: String,
  default: "",
});

const parseRange = (value) => {
  if (typeof value !== "string") return { minimum: "", maximum: "" };
  const aboveMatch = value.match(/^(.+?)k以上$/);
  if (aboveMatch) return { minimum: aboveMatch[1], maximum: "" };
  const rangeMatch = value.match(/^(.+?)k-(?:(.+?)k)?$/);
  return rangeMatch
    ? { minimum: rangeMatch[1], maximum: rangeMatch[2] ?? "" }
    : { minimum: "", maximum: "" };
};

const normalizeAmount = (value) => String(value ?? "").trim().replace(/k$/i, "").trim();
const range = computed(() => parseRange(modelValue.value));
const salarySteps = [
  ...Array.from({ length: 200 }, (_, index) => index + 1),
  250,
  300,
  400,
  500,
  800,
  1000,
  1500,
  2000,
];
const minimumOptions = salarySteps.map((step) => {
  const value = String(step);
  return { name: `${value}k${step >= 200 ? "以上" : ""}`, value };
});
const maximumOptions = computed(() => {
  const minimum = Number(normalizeAmount(range.value.minimum));
  if (!minimum || minimum >= 200) return [];
  return salarySteps
    .filter((step) => step > minimum)
    .slice(0, 5)
    .map((step) => ({ name: `${step}k`, value: String(step) }));
});

// 薪资区间统一保存为可直接展示的文本，最高薪资始终跟随最低薪资范围。
const minimum = computed({
  get: () => normalizeAmount(range.value.minimum),
  set: (value) => {
    const amount = normalizeAmount(value);
    if (!amount) {
      modelValue.value = "";
      return;
    }
    const minimumValue = Number(amount);
    if (!Number.isFinite(minimumValue) || minimumValue <= 0) {
      modelValue.value = "";
      return;
    }
    if (Number.isFinite(minimumValue) && minimumValue >= 200) {
      modelValue.value = `${amount}k以上`;
      return;
    }
    const maximum = normalizeAmount(range.value.maximum);
    const hasValidMaximum = Number.isFinite(Number(maximum)) && Number(maximum) > minimumValue;
    modelValue.value = hasValidMaximum ? `${amount}k-${maximum}k` : `${amount}k-`;
  },
});

const maximum = computed({
  get: () => normalizeAmount(range.value.maximum),
  set: (value) => {
    const minimumValue = normalizeAmount(range.value.minimum);
    const maximumValue = normalizeAmount(value);
    if (!maximumValue) {
      modelValue.value = `${minimumValue}k-`;
      return;
    }
    if (!Number.isFinite(Number(maximumValue)) || Number(maximumValue) <= Number(minimumValue)) return;
    modelValue.value = `${minimumValue}k-${maximumValue}k`;
  },
});
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <SfSelect
      v-model="minimum"
      :list="minimumOptions"
      filterable
      allow-create
      default-first-option
      clearable
      :placeholder="$t('salaryMinimum')"
      class="min-w-0 flex-1"
    />
    <span
      v-if="!minimum || Number(minimum) < 200"
      class="shrink-0 text-sm text-sf-text-3"
    >
      {{ $t("salaryRangeSeparator") }}
    </span>
    <SfSelect
      v-if="!minimum || Number(minimum) < 200"
      v-model="maximum"
      :list="maximumOptions"
      filterable
      allow-create
      default-first-option
      clearable
      :placeholder="$t('salaryMaximum')"
      class="min-w-0 flex-1"
    >
      <template #empty>
        <span>{{ $t(minimum ? "salaryMaximumEmpty" : "salaryMinimumFirst") }}</span>
      </template>
    </SfSelect>
  </div>
</template>
