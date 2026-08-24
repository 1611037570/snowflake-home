<script setup>
// 列表筛选栏：平台选择 + 自定义插槽（如状态筛选）+ 记录计数，消除 applicationTable 与 followUpList 的重复
import { platformOptions } from "./utils";

defineProps({
  count: {
    type: Number,
    required: true,
  },
});
const platform = defineModel("platform", { default: "" });
</script>

<template>
  <div class="mt-3 flex items-center gap-3">
    <ElFormItem label="平台" prop="platform" class="flex-1">
      <SfSelect v-model="platform" clearable placeholder="全部平台" :list="platformOptions" />
    </ElFormItem>
    <slot />
    <span class="text-xs text-sf-text-2">共 {{ count }} 条</span>
  </div>
</template>

<style lang="scss" scoped></style>
