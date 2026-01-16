<script setup>
defineProps({
  list: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <el-scrollbar class="flex flex-row gap-4">
    <div
      class="flex-c w-fit max-w-[260px] flex-col rounded-lg bg-sf-bg-hover px-2 py-1 shadow-sm"
      v-for="(item, index) in list"
      :key="index"
    >
      {{ item }}
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped></style>
