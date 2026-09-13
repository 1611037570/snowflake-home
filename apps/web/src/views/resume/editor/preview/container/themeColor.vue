<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 通过独立计算属性绑定主题色，避免嵌套修改可写计算属性引发递归更新
const themeColor = computed({
  get: () => currentUI.value?.themeColor || "",
  set: (value) => {
    if (currentUI.value && currentUI.value.themeColor !== value) {
      currentUI.value.themeColor = value;
    }
  },
});
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="hover"
    placement="bottom-start"
    :show-arrow="false"
  >
    <SfTooltip :content="`主题颜色`">
      <div
        class="box-border h-7 w-7 cursor-pointer rounded-full border-3 border-sf-b bg-sf-theme-2"
        :style="{ backgroundColor: themeColor }"
      ></div>
    </SfTooltip>
    <template #dropdown>
      <div class="rounded-3xl border border-sf-b bg-sf-primary p-3">
        <ThemeColorPicker v-model="themeColor" />
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
