<template>
  <div class="h-full w-full">
    <div class="flex-c h-full w-full flex-col bg-sf-primary" v-if="showContent">
      <div class="loading-spinner h-16 w-16 animate-spin rounded-full border-l"></div>
      <p class="mt-6 text-lg font-medium">{{ $t('load') }}</p>
    </div>
  </div>
</template>

<script setup>
const showContent = ref(false)

useTimeoutFn(() => {
  showContent.value = true
}, 100)
</script>

<style scoped>
.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0);
  border-left-color: var(--sf-text);
  border-top-color: var(--sf-text);
  border-right-color: var(--sf-text);
}
</style>
