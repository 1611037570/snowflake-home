<template>
  <el-col :class="{ 'dynamic-form-muted': hiddenState }" :span="getSpan(currentForm.span)">
    <SfFormItem
      :class="['w-full', { 'module-selected-blink': selected }]"
      :label="currentForm.label"
      :prop="getProp(currentForm)"
      :rules="currentForm.rules"
      :tip="currentForm.tip"
    >
      <template #label>
        <div class="mb-1 flex h-5 w-full items-center text-sf-base" @click.stop.prevent="">
          <div class="flex flex-1 items-center">
            <span class="pr-1 pl-2 text-[15px] text-sf-text">
              {{ currentForm.label }}
            </span>
            <sf-tooltip :content="currentForm.tip" v-if="currentForm.tip" class="text-sf-text" />
          </div>
          <button
            v-if="currentForm.ui?.hidden"
            type="button"
            class="flex items-center"
            @pointerdown.stop.prevent
            @click.stop.prevent="toggleHidden"
          >
            <SfIcon
              :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
              size="4"
              class="pointer-events-none cursor-pointer hover:text-sf-theme"
            />
          </button>
        </div>
      </template>
      <slot />
    </SfFormItem>
  </el-col>
</template>

<script setup lang="ts">
import { resolveDataPath, type DataPathContext } from "../code/pathContext";
import { getPrimaryModelBinding } from "../code/schemaAccess";

const { pathContext, hidden, hiddenState } = defineProps<{
  currentForm: any;
  selected?: boolean;
  hidden?: boolean;
  hiddenState?: boolean;
  pathContext?: DataPathContext;
}>();
const emit = defineEmits<{
  "update:hidden": [value: boolean];
}>();
const DEFAULT_SPAN = 24;
// 切换表单项隐藏状态并写回数据
const toggleHidden = () => emit("update:hidden", !hidden);
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
