<template>
  <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
    <div v-for="(item, key) in stats" :key="key" class="rounded-lg bg-black/20 p-4 text-center">
      <p class="text-sm text-blue-200">{{ item.label }}</p>
      <p class="text-lg font-bold text-white">{{ item.value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    required: true,
  },
});
</script>
