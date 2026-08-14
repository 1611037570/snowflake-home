<template>
  <div class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow">
    <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">{{ value }}</div>
    <div class="text-sm text-gray-500">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({ value: [String, Number], label: String });
</script>
