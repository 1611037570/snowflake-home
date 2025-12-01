<template>
  <div class="flex-c min-h-screen flex-col bg-sf-primary">
    <div class="loading-spinner h-16 w-16 animate-spin rounded-full border-l"></div>
    <p class="mt-6 text-lg font-medium text-sf-text">正在加载中...</p>
  </div>
</template>

<script setup></script>

<style scoped>
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0);
  border-left-color: var(--sf-text);
  border-top-color: var(--sf-text);
  border-right-color: var(--sf-text);
}
</style>
