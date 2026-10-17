<script setup>
defineProps({
  label: { type: String, required: true }, // 数值设置项名称
  modelValue: { type: Number, required: true }, // 当前数值
  min: { type: Number, required: true }, // 允许的最小值
  max: { type: Number, required: true }, // 允许的最大值
  step: { type: Number, required: true }, // 单次调整步长
  unit: { type: String, default: "" }, // 数值单位
});

defineEmits(["update:modelValue", "reset"]);
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3 text-sm text-sf-text-2">
      <span>{{ label }}</span>
      <SfIcon
        icon="material-symbols:restart-alt"
        size="4"
        class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
        @click="$emit('reset')"
      />
    </div>
    <div class="flex items-center gap-3">
      <SfSlider
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        size="small"
        @update:model-value="$emit('update:modelValue', $event)"
      />
      <div class="w-27 shrink-0">
        <SfInputNumber
          :model-value="modelValue"
          :min="min"
          :max="max"
          :step="step"
          :aria-label="label"
          size="small"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </div>
      <span v-if="unit" class="shrink-0 text-sm text-sf-text-2">{{ unit }}</span>
    </div>
  </div>
</template>
