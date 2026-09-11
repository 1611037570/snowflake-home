<template>
  <el-col :class="{ 'dynamic-form-muted': muted }" :span="getSpan(currentForm.span)">
    <SfFormItem
      :class="['w-full', { 'module-selected-blink': selected }]"
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
import { resolveDataPath, type DataPathContext } from "../code/pathContext";
import { getPrimaryModelBinding } from "../code/schemaAccess";

const { pathContext } = defineProps<{
  currentForm: any;
  selected?: boolean;
  muted?: boolean;
  pathContext?: DataPathContext;
}>();
const DEFAULT_SPAN = 24;
// 由当前上下文中的完整数据绑定路径推导表单校验属性
const getProp = (currentForm: any) => {
  const source = getPrimaryModelBinding(currentForm)?.source;
  return Array.isArray(source) ? resolveDataPath(source, pathContext).join(".") : undefined;
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

<style scoped>
/* 表单控制项置灰时统一应用灰度效果 */
.dynamic-form-muted {
  filter: grayscale(1);
}

.dynamic-form-muted :deep(.el-collapse),
.dynamic-form-muted :deep(.el-collapse-item__header),
.dynamic-form-muted :deep(.el-collapse-item__wrap) {
  color: var(--color-sf-text-3) !important;
}
/* 选中模块：边框持续闪烁提示 */
.module-selected-blink {
  position: relative;
}
.module-selected-blink::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  border: 2px dashed var(--color-sf-theme);
  border-radius: 12px;
  pointer-events: none;
  content: "";
}
</style>
