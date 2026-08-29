<script setup>
// 撤回/前进：函数占位，后续接入历史记录功能
const handleUndo = () => {};
const handleRedo = () => {};
</script>

<template>
  <div class="flex items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1">
    <SfTooltip content="撤回">
      <SfIcon
        icon="lucide:undo-2"
        size="5"
        boxSize="7"
        class="cursor-pointer rounded-full hover:bg-sf-theme-2"
        @click="handleUndo"
      />
    </SfTooltip>
    <SfTooltip content="前进">
      <SfIcon
        icon="lucide:redo-2"
        size="5"
        boxSize="7"
        class="cursor-pointer rounded-full hover:bg-sf-theme-2"
        @click="handleRedo"
      />
    </SfTooltip>
  </div>
</template>

<style scoped></style>
