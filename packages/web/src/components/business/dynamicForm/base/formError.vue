<template>
  <el-alert type="error" :title="`${errorMsg}`" :closable="false" show-icon class="mb-4">
    <template #default>
      <pre class="mt-2 overflow-x-auto rounded bg-[#f5f7fa] p-2 text-[12px] text-[#606266]">{{
        JSON.stringify(raw, null, 2)
      }}</pre>
    </template>
  </el-alert>
</template>

<script setup lang="ts">
defineProps<{
  errorMsg: string
  raw: any
}>()
</script>

<style scoped></style>
