<template>
  <el-form-item :label="form.label" :prop="form.data?.path">
    <template #label>
      <div class="flex h-full w-full items-center font-bold">{{ form.label }}</div>
    </template>
    <slot />
  </el-form-item>
</template>

<script setup lang="ts">
defineProps<{
  form: any
}>()
</script>

<style scoped>
:deep(.el-form-item__label) {
  height: 100% !important;
}
</style>
