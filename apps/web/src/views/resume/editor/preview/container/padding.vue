<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { uiParamRanges } from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 上下边距调整值统一使用数值类型
const paddingVertical = computed({
  get: () => Number(currentUI.value.paddingVertical),
  set: (value) => {
    currentUI.value.paddingVertical = Number(value);
  },
});

// 左右边距调整值统一使用数值类型
const paddingHorizontal = computed({
  get: () => Number(currentUI.value.paddingHorizontal),
  set: (value) => {
    currentUI.value.paddingHorizontal = Number(value);
  },
});
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <SfTooltip content="页边距">
      <SfIcon
        icon="lucide:expand"
        size="5"
        boxSize="7"
        class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      />
    </SfTooltip>
    <template #dropdown>
      <div class="w-[216px] rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="mb-3 flex items-center justify-between text-sm text-sf-text-2">
          <span>上下边距</span>
          <span>{{ paddingVertical }}px</span>
        </div>
        <SfSlider
          v-model="paddingVertical"
          :min="uiParamRanges.paddingVertical.min"
          :max="uiParamRanges.paddingVertical.max"
          :step="uiParamRanges.paddingVertical.step"
          size="small"
        />
        <div class="mt-3 mb-3 flex items-center justify-between text-sm text-sf-text-2">
          <span>左右边距</span>
          <span>{{ paddingHorizontal }}px</span>
        </div>
        <SfSlider
          v-model="paddingHorizontal"
          :min="uiParamRanges.paddingHorizontal.min"
          :max="uiParamRanges.paddingHorizontal.max"
          :step="uiParamRanges.paddingHorizontal.step"
          size="small"
        />
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
