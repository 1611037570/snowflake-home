<template>
  <el-col :span="getSpan(form.span)">
    <el-form-item :label="form.label" :prop="form.model?.path" label-position="top">
      <template #label>
        <div class="flex h-full w-full items-center font-bold" @click.stop="">
          <span>
            {{ form.label }}
          </span>
          <sf-tooltip :content="form.tip" v-if="form.tip" />
        </div>
      </template>
      <slot />
    </el-form-item>
  </el-col>
</template>

<script setup lang="ts">
defineProps<{
  form: any
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
