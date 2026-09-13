<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { uiParamRanges } from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 字体大小调整值统一使用数值类型
const fontSize = computed({
  get: () => Number(currentUI.value.fontSize),
  set: (value) => {
    currentUI.value.fontSize = Number(value);
  },
});
</script>

<template>
  <SfDropdown trigger="hover" placement="bottom-start" :show-arrow="false">
    <SfTooltip content="字体大小">
      <SfIcon
        icon="lucide:type"
        size="5"
        boxSize="7"
        class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      />
    </SfTooltip>
    <template #dropdown>
      <div class="w-[216px] rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="mb-3 flex items-center justify-between text-sm text-sf-text-2">
          <span>字体大小</span>
          <span>{{ fontSize }}px</span>
        </div>
        <SfSlider
          v-model="fontSize"
          :min="uiParamRanges.fontSize.min"
          :max="uiParamRanges.fontSize.max"
          :step="uiParamRanges.fontSize.step"
          size="small"
        />
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
