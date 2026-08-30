<script setup>
import { useResumeStore } from "@/stores/modules/resume";
import { computed } from "vue";

// 撤回/前进：调用 store 历史记录
const resumeStore = useResumeStore();
// 无可撤回/可前进内容时禁用
const canUndo = computed(() => resumeStore.undoStack.length > 0);
const canRedo = computed(() => resumeStore.redoStack.length > 0);
const handleUndo = () => {
  resumeStore.undo();
};
const handleRedo = () => {
  resumeStore.redo();
};
</script>

<template>
  <div class="flex items-center gap-1">
    <SfTooltip content="撤回">
      <SfIcon
        icon="lucide:undo-2"
        size="4"
        boxSize="7"
        :class="[
          'rounded-full',
          canUndo ? 'cursor-pointer hover:bg-sf-theme-2' : 'cursor-not-allowed opacity-40',
        ]"
        @click="canUndo && handleUndo()"
      />
    </SfTooltip>
    <SfTooltip content="前进">
      <SfIcon
        icon="lucide:redo-2"
        size="4"
        boxSize="7"
        :class="[
          'rounded-full',
          canRedo ? 'cursor-pointer hover:bg-sf-theme-2' : 'cursor-not-allowed opacity-40',
        ]"
        @click="canRedo && handleRedo()"
      />
    </SfTooltip>
  </div>
</template>

<style scoped></style>
