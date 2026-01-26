<template>
  <div class="flex-c min-h-screen flex-col bg-sf-primary" v-if="showContent">
    <div class="loading-spinner h-16 w-16 animate-spin rounded-full border-l"></div>
    <p class="mt-6 text-lg font-medium">逆转时空的公式就是珍惜现在</p>
  </div>
</template>

<script setup>
const showContent = ref(false)

useTimeoutFn(() => {
  showContent.value = true
}, 500)
</script>

<style scoped>
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0);
  border-left-color: var(--sf-text);
  border-top-color: var(--sf-text);
  border-right-color: var(--sf-text);
}
</style>
