<script setup>
// 列表筛选栏：平台选择 + 自定义插槽（如状态筛选）+ 记录计数，消除 applicationTable 与 followUpList 的重复
import { getPlatformOptions } from "./utils";

defineProps({
  count: {
    type: Number,
    required: true,
  },
});
const platform = defineModel("platform", { default: "" });
const platformOptions = computed(getPlatformOptions);
</script>

<template>
  <div class="mt-3 flex flex-wrap items-center gap-3">
    <ElFormItem :label="$t('resumeStatisticsPlatform')" prop="platform" class="min-w-[150px] flex-1">
      <SfSelect v-model="platform" clearable :placeholder="$t('resumeStatisticsAllPlatforms')" :list="platformOptions" />
    </ElFormItem>
    <slot />
    <span class="text-xs text-sf-text-2">{{ $t("resumeStatisticsRecordCount", { count }) }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
