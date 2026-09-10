<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { uiParamRanges } from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 页边距调整值统一使用数值类型
const padding = computed({
  get: () => Number(currentUI.value.padding),
  set: (value) => {
    currentUI.value.padding = Number(value);
  },
});
</script>

<template>
  <SfDropdown trigger="hover" placement="bottom-start" :show-arrow="false">
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
          <span>页边距</span>
          <span>{{ padding }}px</span>
        </div>
        <SfSlider
          v-model="padding"
          :min="uiParamRanges.padding.min"
          :max="uiParamRanges.padding.max"
          :step="uiParamRanges.padding.step"
          size="small"
        />
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
