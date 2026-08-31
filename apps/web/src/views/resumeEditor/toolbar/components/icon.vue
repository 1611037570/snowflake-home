<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

defineProps({
  icon: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  size: {
    default: 6,
  },
});

const emit = defineEmits(["onClick"]);

// 是否展示工具名称：由系统设置的「显示工具栏工具名称」控制
const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);
</script>

<template>
  <SfTooltip :content="content" placement="left" :disabled="system.showToolName">
    <div class="flex flex-col items-center gap-1">
      <SfIcon
        :icon="icon"
        :size="size"
        boxSize="8"
        class="rounded-full bg-sf-bg-2 text-sf-base transition-all duration-400 hover:scale-115 hover:bg-sf-theme-2 hover:text-sf-theme-text"
        @click="emit('onClick')"
      />
      <span v-if="system.showToolName" class="max-w-[45px] truncate text-[9px] text-sf-text-2">{{
        content
      }}</span>
    </div>
  </SfTooltip>
</template>

<style lang="scss" scoped></style>
