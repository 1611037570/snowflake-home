<template>
  <el-col :span="getSpan(form.span)">
    <el-form-item :label="form.label" :prop="form.data?.path" label-position="top">
      <template #label>
        <div class="flex h-full w-full items-center font-bold">{{ form.label }}</div>
      </template>
      <slot />
    </el-form-item>
  </el-col>
</template>

<script setup lang="ts">
defineProps<{
  form: any
}>()

// 处理span值
const getSpan = (span: number | string | undefined) => {
  // 转换为数字
  const num = Number(span)
  // 无效值返回默认值
  if (isNaN(num)) return 24
  // 小于1返回默认值
  if (num < 1) return 24
  // 超出范围则取最大24
  if (num > 24) return 24
  return num
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  height: 100% !important;
}
</style>
