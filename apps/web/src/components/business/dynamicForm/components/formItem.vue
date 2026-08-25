<template>
  <el-col :span="getSpan(currentForm.span)">
    <SfFormItem
      class="w-full"
      :label="currentForm.label"
      :prop="getProp(currentForm)"
      :rules="currentForm.rules"
      :tip="currentForm.tip"
    >
      <slot />
    </SfFormItem>
  </el-col>
</template>

<script setup lang="ts">
defineProps<{
  currentForm: any;
}>();
const DEFAULT_SPAN = 24;
// 由数据绑定路径推导 el-form 校验 prop（含数组通配 "?" 的暂不支持校验定位）
const getProp = (currentForm: any) => {
  const model = Array.isArray(currentForm.model) ? currentForm.model[0] : currentForm.model;
  const source = model?.source;
  return Array.isArray(source) && !source.includes("?") ? source.join(".") : undefined;
};
// 处理span值
const getSpan = (span: number | string | undefined) => {
  // 转换为数字
  const num = Number(span);
  // 无效值返回默认值
  if (isNaN(num)) return DEFAULT_SPAN;
  // 小于1返回默认值
  if (num < 1) return DEFAULT_SPAN;
  // 超出范围则取最大24
  if (num > DEFAULT_SPAN) return DEFAULT_SPAN;
  return num;
};
</script>

<style scoped></style>
