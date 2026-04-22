<template>
  <el-col :span="getSpan(currentForm.span)">
    <el-form-item
      class="w-full"
      :label="currentForm.label"
      :prop="currentForm.model?.path"
      label-position="top"
    >
      <template #label v-if="currentForm.label">
        <div class="mb-1 flex h-5 w-full items-center font-bold text-sf-base" @click.stop="">
          <span class="pr-1">
            {{ currentForm.label }}
          </span>
          <sf-tooltip :content="currentForm.tip" v-if="currentForm.tip" />
        </div>
      </template>
      <slot />
    </el-form-item>
  </el-col>
</template>

<script setup lang="ts">
defineProps<{
  currentForm: any
}>()
const DEFAULT_SPAN = 24
// 处理span值
const getSpan = (span: number | string | undefined) => {
  // 转换为数字
  const num = Number(span)
  // 无效值返回默认值
  if (isNaN(num)) return DEFAULT_SPAN
  // 小于1返回默认值
  if (num < 1) return DEFAULT_SPAN
  // 超出范围则取最大24
  if (num > DEFAULT_SPAN) return DEFAULT_SPAN
  return num
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  height: 100% !important;
}
</style>
